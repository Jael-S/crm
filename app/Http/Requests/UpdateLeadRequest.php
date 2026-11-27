<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:120'],
            'telefono' => ['required', 'string', 'max:20'],
            'correo' => ['nullable', 'string', 'email', 'max:120'],
            'id_origen' => ['required', 'integer', 'exists:origenes_lead,id_origen'],
            'id_etapa' => ['nullable', 'integer', 'exists:etapas_pipeline,id_etapa'],
            'ci' => ['nullable', 'string', 'max:20'],
            'nombre_completo' => ['nullable', 'string', 'max:150'],
            'fecha_nacimiento' => ['nullable', 'date'],
            'ciudad' => ['nullable', 'string', 'max:60'],
            'id_profesion' => ['nullable', 'integer', 'exists:profesiones,id_profesion'],
            'id_descuento' => ['nullable', 'integer', 'exists:descuentos,id_descuento'],
            'id_motivo_perdida' => ['nullable', 'integer', 'exists:motivos_perdida,id_motivo'],
            'comentario_perdida' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Custom messages for validation errors in Spanish.
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del prospecto es obligatorio.',
            'nombre.max' => 'El nombre no puede exceder los 120 caracteres.',
            'telefono.required' => 'El número de teléfono es obligatorio.',
            'telefono.max' => 'El teléfono no puede superar los 20 caracteres.',
            'correo.email' => 'El correo electrónico debe ser una dirección válida.',
            'id_origen.required' => 'Debe seleccionar un canal de origen.',
            'id_origen.exists' => 'El origen seleccionado no es válido.',
            'id_etapa.exists' => 'La etapa seleccionada no es válida.',
            'fecha_nacimiento.date' => 'La fecha de nacimiento no tiene un formato de fecha válido.',
            'id_profesion.exists' => 'La profesión seleccionada no es válida.',
            'id_descuento.exists' => 'El descuento seleccionado no es válido.',
        ];
    }

    /**
     * Regla adicional: No permitir cambiar a "En Contacto" o superior sin vendedor asignado.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $leadId = $this->route('id');
            $etapaDestino = (int) $this->input('id_etapa');

            if ($leadId && $etapaDestino) {
                $lead = \App\Models\Lead::find($leadId);
                if ($lead) {
                    if ($etapaDestino >= 2 && $etapaDestino !== 6 && empty($lead->id_vendedor) && empty($this->input('id_vendedor'))) {
                        $validator->errors()->add(
                            'id_etapa',
                            'El prospecto no puede estar en la etapa "En Contacto" o superior sin tener un vendedor asignado.'
                        );
                    }

                    if ($etapaDestino === 6 && empty($this->input('id_motivo_perdida')) && empty($lead->id_motivo_perdida)) {
                        $validator->errors()->add(
                            'id_motivo_perdida',
                            'Debe seleccionar obligatoriamente un motivo de descarte si marca el prospecto como Perdido.'
                        );
                    }

                    if ($etapaDestino === 5) {
                        $ci = $this->input('ci') ?: $lead->ci;
                        $fechaNac = $this->input('fecha_nacimiento') ?: $lead->fecha_nacimiento;
                        $ciudad = $this->input('ciudad') ?: $lead->ciudad;

                        if (empty($ci) || empty($fechaNac) || empty($ciudad)) {
                            $validator->errors()->add(
                                'id_etapa',
                                'Para convertir el prospecto a Alumno debe completar CI, Fecha de Nacimiento y Ciudad.'
                            );
                        }
                    }
                }
            }
        });
    }
}
