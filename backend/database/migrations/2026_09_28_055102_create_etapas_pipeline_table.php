<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etapas_pipeline', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Nuevo, Contactado, Interesado, Promesa de Pago, Convertido, Perdido
            $table->integer('orden'); // 1 al 6 para mantener la secuencia visual del Kanban
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etapas_pipeline');
    }
};