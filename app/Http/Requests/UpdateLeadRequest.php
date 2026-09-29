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
        ];
    }
}
