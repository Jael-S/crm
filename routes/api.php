<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LookupController; // <-- 1. Importa tu controlador

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// --- 2. Agrega tus rutas de Lookups debajo ---
Route::prefix('v1/lookups')->group(function () {
    Route::get('/origenes', [LookupController::class, 'origenes']);
    Route::get('/etapas', [LookupController::class, 'etapas']);
    Route::get('/motivos-perdida', [LookupController::class, 'motivosPerdida']);
});