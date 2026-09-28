<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrigenLeadSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('origenes_lead')->insert([
            ['id_origen' => 1, 'nombre' => 'Facebook'],
            ['id_origen' => 2, 'nombre' => 'WhatsApp'],
            ['id_origen' => 3, 'nombre' => 'Web'],
            ['id_origen' => 4, 'nombre' => 'Referido'],
        ]);
    }
}