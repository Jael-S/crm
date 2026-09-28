<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'nombre_completo' => ['required', 'string', 'max:120'],
            'correo' => ['required', 'string', 'email', 'max:120', Rule::unique('usuarios', 'correo')->ignore($userId, 'id_usuario')],
            'id_rol' => ['required', 'integer', 'exists:roles,id_rol'],
            'password' => ['nullable', 'string', 'min:6'],
            'participa_round_robin' => ['nullable', 'boolean'],
            'activo' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_completo.required' => 'El nombre completo es obligatorio.',
            'correo.required' => 'El correo electrónico es obligatorio.',
            'correo.email' => 'Debe ingresar un correo válido.',
            'correo.unique' => 'Este correo ya pertenece a otro usuario.',
            'id_rol.required' => 'Debe seleccionar un rol para el usuario.',
            'id_rol.exists' => 'El rol seleccionado no es válido.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        ];
    }
}
