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
        Schema::create('bitacora', function (Blueprint $table) {
            $table->id('id_evento');
            $table->foreignId('id_lead')->constrained('leads', 'id_lead')->cascadeOnDelete();
            $table->foreignId('id_usuario')->nullable()->constrained('usuarios', 'id_usuario')->nullOnDelete();
            $table->string('tipo', 20); // NOTA, CAMBIO_ESTADO, ASIGNACION, PAGO, DESCUENTO
            $table->text('descripcion');
            $table->foreignId('id_etapa_anterior')->nullable()->constrained('etapas_pipeline', 'id_etapa')->nullOnDelete();
            $table->foreignId('id_etapa_nueva')->nullable()->constrained('etapas_pipeline', 'id_etapa')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bitacora');
    }
};
