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
        Schema::create('leads', function (Blueprint $table) {
            $table->id('id_lead');
            $table->string('nombre', 120);
            $table->string('telefono', 20);
            $table->string('correo', 120)->nullable();
            
            // Catálogos y referencias
            $table->foreignId('id_origen')->constrained('origenes_lead', 'id_origen');
            $table->foreignId('id_etapa')->default(1)->constrained('etapas_pipeline', 'id_etapa');
            
            // Asignación de Vendedor (NULL = Bolsa Común)
            $table->foreignId('id_vendedor')->nullable()->constrained('usuarios', 'id_usuario')->nullOnDelete();
            
            // Pérdida de prospecto (Fase 2)
            $table->foreignId('id_motivo_perdida')->nullable()->constrained('motivos_perdida', 'id_motivo')->nullOnDelete();
            $table->text('comentario_perdida')->nullable();
            
            // Importación CSV (Fase 1 - Dev C)
            $table->foreignId('id_importacion')->nullable()->constrained('importaciones_csv', 'id_importacion')->nullOnDelete();
            $table->timestamp('fecha_asignacion')->nullable();
            
            // Datos requeridos al convertir el prospecto (Fase 2 / 3)
            $table->string('ci', 20)->nullable();
            $table->string('nombre_completo', 150)->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->string('ciudad', 60)->nullable();
            
            // Auditoría de creación
            $table->foreignId('created_by')->constrained('usuarios', 'id_usuario');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
