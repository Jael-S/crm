<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('origenes_lead', function (Blueprint $table) {
            $table->id('id_origen');
            $table->string('nombre', 50);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('origenes_lead');
    }
};