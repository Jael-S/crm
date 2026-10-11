<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrigenLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Administradores y Coordinadores pueden crear canales de origen.
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
            'nombre' => ['required', 'string', 'max:50', 'unique:origenes_lead,nombre'],
        ];
    }

    /**
     * Custom validation messages in Spanish.
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del canal de origen es obligatorio.',
            'nombre.unique' => 'Ya existe un canal de origen registrado con este nombre.',
            'nombre.max' => 'El nombre del canal no puede superar los 50 caracteres.',
        ];
    }
}
