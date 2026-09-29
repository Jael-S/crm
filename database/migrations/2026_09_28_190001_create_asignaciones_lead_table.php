<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('asignaciones_lead', function (Blueprint $table) {
            $table->id('id_asignacion');
            $table->foreignId('id_lead')->constrained('leads', 'id_lead')->cascadeOnDelete();
            
            $table->foreignId('id_vendedor_anterior')->nullable()->constrained('usuarios', 'id_usuario')->nullOnDelete();
            $table->foreignId('id_vendedor_nuevo')->constrained('usuarios', 'id_usuario');
            $table->foreignId('asignado_por')->constrained('usuarios', 'id_usuario');
            
            $table->string('tipo', 20); // 'MANUAL', 'ROUND_ROBIN', 'TRANSFERENCIA'
            $table->string('motivo', 200)->nullable();
            
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asignaciones_lead');
    }
};
