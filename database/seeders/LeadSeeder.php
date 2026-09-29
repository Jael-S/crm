<?php

namespace Database\Seeders;

use App\Models\AsignacionLead;
use App\Models\Lead;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds for testing Leads & Bolsa Común.
     */
    public function run(): void
    {
        // Limpiar para pruebas si es necesario
        DB::table('asignaciones_lead')->delete();
        DB::table('leads')->delete();

        // 1. Prospectos de demostración en Bolsa Común (sin vendedor)
        $bolsaComun = [
            [
                'nombre' => 'María Laura Rojas',
                'telefono' => '71029384',
                'correo' => 'marialaura@gmail.com',
                'id_origen' => 1, // Facebook
                'id_etapa' => 1,  // Nuevo
                'id_vendedor' => null,
                'created_by' => 1, // Admin Nataly
                'created_at' => now()->subHours(5),
                'updated_at' => now()->subHours(5),
            ],
            [
                'nombre' => 'Roberto Gómez Bolaños',
                'telefono' => '76543210',
                'correo' => 'roberto.gomez@hotmail.com',
                'id_origen' => 2, // WhatsApp
                'id_etapa' => 1,  // Nuevo
                'id_vendedor' => null,
                'created_by' => 2, // Coordinador Jael
                'created_at' => now()->subHours(3),
                'updated_at' => now()->subHours(3),
            ],
            [
                'nombre' => 'Fernanda Aguilera',
                'telefono' => '78901234',
                'correo' => 'fer.aguilera@outlook.com',
                'id_origen' => 3, // Web
                'id_etapa' => 1,  // Nuevo
                'id_vendedor' => null,
                'created_by' => 1,
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subHours(2),
            ],
            [
                'nombre' => 'Jorge Suárez Vaca',
                'telefono' => '70099881',
                'correo' => 'jorge.suarez@gmail.com',
                'id_origen' => 4, // Referido
                'id_etapa' => 1,  // Nuevo (está en bolsa común, nadie lo ha contactado)
                'id_vendedor' => null,
                'created_by' => 1,
                'created_at' => now()->subHour(),
                'updated_at' => now()->subHour(),
            ],
        ];

        foreach ($bolsaComun as $data) {
            Lead::create($data);
        }

        // 2. Prospecto asignado a Nicol Flores (id_usuario = 3, Vendedora 1)
        $leadNicol = Lead::create([
            'nombre' => 'Camila Andrea Torrico',
            'telefono' => '77334455',
            'correo' => 'camila.torrico@gmail.com',
            'id_origen' => 1, // Facebook
            'id_etapa' => 2,  // En Contacto
            'id_vendedor' => 3, // Nicol
            'fecha_asignacion' => now()->subDays(1),
            'created_by' => 1,
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(1),
        ]);

        AsignacionLead::create([
            'id_lead' => $leadNicol->id_lead,
            'id_vendedor_anterior' => null,
            'id_vendedor_nuevo' => 3,
            'asignado_por' => 1,
            'tipo' => 'MANUAL',
            'motivo' => 'Asignación directa a Nicol Flores',
            'created_at' => now()->subDays(1),
        ]);

        // 3. Prospecto asignado a Carlos Mendoza (id_usuario = 4, Vendedor 2)
        $leadCarlos = Lead::create([
            'nombre' => 'Alejandro Morales Paz',
            'telefono' => '75566778',
            'correo' => 'alejandro.morales@yahoo.es',
            'id_origen' => 2, // WhatsApp
            'id_etapa' => 3,  // Seguimiento
            'id_vendedor' => 4, // Carlos
            'fecha_asignacion' => now()->subDays(1),
            'created_by' => 1,
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(1),
        ]);

        AsignacionLead::create([
            'id_lead' => $leadCarlos->id_lead,
            'id_vendedor_anterior' => null,
            'id_vendedor_nuevo' => 4,
            'asignado_por' => 1,
            'tipo' => 'MANUAL',
            'motivo' => 'Asignación directa a Carlos Mendoza',
            'created_at' => now()->subDays(1),
        ]);
    }
}
