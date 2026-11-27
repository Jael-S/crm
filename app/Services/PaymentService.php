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
        UploadedFile|string|null $archivo,
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

        if ($archivo instanceof UploadedFile) {
            $extension = strtolower($archivo->getClientOriginalExtension());
            $tipoArchivo = in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'svg']) ? 'imagen' : 'pdf';
            $ruta = $archivo->store('comprobantes', 'public');
            $archivoUrl = '/storage/' . $ruta;
        } elseif (is_string($archivo)) {
            $tipoArchivo = 'imagen';
            $archivoUrl = $archivo;
        } else {
            // Si no se proporcionó archivo ni ruta, generar voucher digital de billetera virtual
            $tipoArchivo = 'imagen';
            $archivoUrl = $this->generarVoucherBilletera(
                $lead,
                $interes,
                (float) ($monto ?? 0),
                'Billetera Virtual',
                $referencia ?? ('BW-' . date('Ymd') . '-' . rand(1000, 9999))
            );
        }

        $comprobante = ComprobantePago::create([
            'id_lead' => $lead->id_lead,
            'id_interes' => $idInteres,
            'subido_por' => $idUsuario,
            'archivo_url' => $archivoUrl,
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
     * Genera un comprobante oficial en formato SVG para pagos procesados mediante QR Simple o Tarjeta Stripe.
     */
    public function generarVoucherDigital(
        Lead $lead,
        ?LeadInteres $interes,
        float $monto,
        string $metodoPago = 'QR',
        ?string $referencia = null,
        ?string $titularOInfo = null
    ): string {
        $metodoUpper = strtoupper($metodoPago);
        if ($metodoUpper === 'TARJETA') {
            $referencia = $referencia ?: ('ch_stripe_' . substr(md5(uniqid()), 0, 16));
            $pasarelaNombre = 'Stripe Online Payments (Visa / Mastercard)';
            $tipoTitulo = 'COMPROBANTE OFICIAL · PASARELA STRIPE';
            $infoLabel = 'TITULAR TARJETA';
            $infoVal = $titularOInfo ?: ($lead->nombre);
        } else {
            $referencia = $referencia ?: ('QR-' . date('Ymd') . '-' . rand(10000, 99999));
            $pasarelaNombre = 'Red Enlace · QR Simple Billetera Interoperable';
            $tipoTitulo = 'COMPROBANTE OFICIAL · PAGO QR SIMPLE';
            $infoLabel = 'CELULAR / TITULAR';
            $infoVal = ($lead->telefono ? $lead->telefono . ' · ' : '') . $lead->nombre;
        }

        $fechaHora = now()->timezone('America/La_Paz')->format('d/m/Y H:i:s');
        $nombreCurso = htmlspecialchars($interes?->nombre_snapshot ?? 'Programa Académico UNEXO', ENT_QUOTES, 'UTF-8');
        $nombreLead = htmlspecialchars($lead->nombre, ENT_QUOTES, 'UTF-8');
        $ci = htmlspecialchars($lead->ci ?: 'Pendiente de formalización', ENT_QUOTES, 'UTF-8');
        $authCode = 'AUTH-' . strtoupper(substr(md5($referencia . $monto), 0, 8));
        $montoFormateado = number_format($monto, 2, '.', ',');

        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750" style="background:#ffffff; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#000d1e"/>
      <stop offset="100%" stop-color="#002855"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.12"/>
    </filter>
  </defs>

  <rect x="20" y="20" width="560" height="710" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" filter="url(#shadow)"/>

  <path d="M 20 40 Q 20 20 40 20 L 560 20 Q 580 20 580 40 L 580 140 L 20 140 Z" fill="url(#headerGrad)"/>
  
  <text x="50" y="58" font-size="11" font-weight="700" fill="#38bdf8" letter-spacing="2">U.A.G.R.M. · FACULTAD DE CS. DE LA COMPUTACIÓN</text>
  <text x="50" y="84" font-size="18" font-weight="900" fill="#ffffff" letter-spacing="1">UNEXO CRM · PASARELA DIGITAL</text>
  <text x="50" y="112" font-size="13" font-weight="600" fill="#94a3b8">{$tipoTitulo}</text>

  <rect x="360" y="52" width="190" height="42" rx="10" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="455" y="77" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">TRANSACCIÓN EN LÍNEA</text>

  <rect x="50" y="165" width="500" height="100" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <text x="75" y="195" font-size="11" font-weight="700" fill="#64748b" letter-spacing="1.5">IMPORTE CANCELADO</text>
  <text x="75" y="242" font-size="34" font-weight="900" fill="#002855">Bs. {$montoFormateado}</text>
  <text x="390" y="215" font-size="11" font-weight="600" fill="#059669">ESTADO BANCARIO</text>
  <rect x="390" y="224" width="135" height="26" rx="6" fill="#ecfdf5" stroke="#10b981" stroke-width="1"/>
  <text x="457" y="241" font-size="11" font-weight="800" fill="#059669" text-anchor="middle">CONFIRMADO</text>

  <g transform="translate(50, 290)">
    <text x="0" y="16" font-size="11" font-weight="700" fill="#64748b">CÓDIGO DE OPERACIÓN</text>
    <text x="0" y="36" font-size="14" font-weight="800" fill="#0f172a" font-family="monospace">{$referencia}</text>

    <text x="270" y="16" font-size="11" font-weight="700" fill="#64748b">FECHA Y HORA (BOLIVIA)</text>
    <text x="270" y="36" font-size="13" font-weight="600" fill="#0f172a">{$fechaHora}</text>

    <line x1="0" y1="55" x2="500" y2="55" stroke="#f1f5f9" stroke-width="1.5"/>

    <text x="0" y="80" font-size="11" font-weight="700" fill="#64748b">PASARELA / CANAL</text>
    <text x="0" y="100" font-size="13" font-weight="700" fill="#0284c7">{$pasarelaNombre}</text>

    <text x="270" y="80" font-size="11" font-weight="700" fill="#64748b">{$infoLabel}</text>
    <text x="270" y="100" font-size="13" font-weight="700" fill="#0f172a">{$infoVal}</text>

    <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" stroke-width="1.5"/>

    <text x="0" y="145" font-size="11" font-weight="700" fill="#64748b">POSTULANTE / ESTUDIANTE</text>
    <text x="0" y="165" font-size="13" font-weight="700" fill="#0f172a">{$nombreLead}</text>

    <text x="270" y="145" font-size="11" font-weight="700" fill="#64748b">DOCUMENTO DE IDENTIDAD</text>
    <text x="270" y="165" font-size="13" font-weight="700" fill="#0f172a">{$ci}</text>

    <line x1="0" y1="185" x2="500" y2="185" stroke="#f1f5f9" stroke-width="1.5"/>

    <text x="0" y="210" font-size="11" font-weight="700" fill="#64748b">CONCEPTO / CURSO MATRICULADO</text>
    <text x="0" y="232" font-size="13" font-weight="700" fill="#002855">{$nombreCurso}</text>

    <line x1="0" y1="255" x2="500" y2="255" stroke="#f1f5f9" stroke-width="1.5"/>

    <text x="0" y="280" font-size="11" font-weight="700" fill="#64748b">CÓDIGO DE AUTORIZACIÓN</text>
    <text x="0" y="302" font-size="14" font-weight="900" fill="#059669" font-family="monospace">{$authCode}</text>
  </g>

  <rect x="50" y="625" width="500" height="70" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="70" y="650" font-size="10" font-weight="700" fill="#0f172a">UNEXO EDUCATIONAL CRM · SISTEMA DE GESTIÓN ACADÉMICA FICCT</text>
  <text x="70" y="666" font-size="9" font-weight="500" fill="#64748b">Este comprobante digital ha sido procesado mediante la pasarela de pagos oficial con validez interna.</text>
  <text x="70" y="680" font-size="9" font-weight="600" fill="#0284c7">Módulo 236 · Campus Universitario UAGRM · Santa Cruz, Bolivia</text>
</svg>
SVG;

        $cleanRef = preg_replace('/[^a-zA-Z0-9_-]/', '', $referencia);
        $fileName = 'comprobante_digital_' . strtolower($metodoUpper) . '_' . $cleanRef . '_' . time() . '.svg';
        Storage::disk('public')->put('comprobantes/' . $fileName, $svg);

        return '/storage/comprobantes/' . $fileName;
    }

    /**
     * Alias retrocompatible para generarVoucherDigital.
     */
    public function generarVoucherBilletera(
        Lead $lead,
        ?LeadInteres $interes,
        float $monto,
        string $proveedor = 'QR Simple',
        ?string $referencia = null,
        ?string $telefono = null
    ): string {
        return $this->generarVoucherDigital($lead, $interes, $monto, 'QR', $referencia, $telefono);
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
