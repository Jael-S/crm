<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\LookupController;

Route::get('/', function () {
    return Inertia::render('Dashboard/Index');
});

Route::get('/importador', function () {
    return Inertia::render('Import/Csv');
});

Route::get('/catalogo', function () {
    return Inertia::render('Catalog/Index');
});

Route::get('/api/lookups', [LookupController::class, 'index']);
