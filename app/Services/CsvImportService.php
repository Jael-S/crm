<?php

namespace App\Services;

use App\Models\ImportacionCsv;
use App\Models\OrigenLead;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

class CsvImportService
{
    public function __construct(
        protected LeadService $leadService
    ) {}

    /**
     * Procesa un CSV de prospectos fila por fila.
     * Formato esperado: nombre,telefono,correo,id_origen
     *
     * @return array{importacion: ImportacionCsv, errores: list<string>}
     */
    public function procesar(UploadedFile $file, int $userId): array
    {
        $path = $file->getRealPath();
        $handle = fopen($path, 'r');

        if ($handle === false) {
            throw new \RuntimeException('No se pudo abrir el archivo CSV.');
        }

        $origenesValidos = OrigenLead::query()
            ->pluck('id_origen')
            ->map(fn ($id) => (int) $id)
            ->all();

        // Saltar cabecera si la primera fila parece títulos
        $primera = fgetcsv($handle, 0, ',');
        if ($primera !== false && ! $this->pareceCabecera($primera)) {
            rewind($handle);
        }

        $importacion = ImportacionCsv::create([
            'id_usuario' => $userId,
            'nombre_archivo' => $file->getClientOriginalName(),
            'total_filas' => 0,
            'filas_exitosas' => 0,
            'filas_fallidas' => 0,
        ]);

        $totalFilas = 0;
        $filasExitosas = 0;
        $filasFallidas = 0;
        $errores = [];
        $numeroFila = 1; // tras cabecera (si hubo)

        try {
            while (($row = fgetcsv($handle, 0, ',')) !== false) {
                $numeroFila++;

                // Ignorar filas totalmente vacías
                if ($this->filaVacia($row)) {
                    continue;
                }

                $totalFilas++;

                $datos = $this->mapearFila($row);
                $errorFila = $this->validarFila($datos, $origenesValidos);

                if ($errorFila !== null) {
                    $filasFallidas++;
                    $errores[] = "Fila {$numeroFila}: {$errorFila}";
                    continue;
                }

                try {
                    $this->leadService->crear([
                        'nombre' => $datos['nombre'],
                        'telefono' => $datos['telefono'],
                        'correo' => $datos['correo'],
                        'id_origen' => $datos['id_origen'],
                        'id_vendedor' => null,
                        'id_importacion' => $importacion->id_importacion,
                    ], $userId);

                    $filasExitosas++;
                } catch (\Throwable $e) {
                    $filasFallidas++;
                    $errores[] = "Fila {$numeroFila}: no se pudo registrar el prospecto ({$e->getMessage()}).";
                }
            }
        } finally {
            fclose($handle);
        }

        $importacion->update([
            'total_filas' => $totalFilas,
            'filas_exitosas' => $filasExitosas,
            'filas_fallidas' => $filasFallidas,
        ]);

        return [
            'importacion' => $importacion->fresh(),
            'errores' => array_slice($errores, 0, 50),
        ];
    }

    private function pareceCabecera(array $row): bool
    {
        $primera = strtolower(trim((string) ($row[0] ?? '')));

        return in_array($primera, ['nombre', 'name', 'prospecto'], true);
    }

    private function filaVacia(array $row): bool
    {
        foreach ($row as $celda) {
            if (trim((string) $celda) !== '') {
                return false;
            }
        }

        return true;
    }

    /**
     * @return array{nombre: string, telefono: string, correo: ?string, id_origen: int}
     */
    private function mapearFila(array $row): array
    {
        $correo = isset($row[2]) ? trim((string) $row[2]) : '';
        $origenRaw = isset($row[3]) ? trim((string) $row[3]) : '';

        return [
            'nombre' => trim((string) ($row[0] ?? '')),
            'telefono' => trim((string) ($row[1] ?? '')),
            'correo' => $correo === '' ? null : $correo,
            'id_origen' => $origenRaw === '' ? 1 : (int) $origenRaw,
        ];
    }

    private function validarFila(array $datos, array $origenesValidos): ?string
    {
        $validator = Validator::make($datos, [
            'nombre' => ['required', 'string', 'max:120'],
            'telefono' => ['required', 'string', 'max:20'],
            'correo' => ['nullable', 'email', 'max:120'],
            'id_origen' => ['required', 'integer'],
        ], [
            'nombre.required' => 'el nombre es obligatorio',
            'nombre.max' => 'el nombre supera 120 caracteres',
            'telefono.required' => 'el teléfono es obligatorio',
            'telefono.max' => 'el teléfono supera 20 caracteres',
            'correo.email' => 'el correo no es válido',
            'id_origen.required' => 'el origen es obligatorio',
        ]);

        if ($validator->fails()) {
            return $validator->errors()->first();
        }

        if (! in_array((int) $datos['id_origen'], $origenesValidos, true)) {
            return "el origen #{$datos['id_origen']} no existe (use IDs de la tabla origenes_lead)";
        }

        return null;
    }
}
