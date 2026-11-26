<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Requisito 4: Bitácora de Auditoría del Sistema (inicios de sesión, fallos, IPs y accesos).
     */
    public function up(): void
    {
        Schema::create('auditoria_accesos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->nullable()->constrained('usuarios', 'id_usuario')->nullOnDelete();
            $table->string('tipo_evento', 50); // LOGIN_EXITOSO, LOGIN_FALLIDO, LOGOUT, ACCESO_DENEGADO
            $table->string('ip', 45);
            $table->text('user_agent')->nullable();
            $table->text('detalles')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditoria_accesos');
    }
};
