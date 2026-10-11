<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrigenLeadRequest extends FormRequest
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
        $idOrigen = $this->route('id');

        return [
            'nombre' => [
                'required',
                'string',
                'max:50',
                Rule::unique('origenes_lead', 'nombre')->ignore($idOrigen, 'id_origen'),
            ],
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
