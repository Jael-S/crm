<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStageRequest extends FormRequest
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
            'id_etapa' => ['required', 'integer', 'exists:etapas_pipeline,id_etapa'],
            'id_motivo_perdida' => ['nullable', 'required_if:id_etapa,6', 'integer', 'exists:motivos_perdida,id_motivo'],
            'comentario_perdida' => ['nullable', 'string', 'max:500'],
            'ci' => ['nullable', 'string', 'max:20'],
            'nombre_completo' => ['nullable', 'string', 'max:150'],
            'fecha_nacimiento' => ['nullable', 'date'],
            'ciudad' => ['nullable', 'string', 'max:60'],
        ];
    }

    /**
     * Custom validation messages in Spanish.
     */
    public function messages(): array
    {
        return [
            'id_etapa.required' => 'La etapa de destino es obligatoria.',
            'id_etapa.exists' => 'La etapa seleccionada no es válida.',
            'id_motivo_perdida.required_if' => 'Debe seleccionar un motivo de descarte si marca el prospecto como Perdido.',
            'id_motivo_perdida.exists' => 'El motivo de pérdida seleccionado no existe.',
            'comentario_perdida.max' => 'El comentario de descarte no puede superar los 500 caracteres.',
            'fecha_nacimiento.date' => 'La fecha de nacimiento no tiene un formato válido.',
            'ci.max' => 'La cédula de identidad no puede superar los 20 caracteres.',
            'nombre_completo.max' => 'El nombre completo no puede superar los 150 caracteres.',
            'ciudad.max' => 'La ciudad no puede superar los 60 caracteres.',
        ];
    }
}
