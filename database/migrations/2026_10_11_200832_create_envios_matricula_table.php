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
        Schema::create('envios_matricula', function (Blueprint $table) {
            $table->id('id_envio');
            $table->foreignId('id_lead')->constrained('leads', 'id_lead')->cascadeOnDelete();
            $table->foreignId('id_comprobante')->nullable()->constrained('comprobantes_pago', 'id_comprobante')->nullOnDelete();
            $table->jsonb('payload')->nullable();
            $table->string('estado', 15)->default('PENDIENTE'); // PENDIENTE, ENVIADO, ERROR
            $table->text('respuesta_api')->nullable();
            $table->integer('intentos')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('envios_matricula');
    }
};
