<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoundRobinAssignRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Solo Administrador puede ejecutar la distribución masiva automática.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'lead_ids' => ['nullable', 'array'],
            'lead_ids.*' => ['integer', 'exists:leads,id_lead'],
        ];
    }

    /**
     * Custom messages for validation errors in Spanish.
     */
    public function messages(): array
    {
        return [
            'lead_ids.array' => 'La lista de prospectos debe ser un arreglo.',
            'lead_ids.*.exists' => 'Uno o más prospectos seleccionados no existen.',
        ];
    }
}
