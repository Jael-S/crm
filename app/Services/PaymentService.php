<?php

namespace App\Services;

use App\Models\ComprobantePago;
use App\Models\EnvioMatricula;
use App\Models\Lead;
use App\Models\LeadInteres;
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
     * Sube un comprobante de pago digital para un prospecto, asociándolo opcionalmente a un interés específico.
     */
    public function subirComprobante(
        Lead $lead,
        UploadedFile $archivo,
        ?float $monto,
        int $idUsuario,
        ?int $idInteres = null,
        string $metodoPago = 'TRANSFERENCIA',
        ?string $referencia = null
    ): ComprobantePago {
        // Validación obligatoria: El prospecto debe tener al menos un interés registrado
        if ($lead->intereses()->count() === 0) {
            throw ValidationException::withMessages([
                'lead' => 'El prospecto debe tener vinculado al menos un programa o módulo de interés antes de registrar el comprobante de pago.',
            ]);
        }

        // Si se indicó un interés específico, verificar que pertenezca a este lead
        $interes = null;
        if ($idInteres) {
            $interes = $lead->intereses()->where('id_interes', $idInteres)->first();
            if (!$interes) {
                throw ValidationException::withMessages([
                    'id_interes' => 'El interés seleccionado no pertenece a este prospecto.',
                ]);
            }
        } else {
            // Seleccionar automáticamente el primer interés que no esté ya matriculado
            $interes = $lead->intereses()->where('estado', '!=', 'MATRICULADO')->first() ?: $lead->intereses()->first();
            $idInteres = $interes?->id_interes;
        }

        $extension = strtolower($archivo->getClientOriginalExtension());
        $tipoArchivo = in_array($extension, ['jpg', 'jpeg', 'png', 'webp']) ? 'imagen' : 'pdf';

        $ruta = $archivo->store('comprobantes', 'public');

        $comprobante = ComprobantePago::create([
            'id_lead' => $lead->id_lead,
            'id_interes' => $idInteres,
            'subido_por' => $idUsuario,
            'archivo_url' => '/storage/' . $ruta,
            'tipo_archivo' => $tipoArchivo,
            'monto' => $monto,
            'metodo_pago' => $metodoPago,
            'referencia_transaccion' => $referencia,
            'estado' => 'PENDIENTE',
        ]);

        // Si el interés estaba en seguimiento, marcarlo como en proceso de pago
        if ($interes && $interes->estado === 'EN_SEGUIMIENTO') {
            $interes->update(['estado' => 'EN_PAGO']);
        }

        $nombreCurso = $interes ? " para {$interes->nombre_snapshot}" : "";
        $descMonto = $monto ? " por un monto de Bs. {$monto}" : "";
        $descMetodo = " vía {$metodoPago}" . ($referencia ? " (Ref: {$referencia})" : "");
        $nombreUsuario = Usuario::find($idUsuario)?->nombre_completo ?? auth()->user()?->nombre_completo ?? 'Asesor';

        BitacoraService::registrar(
            $lead->id_lead,
            'PAGO',
            "Comprobante de pago subido{$nombreCurso}{$descMonto}{$descMetodo} por {$nombreUsuario}",
            $idUsuario
        );

        return $comprobante;
    }

    /**
     * Aprueba un comprobante de pago (exclusivo Administrador) y dispara la matrícula externa en Proyecto 2.
     */
    public function aprobar(ComprobantePago $comprobante, int $idAdmin): EnvioMatricula
    {
        return DB::transaction(function () use ($comprobante, $idAdmin) {
            $lead = $comprobante->lead;

            // Determinar el interés que se está pagando
            $interes = $comprobante->interes 
                ?: $lead->intereses()->where('estado', '!=', 'MATRICULADO')->first() 
                ?: $lead->intereses()->first();

            // 1. Disparar envío de matrícula a la API del Proyecto 2 / Grupo 6SC
            $envio = $this->enrollmentService->iniciarMatricula($comprobante, $interes);

            // 2. Si el envío a la API externa fue exitoso, aprobamos y actualizamos estado
            if ($envio->estado === 'ENVIADO') {
                $comprobante->update([
                    'estado' => 'APROBADO',
                    'revisado_por' => $idAdmin,
                    'fecha_revision' => now(),
                    'comentario_rechazo' => null,
                ]);

                // Actualizar el estado del interés específico a MATRICULADO
                if ($interes) {
                    $interes->update(['estado' => 'MATRICULADO']);
                }

                $nombreSnapshot = $interes ? $interes->nombre_snapshot : 'oferta académica';

                BitacoraService::registrar(
                    $lead->id_lead,
                    'PAGO',
                    "Comprobante #{$comprobante->id_comprobante} APROBADO. Matrícula confirmada para '{$nombreSnapshot}' en Proyecto 2.",
                    $idAdmin
                );

                // Evaluar si todos los intereses del prospecto ya están matriculados
                $interesesPendientes = $lead->intereses()->where('estado', '!=', 'MATRICULADO')->count();

                if ($interesesPendientes === 0) {
                    // Todos los cursos están matriculados -> Convertir el lead formalmente
                    if ($lead->id_etapa !== 5 && !empty($lead->ci) && !empty($lead->fecha_nacimiento)) {
                        $etapaAnterior = $lead->id_etapa;
                        $lead->update(['id_etapa' => 5]);
                        BitacoraService::registrar(
                            $lead->id_lead,
                            'CAMBIO_ESTADO',
                            "Prospecto convertido formalmente a Alumno tras completar la matrícula de todos sus intereses.",
                            $idAdmin,
                            $etapaAnterior,
                            5
                        );
                    }
                } else {
                    // El lead aún tiene otros intereses en seguimiento
                    BitacoraService::registrar(
                        $lead->id_lead,
                        'NOTA',
                        "El prospecto completó la matrícula en '{$nombreSnapshot}', pero aún mantiene {$interesesPendientes} curso(s) de interés en seguimiento comercial.",
                        $idAdmin
                    );
                }
            } else {
                // 3. Si la API externa falló o rechazó la matrícula:
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
    public function rechazar(ComprobantePago $comprobante, string $motivo, int $idAdmin): ComprobantePago
    {
        return DB::transaction(function () use ($comprobante, $motivo, $idAdmin) {
            $comprobante->update([
                'estado' => 'RECHAZADO',
                'revisado_por' => $idAdmin,
                'fecha_revision' => now(),
                'comentario_rechazo' => $motivo,
            ]);

            // Si el interés asociado estaba en EN_PAGO, revertirlo a EN_SEGUIMIENTO
            if ($comprobante->interes && $comprobante->interes->estado === 'EN_PAGO') {
                $comprobante->interes->update(['estado' => 'EN_SEGUIMIENTO']);
            }

            BitacoraService::registrar(
                $comprobante->id_lead,
                'PAGO',
                "Comprobante #{$comprobante->id_comprobante} RECHAZADO por " . auth()->user()->nombre_completo . ". Motivo: {$motivo}",
                $idAdmin
            );

            return $comprobante;
        });
    }
}
