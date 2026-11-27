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
        if (!$user) {
            return false;
        }

        // Administrador y Coordinador tienen permiso de asignación y transferencia total
        if ($user->isAdmin() || $user->isCoordinador()) {
            return true;
        }

        // Un Vendedor solo puede tomar un prospecto si está en la Bolsa Común y se lo asigna a sí mismo
        if ($user->isVendedor()) {
            $leadId = $this->route('id');
            $lead = $leadId ? \App\Models\Lead::find($leadId) : null;
            $idDestino = (int) $this->input('id_vendedor');

            return $lead && is_null($lead->id_vendedor) && $idDestino === (int) $user->id_usuario;
        }

        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $leadId = $this->route('id');
        $lead = $leadId ? \App\Models\Lead::find($leadId) : null;
        $esReasignacion = $lead && !is_null($lead->id_vendedor);

        return [
            'id_vendedor' => ['required', 'integer', 'exists:usuarios,id_usuario'],
            'motivo' => [
                $esReasignacion ? 'required' : 'nullable',
                'string',
                $esReasignacion ? 'min:5' : 'nullable',
                'max:200'
            ],
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
            'motivo.required' => 'Debe ingresar obligatoriamente una justificación o motivo para la reasignación.',
            'motivo.min' => 'El motivo de reasignación debe tener al menos 5 caracteres descriptivos.',
            'motivo.max' => 'El motivo de asignación o transferencia no puede superar los 200 caracteres.',
        ];
    }

    /**
     * Validación adicional de regla de negocio: no reasignar al mismo vendedor.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $leadId = $this->route('id');
            if ($leadId) {
                $lead = \App\Models\Lead::find($leadId);
                $idVendedorNuevo = (int) $this->input('id_vendedor');

                if ($lead && !is_null($lead->id_vendedor) && (int) $lead->id_vendedor === $idVendedorNuevo) {
                    $validator->errors()->add(
                        'id_vendedor',
                        'El prospecto ya se encuentra asignado a este vendedor. Debe seleccionar un asesor diferente.'
                    );
                }
            }
        });
    }
}
