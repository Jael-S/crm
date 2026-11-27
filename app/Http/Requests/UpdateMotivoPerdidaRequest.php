<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMotivoPerdidaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Administradores y Coordinadores pueden editar motivos de pérdida.
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
        $id = $this->route('id');

        return [
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('motivos_perdida', 'nombre')->ignore($id, 'id_motivo'),
            ],
        ];
    }

    /**
     * Custom validation messages in Spanish.
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del motivo de pérdida es obligatorio.',
            'nombre.unique' => 'Ya existe otro motivo de pérdida con este nombre.',
            'nombre.max' => 'El nombre del motivo no puede superar los 100 caracteres.',
        ];
    }
}
