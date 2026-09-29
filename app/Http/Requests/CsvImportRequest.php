<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CsvImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'archivo_csv' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'archivo_csv.required' => 'Debe seleccionar un archivo CSV.',
            'archivo_csv.file' => 'El archivo subido no es válido.',
            'archivo_csv.mimes' => 'El archivo debe tener formato CSV o TXT.',
            'archivo_csv.max' => 'El archivo no debe pesar más de 2MB.',
        ];
    }
}
