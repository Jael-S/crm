<?php

namespace Database\Seeders;

use App\Models\Profesion;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProfesionSeeder extends Seeder
{
    /**
     * Catálogo base de profesiones comunes para prospectos universitarios.
     */
    public function run(): void
    {
        $profesiones = [
            'Ingeniería de Sistemas / Software',
            'Ingeniería Informática / Redes',
            'Licenciatura en Administración de Empresas',
            'Contaduría Pública / Auditoría',
            'Ingeniería Comercial / Marketing',
            'Derecho / Ciencias Jurídicas',
            'Medicina / Ciencias de la Salud',
            'Educación / Pedagogía',
            'Estudiante Universitario',
            'Bachiller',
            'Profesional Independiente / Emprendedor',
        ];

        foreach ($profesiones as $nombre) {
            Profesion::firstOrCreate(['nombre' => $nombre]);
        }

        // En PostgreSQL reiniciar la secuencia para evitar colisiones
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('profesiones', 'id_profesion'), coalesce(max(id_profesion), 1)) FROM profesiones;");
        }
    }
}
