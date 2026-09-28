<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('origenes_lead', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: Facebook, WhatsApp, Referido, etc.
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('origenes_lead');
    }
};