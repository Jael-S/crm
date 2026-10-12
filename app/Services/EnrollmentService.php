<?php

namespace App\Services;

use App\Models\ComprobantePago;
use App\Models\EnvioMatricula;
use App\Models\Lead;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EnrollmentService
{
    /**
     * Construye el payload del alumno y lo envía a la API externa del Grupo 6SC / Proyecto 2.
     * Sigue estrictamente la especificación oficial de API_CRM.md:
     * Endpoint: POST https://proyecto-l1e0.onrender.com/api/v1/matriculas
     */
    public function iniciarMatricula(ComprobantePago $comprobante): EnvioMatricula
    {
        $lead = $comprobante->lead()->with(['intereses', 'descuento', 'profesion'])->first();

        // 1. Determinar el interés académico (Programa / Cohorte o Módulo / Grupo)
        $interes = $lead->intereses->first();
        $esPrograma = !$interes || $interes->tipo === 'PROGRAMA';
        $tipoMatricula = $esPrograma ? 'cohorte' : 'grupo';

        // Descomponer nombre y apellidos
        $nombreCompleto = trim($lead->nombre_completo ?: $lead->nombre);
        $partesNombre = explode(' ', $nombreCompleto, 2);
        $nombres = $partesNombre[0] ?? 'Estudiante';
        $apellidos = $partesNombre[1] ?? 'Sin Apellido';

        // 2. Construir el payload EXACTO que exige el contrato de API_CRM.md
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

        // 3. Crear registro inicial en envios_matricula
        $envio = EnvioMatricula::create([
            'id_lead' => $lead->id_lead,
            'id_comprobante' => $comprobante->id_comprobante,
            'payload' => $payload,
            'estado' => 'PENDIENTE',
            'intentos' => 1,
        ]);

        // 4. Despacho HTTP hacia la URL oficial del Grupo 6SC
        $urlEndpoint = config('services.enrollment_api.url', 'https://proyecto-l1e0.onrender.com/api/v1/matriculas');

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->post($urlEndpoint, $payload);

            if ($response->successful()) {
                Log::info("[MATRICULA-PROYECTO-2] Envío exitoso para lead #{$lead->id_lead} ({$lead->nombre}). Respuesta HTTP {$response->status()}: " . $response->body());

                $envio->update([
                    'estado' => 'ENVIADO',
                    'respuesta_api' => $response->body(),
                ]);

                BitacoraService::registrar(
                    $lead->id_lead,
                    'PAGO',
                    "Matrícula enviada exitosamente al Proyecto 2 (HTTP {$response->status()})",
                    $comprobante->revisado_por
                );
            } else {
                Log::error("[MATRICULA-PROYECTO-2] API rechazó matrícula para lead #{$lead->id_lead} ({$lead->nombre}). HTTP {$response->status()}: " . $response->body());

                $envio->update([
                    'estado' => 'ERROR',
                    'respuesta_api' => "HTTP {$response->status()}: " . $response->body(),
                ]);

                BitacoraService::registrar(
                    $lead->id_lead,
                    'PAGO',
                    "Error al enviar matrícula al Proyecto 2: HTTP {$response->status()} - " . substr($response->body(), 0, 150),
                    $comprobante->revisado_por
                );
            }
        } catch (\Exception $e) {
            Log::error("[MATRICULA-PROYECTO-2] Excepción de conexión para lead #{$lead->id_lead}: " . $e->getMessage());

            $envio->update([
                'estado' => 'ERROR',
                'respuesta_api' => "Excepción de red: " . $e->getMessage(),
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

        // Reconstruir el payload con los datos más recientes del lead si fueron corregidos
        $lead = $envio->lead()->with(['intereses'])->first();
        if ($lead) {
            $interes = $lead->intereses->first();
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
            $response = Http::timeout(15)
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
                $envio->update([
                    'estado' => 'ERROR',
                    'respuesta_api' => "Reintento fallido HTTP {$response->status()}: " . $response->body(),
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
     * Limpia el documento de identidad para extraer únicamente el número sin sufijos como " SC" o complementos.
     */
    protected function limpiarDocumento(?string $ci, int $idLead): string
    {
        if (empty($ci)) {
            return (string) $idLead;
        }

        // Extraer únicamente los dígitos numéricos
        $soloDigitos = preg_replace('/[^0-9]/', '', $ci);

        return !empty($soloDigitos) ? $soloDigitos : trim($ci);
    }
}
