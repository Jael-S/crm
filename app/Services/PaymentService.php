<?php

namespace App\Services;

use App\Models\ComprobantePago;
use App\Models\EnvioMatricula;
use App\Models\Lead;
use App\Models\Usuario;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        protected EnrollmentService $enrollmentService
    ) {}

    /**
     * Sube un comprobante de pago digital para un prospecto.
     */
    public function subirComprobante(Lead $lead, UploadedFile $archivo, ?float $monto, int $idUsuario): ComprobantePago
    {
        // Validación obligatoria: El prospecto debe tener al menos un interés registrado
        if ($lead->intereses()->count() === 0) {
            throw ValidationException::withMessages([
                'lead' => 'El prospecto debe tener vinculado al menos un programa o módulo de interés antes de subir el comprobante de pago.',
            ]);
        }

        $extension = strtolower($archivo->getClientOriginalExtension());
        $tipoArchivo = in_array($extension, ['jpg', 'jpeg', 'png', 'webp']) ? 'imagen' : 'pdf';

        $ruta = $archivo->store('comprobantes', 'public');

        $comprobante = ComprobantePago::create([
            'id_lead' => $lead->id_lead,
            'subido_por' => $idUsuario,
            'archivo_url' => '/storage/' . $ruta,
            'tipo_archivo' => $tipoArchivo,
            'monto' => $monto,
            'estado' => 'PENDIENTE',
        ]);

        BitacoraService::registrar(
            $lead->id_lead,
            'PAGO',
            "Comprobante de pago subido por " . auth()->user()->nombre_completo . ($monto ? " por un monto de Bs. {$monto}" : ""),
            $idUsuario
        );

        return $comprobante;
    }

    /**
     * Aprueba un comprobante de pago (exclusivo Administrador) y dispara la matrícula externa.
     */
    public function aprobar(ComprobantePago $comprobante, int $idAdmin): EnvioMatricula
    {
        return DB::transaction(function () use ($comprobante, $idAdmin) {
            $lead = $comprobante->lead;

            // 1. Disparar envío de matrícula a la API del Proyecto 2 / Grupo 6SC
            $envio = $this->enrollmentService->iniciarMatricula($comprobante);

            // 2. Si el envío a la API externa fue exitoso, aprobamos y convertimos el lead
            if ($envio->estado === 'ENVIADO') {
                $comprobante->update([
                    'estado' => 'APROBADO',
                    'revisado_por' => $idAdmin,
                    'fecha_revision' => now(),
                    'comentario_rechazo' => null,
                ]);

                BitacoraService::registrar(
                    $lead->id_lead,
                    'PAGO',
                    "Comprobante de pago #{$comprobante->id_comprobante} APROBADO y matrícula confirmada en Proyecto 2",
                    $idAdmin
                );

                // Si está en Promesa de Pago u otra etapa, avanza a Convertido si tiene datos completos
                if ($lead->id_etapa !== 5 && !empty($lead->ci) && !empty($lead->fecha_nacimiento)) {
                    $etapaAnterior = $lead->id_etapa;
                    $lead->update(['id_etapa' => 5]);
                    BitacoraService::registrar(
                        $lead->id_lead,
                        'CAMBIO_ESTADO',
                        "Prospecto convertido automáticamente a Alumno tras confirmación de pago",
                        $idAdmin,
                        $etapaAnterior,
                        5
                    );
                }
            } else {
                // 3. Si la API externa falló o rechazó la matrícula:
                // El comprobante queda en estado ERROR con el mensaje de rechazo
                // Y el lead NO pasa a convertido (permanece en Promesa de Pago)
                $comprobante->update([
                    'estado' => 'ERROR',
                    'revisado_por' => $idAdmin,
                    'fecha_revision' => now(),
                    'comentario_rechazo' => "Error de matrícula en Proyecto 2: " . ($envio->respuesta_api ?? 'Rechazado por API externa'),
                ]);

                BitacoraService::registrar(
                    $lead->id_lead,
                    'PAGO',
                    "Comprobante #{$comprobante->id_comprobante} NO APROBADO: Falló la matrícula en Proyecto 2. El prospecto permanece en Promesa de Pago.",
                    $idAdmin
                );
            }

            return $envio;
        });
    }

    /**
     * Rechaza un comprobante de pago con justificación obligatoria.
     */
    public function rechazar(ComprobantePago $comprobante, string $motivo, int $idAdmin): void
    {
        if (empty(trim($motivo))) {
            throw ValidationException::withMessages(['motivo' => 'Debe ingresar un motivo para el rechazo del comprobante.']);
        }

        $comprobante->update([
            'estado' => 'RECHAZADO',
            'revisado_por' => $idAdmin,
            'fecha_revision' => now(),
            'comentario_rechazo' => $motivo,
        ]);

        BitacoraService::registrar(
            $comprobante->id_lead,
            'PAGO',
            "Comprobante de pago #{$comprobante->id_comprobante} RECHAZADO: {$motivo}",
            $idAdmin
        );
    }
}
