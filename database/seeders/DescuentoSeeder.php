<?php

namespace Database\Seeders;

use App\Models\Descuento;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DescuentoSeeder extends Seeder
{
    /**
     * Catálogo base de descuentos comerciales institucionales.
     */
    public function run(): void
    {
        $descuentos = [
            [
                'nombre' => 'Beca Pronto Pago',
                'porcentaje' => 15.00,
                'descripcion' => 'Descuento especial por inscripción y pago anticipado antes de la fecha límite.',
                'activo' => true,
            ],
            [
                'nombre' => 'Convenio Institucional',
                'porcentaje' => 20.00,
                'descripcion' => 'Descuento aplicable a miembros de empresas e instituciones con convenio firmado.',
                'activo' => true,
            ],
            [
                'nombre' => 'Beca Excelencia Académica',
                'porcentaje' => 25.00,
                'descripcion' => 'Descuento por mérito académico sobresaliente en pregrado.',
                'activo' => true,
            ],
            [
                'nombre' => 'Descuento Exalumno',
                'porcentaje' => 10.00,
                'descripcion' => 'Beneficio para egresados y titulados de la universidad.',
                'activo' => true,
            ],
            [
                'nombre' => 'Descuento Promocional Feria',
                'porcentaje' => 5.00,
                'descripcion' => 'Cupón especial otorgado durante ferias y eventos vocacionales.',
                'activo' => true,
            ],
        ];

        foreach ($descuentos as $desc) {
            Descuento::firstOrCreate(
                ['nombre' => $desc['nombre']],
                $desc
            );
        }

        // En PostgreSQL reiniciar la secuencia para evitar colisiones
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('descuentos', 'id_descuento'), coalesce(max(id_descuento), 1)) FROM descuentos;");
        }
    }
}
