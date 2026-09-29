<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Según RF2.3 (Ing. Miriam), tanto el Administrador como el Coordinador pueden asignar.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || $user->isCoordinador());
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'id_vendedor' => ['required', 'integer', 'exists:usuarios,id_usuario'],
            'motivo' => ['nullable', 'string', 'max:200'],
        ];
    }

    /**
     * Custom messages for validation errors in Spanish.
     */
    public function messages(): array
    {
        return [
            'id_vendedor.required' => 'Debe seleccionar un vendedor para la asignación.',
            'id_vendedor.exists' => 'El vendedor seleccionado no es válido o no existe.',
            'motivo.max' => 'El motivo de asignación o transferencia no puede superar los 200 caracteres.',
        ];
    }
}
