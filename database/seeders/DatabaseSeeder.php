<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Ejecutamos los seeders de Lookups
        $this->call([
            EtapaPipelineSeeder::class,
            OrigenLeadSeeder::class,
            MotivoPerdidaSeeder::class,
        ]);

        // 2. Usuario de prueba por defecto de Laravel (lo puedes dejar temporalmente)
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
