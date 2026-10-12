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
        Schema::create('comprobantes_pago', function (Blueprint $table) {
            $table->id('id_comprobante');
            $table->foreignId('id_lead')->constrained('leads', 'id_lead')->cascadeOnDelete();
            $table->foreignId('subido_por')->constrained('usuarios', 'id_usuario');
            $table->string('archivo_url', 255);
            $table->string('tipo_archivo', 10); // imagen, pdf
            $table->decimal('monto', 10, 2)->nullable();
            $table->string('estado', 15)->default('PENDIENTE'); // PENDIENTE, APROBADO, RECHAZADO
            $table->foreignId('revisado_por')->nullable()->constrained('usuarios', 'id_usuario')->nullOnDelete();
            $table->timestamp('fecha_revision')->nullable();
            $table->text('comentario_rechazo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comprobantes_pago');
    }
};
