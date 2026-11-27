<?php

namespace App\Http\Controllers;

use App\Models\ComprobantePago;
use App\Models\Lead;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService,
        protected \App\Services\CatalogService $catalogService
    ) {}

    public function store(Request $request, int $id): RedirectResponse
    {
        $lead = Lead::findOrFail($id);

        $request->validate([
            'comprobante' => 'nullable|file|mimes:jpg,jpeg,png,pdf,webp,svg|max:5120',
            'monto' => 'nullable|numeric|min:0',
            'id_interes' => 'nullable|integer|exists:lead_interes,id_interes',
            'metodo_pago' => 'nullable|string|in:TRANSFERENCIA,QR,TARJETA,BILLETERA',
            'referencia_transaccion' => 'nullable|string|max:100',
            'stripe_titular' => 'nullable|string|max:100',
        ]);

        $metodoPago = $request->input('metodo_pago', 'TRANSFERENCIA');
        $referencia = $request->input('referencia_transaccion');
        $archivo = $request->file('comprobante');

        if (!$archivo && $metodoPago === 'TRANSFERENCIA') {
            return redirect()->back()->withErrors([
                'comprobante' => 'El archivo del comprobante es obligatorio para transferencias y depósitos bancarios.',
            ]);
        }

        $archivoGenerado = null;
        if (!$archivo && in_array($metodoPago, ['QR', 'TARJETA', 'BILLETERA'])) {
            $idInteres = $request->input('id_interes');
            $interes = $idInteres
                ? $lead->intereses()->find($idInteres)
                : ($lead->intereses()->where('estado', '!=', 'MATRICULADO')->first() ?: $lead->intereses()->first());

            $monto = $request->input('monto') ? (float) $request->input('monto') : 0;
            $titular = $request->input('stripe_titular') ?: $lead->nombre;

            if ($metodoPago === 'TARJETA') {
                $referencia = $referencia ?: ('ch_stripe_' . substr(md5(uniqid()), 0, 14));
            } else {
                $referencia = $referencia ?: ('QR-' . date('Ymd') . '-' . rand(10000, 99999));
            }

            $archivoGenerado = $this->paymentService->generarVoucherDigital(
                $lead,
                $interes,
                $monto,
                $metodoPago === 'BILLETERA' ? 'QR' : $metodoPago,
                $referencia,
                $titular
            );
        }

        $this->paymentService->subirComprobante(
            $lead,
            $archivo ?: $archivoGenerado,
            $request->input('monto') ? (float) $request->input('monto') : null,
            $request->user()->id_usuario,
            $request->input('id_interes') ? (int) $request->input('id_interes') : null,
            $metodoPago,
            $referencia
        );

        return redirect()->back()->with('success', 'Comprobante de pago registrado correctamente.');
    }

    public function reviewQueue(Request $request): Response
    {
        $user = $request->user();

        // 1. Comprobantes subidos (si es vendedor, solo de sus leads)
        $comprobantesQuery = ComprobantePago::with([
            'lead.intereses', 
            'lead.descuento', 
            'interes',
            'subidoPor', 
            'revisadoPor', 
            'envioMatricula'
        ])
            ->orderByRaw("CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 2 END")
            ->latest('created_at');

        if ($user->isVendedor()) {
            $comprobantesQuery->whereHas('lead', function ($q) use ($user) {
                $q->where('id_vendedor', $user->id_usuario);
            });
        }

        $comprobantes = $comprobantesQuery->paginate(15);

        // 2. Leads que están en la etapa 4 (Promesa de Pago) esperando comprobante
        $leadsEnPromesaQuery = Lead::with(['intereses', 'descuento', 'vendedor', 'profesion', 'comprobantes'])
            ->where('id_etapa', 4);

        if ($user->isVendedor()) {
            $leadsEnPromesaQuery->where('id_vendedor', $user->id_usuario);
        }

        $leadsEnPromesa = $leadsEnPromesaQuery->latest('updated_at')->get();

        return Inertia::render('Payments/ReviewQueue', [
            'comprobantes' => $comprobantes,
            'leadsEnPromesa' => $leadsEnPromesa,
            'catalogo' => $this->catalogService->getCatalogCompleto(),
        ]);
    }

    public function approve(int $id, Request $request): RedirectResponse
    {
        $comprobante = ComprobantePago::with('lead')->findOrFail($id);
        $lead = $comprobante->lead;

        // Si se envían datos para completar la ficha del estudiante antes de matricular
        if ($lead) {
            $updated = false;
            if ($request->filled('ci')) {
                $lead->ci = trim((string) $request->input('ci'));
                $updated = true;
            }
            if ($request->filled('fecha_nacimiento')) {
                $lead->fecha_nacimiento = $request->input('fecha_nacimiento');
                $updated = true;
            }
            if ($request->filled('ciudad')) {
                $lead->ciudad = trim((string) $request->input('ciudad'));
                $updated = true;
            }
            if ($updated) {
                $lead->save();
            }

            // Validar que no se envíe a matricular con campos obligatorios vacíos
            $faltantes = [];
            if (empty($lead->ci)) $faltantes[] = 'Cédula de Identidad (CI)';
            if (empty($lead->fecha_nacimiento)) $faltantes[] = 'Fecha de Nacimiento';
            if (empty($lead->ciudad)) $faltantes[] = 'Ciudad de Residencia';

            if (!empty($faltantes)) {
                return redirect()->back()->with('error', 'No se puede aprobar la matrícula: Debe completar ' . implode(', ', $faltantes) . ' del estudiante.');
            }
        }

        $envio = $this->paymentService->aprobar($comprobante, $request->user()->id_usuario);

        if ($envio && $envio->estado === 'ENVIADO') {
            return redirect()->back()->with('success', '¡Comprobante aprobado y Alumno matriculado exitosamente en el Proyecto 2!');
        }

        if ($envio && $envio->estado === 'ERROR') {
            return redirect()->back()->with('warning', 'La matrícula fue rechazada por la API del Proyecto 2: ' . ($envio->respuesta_api ?? 'Error de validación'));
        }

        return redirect()->back()->with('success', 'Comprobante procesado.');
    }

    public function retryEnrollment(int $id, \App\Services\EnrollmentService $enrollmentService): RedirectResponse
    {
        $envio = \App\Models\EnvioMatricula::with(['comprobante.lead', 'interes'])->findOrFail($id);
        $enrollmentService->reintentar($envio);

        if ($envio->estado === 'ENVIADO') {
            $comprobante = $envio->comprobante;
            if ($comprobante) {
                $comprobante->update([
                    'estado' => 'APROBADO',
                    'fecha_revision' => now(),
                    'comentario_rechazo' => null,
                ]);

                if ($envio->interes) {
                    $envio->interes->update(['estado' => 'MATRICULADO']);
                }

                $lead = $comprobante->lead;
                if ($lead) {
                    $interesesPendientes = $lead->intereses()->where('estado', '!=', 'MATRICULADO')->count();
                    if ($interesesPendientes === 0 && $lead->id_etapa !== 5) {
                        $etapaAnterior = $lead->id_etapa;
                        $lead->update(['id_etapa' => 5]);
                        \App\Services\BitacoraService::registrar(
                            $lead->id_lead,
                            'CAMBIO_ESTADO',
                            "Prospecto convertido automáticamente a Alumno tras confirmación exitosa de matrícula en Proyecto 2",
                            auth()->id(),
                            $etapaAnterior,
                            5
                        );
                    }
                }
            }

            return redirect()->back()->with('success', '¡Matrícula confirmada exitosamente por el Proyecto 2! El comprobante ha sido APROBADO.');
        }

        return redirect()->back()->with('warning', 'Reintento procesado, pero la API del Proyecto 2 aún responde con error: ' . $envio->respuesta_api);
    }

    public function reject(int $id, Request $request): RedirectResponse
    {
        $comprobante = ComprobantePago::findOrFail($id);

        $request->validate([
            'motivo' => 'required|string|max:500',
        ]);

        $this->paymentService->rechazar(
            $comprobante,
            $request->input('motivo'),
            $request->user()->id_usuario
        );

        return redirect()->back()->with('success', 'Comprobante rechazado correctamente.');
    }
}
