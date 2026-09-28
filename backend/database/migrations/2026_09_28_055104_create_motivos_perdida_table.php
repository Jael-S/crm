<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('motivos_perdida', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: Sin presupuesto, No interesado, Horario incompatible
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('motivos_perdida');
    }
};