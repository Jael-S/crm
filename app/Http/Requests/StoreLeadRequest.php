<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Administradores, Coordinadores y Vendedores pueden registrar prospectos.
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
            'id_vendedor' => ['nullable', 'integer', 'exists:usuarios,id_usuario'],
            'id_etapa' => ['nullable', 'integer', 'exists:etapas_pipeline,id_etapa'],
            'id_profesion' => ['nullable', 'integer', 'exists:profesiones,id_profesion'],
            'id_descuento' => ['nullable', 'integer', 'exists:descuentos,id_descuento'],
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
            'telefono.required' => 'El número de teléfono o celular es obligatorio.',
            'telefono.max' => 'El teléfono no puede superar los 20 caracteres.',
            'correo.email' => 'El correo electrónico no tiene un formato válido.',
            'correo.max' => 'El correo no puede superar los 120 caracteres.',
            'id_origen.required' => 'Debe seleccionar un canal de origen.',
            'id_origen.exists' => 'El origen seleccionado no es válido.',
            'id_vendedor.exists' => 'El vendedor seleccionado no existe.',
            'id_etapa.exists' => 'La etapa seleccionada no es válida.',
            'id_profesion.exists' => 'La profesión seleccionada no es válida.',
            'id_descuento.exists' => 'El descuento seleccionado no es válido.',
        ];
    }

    /**
     * Regla adicional: No permitir registrar directamente en "En Contacto" o superior sin vendedor asignado.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $etapaDestino = (int) $this->input('id_etapa', 1);
            if ($etapaDestino >= 2 && $etapaDestino !== 6 && empty($this->input('id_vendedor'))) {
                $validator->errors()->add(
                    'id_vendedor',
                    'No es posible registrar el prospecto en la etapa "En Contacto" o superior sin asignarle un vendedor.'
                );
            }
        });
    }
}
