<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lead_interes', function (Blueprint $table) {
            $table->id('id_interes');
            $table->foreignId('id_lead')->constrained('leads', 'id_lead')->onDelete('cascade');
            $table->string('tipo', 10); // 'PROGRAMA' o 'MODULO'
            $table->unsignedBigInteger('id_version_externo')->nullable();
            $table->unsignedBigInteger('id_modulo_externo')->nullable();
            $table->string('nombre_snapshot', 150);
        });

        // Agregamos la regla CHECK de validación en la base de datos PostgreSQL
        // para asegurar que estrictamente venga lleno uno de los dos IDs externos.
        DB::statement("
            ALTER TABLE lead_interes ADD CONSTRAINT chk_tipo_interes 
            CHECK (
                (tipo = 'PROGRAMA' AND id_version_externo IS NOT NULL AND id_modulo_externo IS NULL) 
                OR 
                (tipo = 'MODULO' AND id_version_externo IS NULL AND id_modulo_externo IS NOT NULL)
            )
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_interes');
    }
};