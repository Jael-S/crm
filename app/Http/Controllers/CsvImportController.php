<?php

namespace App\Http\Controllers;

use App\Http\Requests\CsvImportRequest;
use App\Models\ImportacionCsv;
use App\Models\OrigenLead;
use App\Services\CsvImportService;
use Inertia\Inertia;
use Inertia\Response;

class CsvImportController extends Controller
{
    public function __construct(
        protected CsvImportService $csvImportService
    ) {}

    public function index(): Response
    {
        $historial = ImportacionCsv::with('usuario')
            ->orderByDesc('created_at')
            ->orderByDesc('id_importacion')
            ->limit(50)
            ->get();

        $origenes = OrigenLead::orderBy('id_origen')->get(['id_origen', 'nombre']);

        return Inertia::render('Import/Csv', [
            'historial' => $historial,
            'origenes' => $origenes,
            'resultado' => session('import_resultado'),
        ]);
    }

    public function store(CsvImportRequest $request)
    {
        try {
            $resultado = $this->csvImportService->procesar(
                $request->file('archivo_csv'),
                (int) auth()->id()
            );

            $importacion = $resultado['importacion'];
            $errores = $resultado['errores'];

            $mensaje = sprintf(
                'Importación #%d: %d exitosa(s), %d fallida(s) de %d fila(s).',
                $importacion->id_importacion,
                $importacion->filas_exitosas,
                $importacion->filas_fallidas,
                $importacion->total_filas
            );

            return redirect()
                ->route('importar.csv')
                ->with('success', $mensaje)
                ->with('import_resultado', [
                    'errores' => $errores,
                    'filas_exitosas' => $importacion->filas_exitosas,
                    'filas_fallidas' => $importacion->filas_fallidas,
                    'total_filas' => $importacion->total_filas,
                ]);
        } catch (\Throwable $e) {
            return redirect()
                ->route('importar.csv')
                ->with('error', 'Ocurrió un error al procesar el archivo: '.$e->getMessage());
        }
    }
}
