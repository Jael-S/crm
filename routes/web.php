<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LookupController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

// Redirección inicial
Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

// Rutas Públicas (Auth)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// Rutas Protegidas por Autenticación
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard (todos los roles autenticados)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Módulo 1: Gestión de Usuarios (Exclusivo Administrador)
    Route::middleware('checkRole:Administrador')->group(function () {
        Route::get('/usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
        Route::post('/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
        Route::put('/usuarios/{id}', [UsuarioController::class, 'update'])->name('usuarios.update');
        Route::patch('/usuarios/{id}/status', [UsuarioController::class, 'toggleStatus'])->name('usuarios.toggle-status');
        Route::patch('/usuarios/{id}/round-robin', [UsuarioController::class, 'toggleRoundRobin'])->name('usuarios.toggle-round-robin');

        Route::get('/lookups', [LookupController::class, 'index'])->name('lookups.index');
    });

    // Lookups API endpoints para uso interno
    Route::get('/lookups/origenes', [LookupController::class, 'origenes']);
    Route::get('/lookups/etapas', [LookupController::class, 'etapas']);
    Route::get('/lookups/motivos-perdida', [LookupController::class, 'motivosPerdida']);
});
