<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etapas_pipeline', function (Blueprint $table) {
            $table->id('id_etapa');
            $table->string('nombre', 30);
            $table->integer('orden');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etapas_pipeline');
    }
};