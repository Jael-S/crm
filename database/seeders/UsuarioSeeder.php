<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password123');

        DB::table('usuarios')->insertOrIgnore([
            [
                'id_usuario' => 1,
                'id_rol' => 1, // Administrador
                'nombre_completo' => 'Nataly Valenzuela (Admin)',
                'correo' => 'admin@crm.bo',
                'password_hash' => $defaultPassword,
                'activo' => true,
                'participa_round_robin' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_usuario' => 2,
                'id_rol' => 2, // Coordinador
                'nombre_completo' => 'Jael Sandoval (Coordinadora)',
                'correo' => 'coordinador@crm.bo',
                'password_hash' => $defaultPassword,
                'activo' => true,
                'participa_round_robin' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_usuario' => 3,
                'id_rol' => 3, // Vendedor 1
                'nombre_completo' => 'Nicol Flores (Vendedora)',
                'correo' => 'vendedor1@crm.bo',
                'password_hash' => $defaultPassword,
                'activo' => true,
                'participa_round_robin' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_usuario' => 4,
                'id_rol' => 3, // Vendedor 2
                'nombre_completo' => 'Carlos Mendoza (Vendedor)',
                'correo' => 'vendedor2@crm.bo',
                'password_hash' => $defaultPassword,
                'activo' => true,
                'participa_round_robin' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('usuarios', 'id_usuario'), COALESCE(MAX(id_usuario), 1)) FROM usuarios;");
        }
    }
}
