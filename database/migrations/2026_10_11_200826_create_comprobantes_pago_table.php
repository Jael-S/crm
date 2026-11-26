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
            $table->foreignId('id_interes')->nullable()->constrained('lead_interes', 'id_interes')->nullOnDelete();
            $table->foreignId('subido_por')->constrained('usuarios', 'id_usuario');
            $table->string('archivo_url', 255)->nullable();
            $table->string('tipo_archivo', 50)->default('TRANSF'); // imagen, pdf, TRANSF, QR_PAGOFACIL, STRIPE_CARD
            $table->decimal('monto', 10, 2)->nullable();
            $table->string('metodo_pago', 30)->default('TRANSFERENCIA'); // TRANSFERENCIA, QR, TARJETA
            $table->string('referencia_transaccion', 100)->nullable();
            $table->string('estado', 20)->default('PENDIENTE'); // PENDIENTE, APROBADO, RECHAZADO, ERROR
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
