<?php

namespace App\Services;

use App\Models\ImportacionCsv;
use App\Models\OrigenLead;
use App\Models\Profesion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

class CsvImportService
{
    public function __construct(
        protected LeadService $leadService
    ) {}

    /**
     * Procesa un CSV de prospectos fila por fila.
     * Las columnas pueden venir con cabecera. residencia se ignora porque no
     * existe como atributo persistible de Lead.
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

        $primera = fgetcsv($handle, 0, ',');
        $cabecera = $primera !== false && $this->pareceCabecera($primera);
        $columnas = $cabecera ? $this->normalizarCabecera($primera) : null;
        if (! $cabecera) {
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
        $numeroFila = 0;

        try {
            while (($row = fgetcsv($handle, 0, ',')) !== false) {
                $numeroFila++;

                // Ignorar filas totalmente vacías
                if ($this->filaVacia($row)) {
                    continue;
                }

                $totalFilas++;

                $datos = $this->mapearFila($row, $columnas);
                [$errorFila, $advertenciaFila] = $this->validarFila($datos);

                if ($errorFila !== null) {
                    $filasFallidas++;
                    $this->registrarError($importacion, $numeroFila, $errorFila);
                    $errores[] = "Línea {$numeroFila}: {$errorFila}";
                    continue;
                }

                if ($advertenciaFila !== null) {
                    $this->registrarError($importacion, $numeroFila, $advertenciaFila);
                    $errores[] = "Línea {$numeroFila}: {$advertenciaFila}";
                }

                try {
                    $this->leadService->crear([
                        'nombre' => $datos['nombre'],
                        'telefono' => $datos['telefono'],
                        'correo' => $datos['correo'],
                        'id_origen' => $datos['id_origen'],
                        'ci' => $datos['ci'],
                        'ciudad' => $datos['ciudad'],
                        'id_profesion' => $datos['id_profesion'],
                        'id_vendedor' => null,
                        'id_importacion' => $importacion->id_importacion,
                    ], $userId);

                    $filasExitosas++;
                } catch (\Throwable $e) {
                    $filasFallidas++;
                    $motivo = 'No se pudo registrar el prospecto: '.$e->getMessage();
                    $this->registrarError($importacion, $numeroFila, $motivo);
                    $errores[] = "Línea {$numeroFila}: {$motivo}";
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
            'importacion' => $importacion->fresh('errores'),
            'errores' => array_slice($errores, 0, 50),
        ];
    }

    private function pareceCabecera(array $row): bool
    {
        $valores = array_map(fn ($value) => $this->normalizarNombreColumna($value), $row);
        return in_array('nombre', $valores, true) || in_array('telefono', $valores, true);
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
    private function mapearFila(array $row, ?array $columnas): array
    {
        $valores = [];
        if ($columnas !== null) {
            foreach ($columnas as $indice => $nombre) {
                $valores[$nombre] = trim((string) ($row[$indice] ?? ''));
            }
        } elseif (count($row) <= 4) {
            // Compatibilidad con el formato anterior: nombre,telefono,correo,id_origen.
            $valores = [
                'nombre' => trim((string) ($row[0] ?? '')),
                'telefono' => trim((string) ($row[1] ?? '')),
                'correo' => trim((string) ($row[2] ?? '')),
                'id_origen' => trim((string) ($row[3] ?? '')),
            ];
        } else {
            $valores = [
                'nombre' => trim((string) ($row[0] ?? '')),
                'telefono' => trim((string) ($row[1] ?? '')),
                'id_origen' => trim((string) ($row[2] ?? '')),
                'ci' => trim((string) ($row[3] ?? '')),
                'profesion' => trim((string) ($row[4] ?? '')),
                'ciudad' => trim((string) ($row[5] ?? '')),
                'correo' => trim((string) ($row[6] ?? '')),
            ];
        }

        $origenRaw = $valores['id_origen'] ?? $valores['origen'] ?? '';
        $profesionRaw = $valores['id_profesion'] ?? $valores['profesion'] ?? '';

        return [
            'nombre' => $valores['nombre'] ?? '',
            'telefono' => $valores['telefono'] ?? '',
            'correo' => ($valores['correo'] ?? '') === '' ? null : $valores['correo'],
            'id_origen_raw' => $origenRaw,
            'id_profesion_raw' => $profesionRaw === '' ? '' : $profesionRaw,
            'id_origen' => null,
            'id_profesion' => null,
            'ci' => ($valores['ci'] ?? '') === '' ? null : $valores['ci'],
            'ciudad' => ($valores['ciudad'] ?? '') === '' ? null : $valores['ciudad'],
        ];
    }

    /**
     * Valida los datos mapeados de una fila del CSV.
     * Retorna una tupla: [error, advertencia].
     * Si 'error' no es null, la fila no debe procesarse.
     * Si 'advertencia' no es null pero 'error' es null, la fila se procesa con fallback resiliente.
     *
     * @return array{0: ?string, 1: ?string}
     */
    private function validarFila(array &$datos): array
    {
        $validator = Validator::make($datos, [
            'nombre' => ['required', 'string', 'max:120'],
            'telefono' => ['required', 'string', 'max:20'],
            'correo' => ['nullable', 'email', 'max:120'],
            'id_origen_raw' => ['nullable', 'string', 'max:50'],
            'ci' => ['nullable', 'string', 'max:20'],
            'ciudad' => ['nullable', 'string', 'max:60'],
            'id_profesion_raw' => ['nullable', 'string', 'max:100'],
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.max' => 'El nombre supera 120 caracteres.',
            'telefono.required' => 'El teléfono es obligatorio.',
            'telefono.max' => 'El teléfono supera 20 caracteres.',
            'correo.email' => 'El correo electrónico no es válido.',
        ]);

        if ($validator->fails()) {
            return [$validator->errors()->first(), null];
        }

        // 1. Fallback resiliente en origen: si está vacío o no existe, asignar por defecto sin rechazar la fila
        $origenRes = $this->resolverOrigenConFallback($datos['id_origen_raw'] ?? '');
        $datos['id_origen'] = $origenRes['origen']->id_origen;
        $advertencias = [];

        if ($origenRes['advertencia'] !== null) {
            $advertencias[] = $origenRes['advertencia'];
        }

        // 2. Profesión resiliente: si no existe en BD, registrar advertencia y continuar sin romper la fila
        if (($datos['id_profesion_raw'] ?? '') !== '') {
            $profesion = $this->resolverProfesion($datos['id_profesion_raw']);
            if ($profesion !== null) {
                $datos['id_profesion'] = $profesion->id_profesion;
            } else {
                $advertencias[] = "La profesión '{$datos['id_profesion_raw']}' no pudo ser validada; se continuó sin asignar profesión.";
                $datos['id_profesion'] = null;
            }
        }

        $advertenciaFila = !empty($advertencias) ? implode(' | ', $advertencias) : null;

        return [null, $advertenciaFila];
    }

    /**
     * Resuelve el origen del prospecto o asigna el origen por defecto con advertencia.
     *
     * @return array{origen: OrigenLead, advertencia: ?string}
     */
    private function resolverOrigenConFallback(mixed $valor): array
    {
        $valorTrim = trim((string) $valor);

        // Caso 1: Origen vacío en el archivo CSV
        if ($valorTrim === '') {
            $origenDefault = $this->obtenerOrigenPorDefecto();
            return [
                'origen' => $origenDefault,
                'advertencia' => "Columna origen vacía: se asignó automáticamente '{$origenDefault->nombre}' por defecto.",
            ];
        }

        // Caso 2: Intento de resolución normal (numérico o texto)
        $origen = $this->resolverOrigen($valorTrim);
        if ($origen !== null) {
            return [
                'origen' => $origen,
                'advertencia' => null,
            ];
        }

        // Caso 3: Fallo de resolución -> Fallback seguro
        $origenDefault = $this->obtenerOrigenPorDefecto();
        return [
            'origen' => $origenDefault,
            'advertencia' => "Origen '{$valorTrim}' no reconocido: se asignó '{$origenDefault->nombre}' por defecto.",
        ];
    }

    private function obtenerOrigenPorDefecto(): OrigenLead
    {
        return OrigenLead::whereRaw('LOWER(TRIM(nombre)) = ?', ['web'])->first()
            ?? OrigenLead::orderBy('id_origen')->first()
            ?? OrigenLead::create(['nombre' => 'Web']);
    }

    private function resolverOrigen(string $valor): ?OrigenLead
    {
        $valor = trim($valor);

        if ($valor === '') {
            return null;
        }

        if (is_numeric($valor)) {
            $encontrado = OrigenLead::find((int) $valor);
            if ($encontrado) {
                return $encontrado;
            }
        }

        $existente = OrigenLead::whereRaw('LOWER(TRIM(nombre)) = ?', [mb_strtolower($valor)])->first();
        if ($existente) {
            return $existente;
        }

        try {
            return OrigenLead::create(['nombre' => $valor]);
        } catch (\Throwable) {
            return null;
        }
    }

    private function resolverProfesion(string $valor): ?Profesion
    {
        $valor = trim($valor);

        if (is_numeric($valor)) {
            $profesion = Profesion::find((int) $valor);
            if ($profesion !== null) {
                return $profesion;
            }

            return null;
        } else {
            $profesion = Profesion::whereRaw('LOWER(TRIM(nombre)) = ?', [mb_strtolower($valor)])->first();
            if ($profesion !== null) {
                return $profesion;
            }
        }

        return Profesion::create(['nombre' => $valor]);
    }

    private function normalizarCabecera(array $row): array
    {
        return array_map(function ($value) {
            $nombre = $this->normalizarNombreColumna($value);
            return match ($nombre) {
                'origen', 'nombreorigen' => 'origen',
                'profesion', 'nombreprofesion' => 'profesion',
                'residencia' => 'residencia',
                default => $nombre,
            };
        }, $row);
    }

    private function normalizarNombreColumna(mixed $value): string
    {
        $nombre = mb_strtolower(trim((string) $value, " \t\n\r\0\x0B\xEF\xBB\xBF"));
        $nombre = strtr($nombre, [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
            'ü' => 'u',
        ]);
        $nombre = str_replace([' ', '-', '.'], '_', $nombre);
        return match ($nombre) {
            'id_origen', 'origen_id' => 'id_origen',
            'origen_nombre', 'nombre_origen' => 'origen',
            'id_profesion', 'profesion_id' => 'id_profesion',
            'profesion_nombre', 'nombre_profesion' => 'profesion',
            default => $nombre,
        };
    }

    private function registrarError(ImportacionCsv $importacion, int $linea, string $motivo): void
    {
        $importacion->errores()->create([
            'numero_linea' => $linea,
            'motivo' => $motivo,
        ]);
    }
}
