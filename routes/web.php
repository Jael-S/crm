<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LeadAssignmentController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\LookupController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CsvImportController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\LeadInterestController;
use App\Http\Controllers\CoordinatorVersionController;

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

    // Bolsa Común (Administrador y Vendedor) - Definido antes de {id} para evitar colisión
    Route::middleware('checkRole:Administrador,Vendedor')->group(function () {
        Route::get('/leads/bolsa-comun', [LeadController::class, 'pool'])->name('leads.pool');
    });

    // Importación CSV (Admin/Coordinador) — antes de /leads/{id}
    Route::middleware('checkRole:Administrador,Coordinador')->group(function () {
        Route::get('/leads/import', [CsvImportController::class, 'index'])->name('importar.csv');
        Route::post('/leads/import', [CsvImportController::class, 'store'])->name('importar.csv.store');
    });

    // Asignación masiva automática Round-Robin (Exclusivo Administrador)
    Route::middleware('checkRole:Administrador')->group(function () {
        Route::post('/leads/asignar-automatico', [LeadAssignmentController::class, 'roundRobin'])->name('leads.round-robin');
    });

    // Módulo 2: Gestión de Prospectos (Leads) - Acceso según rol
    Route::middleware('checkRole:Administrador,Coordinador,Vendedor')->group(function () {
        Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
        Route::get('/leads/create', [LeadController::class, 'create'])->name('leads.create');
        Route::post('/leads', [LeadController::class, 'store'])->name('leads.store');
        Route::get('/leads/{id}', [LeadController::class, 'show'])->whereNumber('id')->name('leads.show');
        Route::get('/leads/{id}/edit', [LeadController::class, 'edit'])->whereNumber('id')->name('leads.edit');
        Route::put('/leads/{id}', [LeadController::class, 'update'])->whereNumber('id')->name('leads.update');
    });

    // Asignación manual y Transferencias (Administrador y Coordinador - RF2.3 Miriam)
    Route::middleware('checkRole:Administrador,Coordinador')->group(function () {
        Route::post('/leads/{id}/asignar', [LeadAssignmentController::class, 'assign'])->whereNumber('id')->name('leads.assign');
        Route::post('/leads/{id}/transferir', [LeadAssignmentController::class, 'transfer'])->whereNumber('id')->name('leads.transfer');
    });

    // Lookups API endpoints para uso interno
    Route::get('/lookups/origenes', [LookupController::class, 'origenes']);
    Route::get('/lookups/etapas', [LookupController::class, 'etapas']);
    Route::get('/lookups/motivos-perdida', [LookupController::class, 'motivosPerdida']);
    // Catálogo Externo (Proyecto 2) - visible para Administrador y Coordinador
    Route::middleware('checkRole:Administrador,Coordinador')->group(function () {
        Route::get('/catalogo', [CatalogController::class, 'index'])->name('catalogo.index');
    });

    // Mantiene disponible el enlace anterior mientras se migra al nuevo path.
    Route::redirect('/catalogo-externo', '/catalogo')->name('catalogo.legacy');
    //Lead Interests (Intereses de Prospectos) - Acceso según rol
    Route::middleware('checkRole:Administrador,Coordinador,Vendedor')->group(function () {
    Route::get('/leads/{id}/intereses', [LeadInterestController::class, 'index'])->name('leads.intereses.index');
    Route::post('/leads/{id}/intereses', [LeadInterestController::class, 'store'])->name('leads.intereses.store');
    Route::delete('/leads/{id}/intereses/{interesId}', [LeadInterestController::class, 'destroy'])->name('leads.intereses.destroy');
    });
    //Control de versiones de coordinadores (Administrador)
    Route::middleware('checkRole:Administrador')->group(function () {
    Route::get('/coordinadores/versiones', [CoordinatorVersionController::class, 'assignmentIndex'])->name('coordinadores.versiones.assignment');
    Route::get('/coordinadores/{id}/versiones', [CoordinatorVersionController::class, 'index'])->name('coordinadores.versiones.index');
    Route::post('/coordinadores/{id}/versiones', [CoordinatorVersionController::class, 'store'])->name('coordinadores.versiones.store');
    Route::delete('/coordinadores/{id}/versiones/{version}', [CoordinatorVersionController::class, 'destroy'])->name('coordinadores.versiones.destroy');
    Route::put('/coordinadores/{id}/versiones', [CoordinatorVersionController::class, 'update'])->name('coordinadores.versiones.update');
    });
});
