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
            'comprobante' => 'required|file|mimes:jpg,jpeg,png,pdf,webp|max:5120',
            'monto' => 'nullable|numeric|min:0',
        ]);

        $this->paymentService->subirComprobante(
            $lead,
            $request->file('comprobante'),
            $request->input('monto') ? (float) $request->input('monto') : null,
            $request->user()->id_usuario
        );

        return redirect()->back()->with('success', 'Comprobante de pago subido correctamente.');
    }

    public function reviewQueue(Request $request): Response
    {
        $user = $request->user();

        // 1. Comprobantes subidos (si es vendedor, solo de sus leads)
        $comprobantesQuery = ComprobantePago::with(['lead.intereses', 'lead.descuento', 'subidoPor', 'revisadoPor', 'envioMatricula'])
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
        $comprobante = ComprobantePago::findOrFail($id);
        $envio = $this->paymentService->aprobar($comprobante, $request->user()->id_usuario);

        if ($envio && $envio->estado === 'ENVIADO') {
            return redirect()->back()->with('success', '¡Comprobante aprobado y Alumno matriculado exitosamente en el Proyecto 2!');
        }

        if ($envio && $envio->estado === 'ERROR') {
            return redirect()->back()->with('warning', 'La matrícula fue rechazada por la API del Proyecto 2. El comprobante no fue aprobado y el prospecto permanece en Promesa de Pago: ' . ($envio->respuesta_api ?? 'Error de validación'));
        }

        return redirect()->back()->with('success', 'Comprobante procesado.');
    }

    public function retryEnrollment(int $id, \App\Services\EnrollmentService $enrollmentService): RedirectResponse
    {
        $envio = \App\Models\EnvioMatricula::with(['comprobante.lead'])->findOrFail($id);
        $enrollmentService->reintentar($envio);

        if ($envio->estado === 'ENVIADO') {
            $comprobante = $envio->comprobante;
            if ($comprobante) {
                $comprobante->update([
                    'estado' => 'APROBADO',
                    'fecha_revision' => now(),
                    'comentario_rechazo' => null,
                ]);

                $lead = $comprobante->lead;
                if ($lead && $lead->id_etapa !== 5) {
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

            return redirect()->back()->with('success', '¡Matrícula confirmada exitosamente por el Proyecto 2! El comprobante ha sido APROBADO y el prospecto CONVERTIDO a Alumno.');
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
