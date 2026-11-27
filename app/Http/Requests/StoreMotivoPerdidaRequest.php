<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMotivoPerdidaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Administradores y Coordinadores pueden crear motivos de pérdida.
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
            'nombre' => ['required', 'string', 'max:100', 'unique:motivos_perdida,nombre'],
        ];
    }

    /**
     * Custom validation messages in Spanish.
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del motivo de pérdida es obligatorio.',
            'nombre.unique' => 'Ya existe un motivo de pérdida registrado con este nombre.',
            'nombre.max' => 'El nombre del motivo de pérdida no puede superar los 100 caracteres.',
        ];
    }
}
