<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('coordinador_version', 'nombre_snapshot')) {
            Schema::table('coordinador_version', function (Blueprint $table) {
                $table->dropColumn('nombre_snapshot');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('coordinador_version', 'nombre_snapshot')) {
            Schema::table('coordinador_version', function (Blueprint $table) {
                $table->string('nombre_snapshot', 150)->default('Versión externa');
            });
        }
    }
};
