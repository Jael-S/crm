<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('importaciones_csv_errores', function (Blueprint $table) {
            $table->id('id_error');
            $table->foreignId('id_importacion')
                ->constrained('importaciones_csv', 'id_importacion')
                ->cascadeOnDelete();
            $table->unsignedInteger('numero_linea');
            $table->text('motivo');
            $table->index(['id_importacion', 'numero_linea']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('importaciones_csv_errores');
    }
};
