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
        // 1. Columnas en lead_interes
        Schema::table('lead_interes', function (Blueprint $table) {
            if (!Schema::hasColumn('lead_interes', 'estado')) {
                $table->string('estado', 25)->default('EN_SEGUIMIENTO');
            }
            if (!Schema::hasColumn('lead_interes', 'monto_pactado')) {
                $table->decimal('monto_pactado', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('lead_interes', 'id_descuento')) {
                $table->foreignId('id_descuento')->nullable()->constrained('descuentos', 'id_descuento')->nullOnDelete();
            }
            if (!Schema::hasColumn('lead_interes', 'created_at')) {
                $table->timestamps();
            }
        });

        // 2. Columnas en comprobantes_pago
        Schema::table('comprobantes_pago', function (Blueprint $table) {
            if (!Schema::hasColumn('comprobantes_pago', 'id_interes')) {
                $table->foreignId('id_interes')->nullable()->constrained('lead_interes', 'id_interes')->nullOnDelete();
            }
            if (!Schema::hasColumn('comprobantes_pago', 'metodo_pago')) {
                $table->string('metodo_pago', 30)->default('TRANSFERENCIA');
            }
            if (!Schema::hasColumn('comprobantes_pago', 'referencia_transaccion')) {
                $table->string('referencia_transaccion', 100)->nullable();
            }
        });

        // 3. Columnas en envios_matricula
        Schema::table('envios_matricula', function (Blueprint $table) {
            if (!Schema::hasColumn('envios_matricula', 'id_interes')) {
                $table->foreignId('id_interes')->nullable()->constrained('lead_interes', 'id_interes')->nullOnDelete();
            }
            if (!Schema::hasColumn('envios_matricula', 'fecha_envio')) {
                $table->timestamp('fecha_envio')->useCurrent();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('envios_matricula', function (Blueprint $table) {
            if (Schema::hasColumn('envios_matricula', 'id_interes')) {
                $table->dropConstrainedForeignId('id_interes');
            }
        });

        Schema::table('comprobantes_pago', function (Blueprint $table) {
            if (Schema::hasColumn('comprobantes_pago', 'id_interes')) {
                $table->dropConstrainedForeignId('id_interes');
            }
            if (Schema::hasColumn('comprobantes_pago', 'metodo_pago')) {
                $table->dropColumn('metodo_pago');
            }
            if (Schema::hasColumn('comprobantes_pago', 'referencia_transaccion')) {
                $table->dropColumn('referencia_transaccion');
            }
        });

        Schema::table('lead_interes', function (Blueprint $table) {
            if (Schema::hasColumn('lead_interes', 'id_descuento')) {
                $table->dropConstrainedForeignId('id_descuento');
            }
            if (Schema::hasColumn('lead_interes', 'monto_pactado')) {
                $table->dropColumn('monto_pactado');
            }
            if (Schema::hasColumn('lead_interes', 'estado')) {
                $table->dropColumn('estado');
            }
            if (Schema::hasColumn('lead_interes', 'created_at')) {
                $table->dropTimestamps();
            }
        });
    }
};
