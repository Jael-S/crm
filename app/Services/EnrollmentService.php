<?php

namespace App\Services;

use App\Models\ComprobantePago;
use App\Models\EnvioMatricula;
use App\Models\Lead;
use App\Models\LeadInteres;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EnrollmentService
{
    /**
     * Inicia el despacho de la matrícula hacia la API del Proyecto 2 (Grupo 6SC).
     * Endpoint: POST https://proyecto-l1e0.onrender.com/api/v1/matriculas
     */
    public function iniciarMatricula(ComprobantePago $comprobante, ?LeadInteres $interes = null): EnvioMatricula
    {
        $lead = $comprobante->lead;

        // Si no se proporcionó el interés, tomar el del comprobante o el primer interés disponible
        if (!$interes) {
            $interes = $comprobante->interes 
                ?: $lead->intereses()->where('estado', '!=', 'MATRICULADO')->first() 
                ?: $lead->intereses()->first();
        }

        // Determinar si es cohorte (diplomado/programa) o grupo (módulo suelto)
        $esPrograma = !$interes || $interes->tipo === 'PROGRAMA';
        $tipoMatricula = $esPrograma ? 'cohorte' : 'grupo';

        // Descomponer nombre completo en nombre y apellidos
        $nombreCompleto = trim($lead->nombre_completo ?: $lead->nombre);
        $partesNombre = explode(' ', $nombreCompleto, 2);
        $nombres = $partesNombre[0] ?? 'Estudiante';
        $apellidos = $partesNombre[1] ?? 'Sin Apellido';

        // Sanitizar documento para enviar estrictamente solo números
        $documentoSanitizado = $this->limpiarDocumento($lead->ci, $lead->id_lead);

        // Construir el payload oficial según el contrato de la API
        // Se compone con id_interes para permitir que un mismo lead pueda matricularse en múltiples cursos distintos
        $leadIdentifier = $interes
            ? 'LEAD-' . $lead->id_lead . '-' . $interes->id_interes
            : 'LEAD-' . $lead->id_lead;

        $payload = [
            'crm_lead_id' => $leadIdentifier,
            'documento' => $documentoSanitizado,
            'tipo' => $tipoMatricula,
            'acepto_requisitos' => true,
            'name' => $nombres,
            'apellidos' => $apellidos,
            'email' => $lead->correo ?: "lead{$lead->id_lead}@crm-educativo.bo",
            'telefono' => $lead->telefono,
        ];

        if ($tipoMatricula === 'cohorte') {
            $payload['cohorte_id'] = (int) ($interes?->id_version_externo ?: 1);
        } else {
            $payload['grupo_id'] = (int) ($interes?->id_modulo_externo ?: 1);
        }

        $urlEndpoint = config('services.enrollment_api.url', 'https://proyecto-l1e0.onrender.com/api/v1/matriculas');

        $envio = EnvioMatricula::create([
            'id_lead' => $lead->id_lead,
            'id_interes' => $interes?->id_interes,
            'id_comprobante' => $comprobante->id_comprobante,
            'payload' => $payload,
            'estado' => 'PENDIENTE',
            'intentos' => 1,
            'fecha_envio' => now(),
        ]);

        try {
            Log::info("[MATRICULA-PROYECTO-2] Enviando matrícula para lead #{$lead->id_lead} ({$lead->nombre}) a {$urlEndpoint}: " . json_encode($payload));

            $response = Http::timeout(35)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->post($urlEndpoint, $payload);

            if ($response->successful()) {
                Log::info("[MATRICULA-PROYECTO-2] Respuesta exitosa para lead #{$lead->id_lead}: " . $response->body());

                $envio->update([
                    'estado' => 'ENVIADO',
                    'respuesta_api' => $response->body(),
                ]);

                BitacoraService::registrar(
                    $lead->id_lead,
                    'PAGO',
                    "Matrícula enviada exitosamente al Proyecto 2 (HTTP {$response->status()}) para '{$interes?->nombre_snapshot}'",
                    $comprobante->revisado_por
                );
            } else {
                Log::error("[MATRICULA-PROYECTO-2] API rechazó matrícula para lead #{$lead->id_lead} ({$lead->nombre}). HTTP {$response->status()}: " . $response->body());

                $errorDetallado = $this->extraerMensajeErrorApi($response);

                $envio->update([
                    'estado' => 'ERROR',
                    'respuesta_api' => $errorDetallado,
                ]);

                BitacoraService::registrar(
                    $lead->id_lead,
                    'PAGO',
                    "Error al enviar matrícula al Proyecto 2: {$errorDetallado}",
                    $comprobante->revisado_por
                );
            }
        } catch (\Exception $e) {
            Log::error("[MATRICULA-PROYECTO-2] Excepción de conexión para lead #{$lead->id_lead}: " . $e->getMessage());

            $envio->update([
                'estado' => 'ERROR',
                'respuesta_api' => "Falla de conexión: " . $e->getMessage(),
            ]);

            BitacoraService::registrar(
                $lead->id_lead,
                'PAGO',
                "Falla de conexión al enviar matrícula: {$e->getMessage()}",
                $comprobante->revisado_por
            );
        }

        return $envio;
    }

    /**
     * Reintenta el envío de matrícula en caso de fallo previo.
     */
    public function reintentar(EnvioMatricula $envio): EnvioMatricula
    {
        $urlEndpoint = config('services.enrollment_api.url', 'https://proyecto-l1e0.onrender.com/api/v1/matriculas');
        $envio->increment('intentos');

        $lead = $envio->lead()->with(['intereses'])->first();
        if ($lead) {
            $interes = $envio->interes ?: $lead->intereses->first();
            $esPrograma = !$interes || $interes->tipo === 'PROGRAMA';
            $tipoMatricula = $esPrograma ? 'cohorte' : 'grupo';

            $nombreCompleto = trim($lead->nombre_completo ?: $lead->nombre);
            $partesNombre = explode(' ', $nombreCompleto, 2);
            $nombres = $partesNombre[0] ?? 'Estudiante';
            $apellidos = $partesNombre[1] ?? 'Sin Apellido';

            $payload = [
                'crm_lead_id' => 'LEAD-' . $lead->id_lead,
                'documento' => $this->limpiarDocumento($lead->ci, $lead->id_lead),
                'tipo' => $tipoMatricula,
                'acepto_requisitos' => true,
                'name' => $nombres,
                'apellidos' => $apellidos,
                'email' => $lead->correo ?: "lead{$lead->id_lead}@crm-educativo.bo",
                'telefono' => $lead->telefono,
            ];

            if ($tipoMatricula === 'cohorte') {
                $payload['cohorte_id'] = (int) ($interes?->id_version_externo ?: 1);
            } else {
                $payload['grupo_id'] = (int) ($interes?->id_modulo_externo ?: 1);
            }

            $envio->payload = $payload;
        }

        try {
            $response = Http::timeout(35)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->post($urlEndpoint, $envio->payload);

            if ($response->successful()) {
                $envio->update([
                    'estado' => 'ENVIADO',
                    'respuesta_api' => $response->body(),
                ]);
            } else {
                $errorDetallado = $this->extraerMensajeErrorApi($response);
                $envio->update([
                    'estado' => 'ERROR',
                    'respuesta_api' => "Reintento fallido: " . $errorDetallado,
                ]);
            }
        } catch (\Exception $e) {
            $envio->update([
                'estado' => 'ERROR',
                'respuesta_api' => "Reintento fallido: " . $e->getMessage(),
            ]);
        }

        return $envio;
    }

    /**
     * Extrae de forma limpia y legible el mensaje de rechazo de la API externa (HTTP 422, etc.).
     */
    protected function extraerMensajeErrorApi($response): string
    {
        $status = $response->status();
        $json = $response->json();

        if (is_array($json)) {
            $partes = [];
            if (!empty($json['message'])) {
                $partes[] = $json['message'];
            }
            if (!empty($json['errors']) && is_array($json['errors'])) {
                foreach ($json['errors'] as $campo => $mensajes) {
                    $txt = is_array($mensajes) ? implode(', ', $mensajes) : $mensajes;
                    $partes[] = "{$campo}: {$txt}";
                }
            }
            if (!empty($partes)) {
                return implode(' | ', $partes);
            }
        }

        $body = trim($response->body());
        return "HTTP {$status}: " . (strlen($body) > 200 ? substr($body, 0, 200) . '...' : $body);
    }

    /**
     * Limpia el documento de identidad para extraer únicamente el número sin sufijos como " SC" o complementos.
     */
    protected function limpiarDocumento(?string $ci, int $idLead): string
    {
        if (empty($ci)) {
            return (string) $idLead;
        }

        $soloDigitos = preg_replace('/[^0-9]/', '', $ci);

        return !empty($soloDigitos) ? $soloDigitos : trim($ci);
    }
}
