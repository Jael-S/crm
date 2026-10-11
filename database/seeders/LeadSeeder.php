<?php

namespace Database\Seeders;

use App\Models\AsignacionLead;
use App\Models\Lead;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds for testing Leads, Bolsa Común & 6-Stage Pipeline.
     */
    public function run(): void
    {
        // Limpiar para pruebas
        DB::table('asignaciones_lead')->delete();
        DB::table('leads')->delete();

        // 1. Prospectos de demostración en Bolsa Común (sin vendedor, Etapa 1: Nuevo)
        $bolsaComun = [
            [
                'nombre' => 'María Laura Rojas',
                'telefono' => '71029384',
                'correo' => 'marialaura@gmail.com',
                'id_origen' => 1, // Facebook
                'id_etapa' => 1,  // Nuevo
                'id_vendedor' => null,
                'id_profesion' => 1,
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
                'id_profesion' => 2,
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
                'id_profesion' => 3,
                'created_by' => 1,
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subHours(2),
            ],
            [
                'nombre' => 'Jorge Suárez Vaca',
                'telefono' => '70099881',
                'correo' => 'jorge.suarez@gmail.com',
                'id_origen' => 4, // Referido
                'id_etapa' => 1,  // Nuevo
                'id_vendedor' => null,
                'created_by' => 1,
                'created_at' => now()->subHour(),
                'updated_at' => now()->subHour(),
            ],
        ];

        foreach ($bolsaComun as $data) {
            Lead::create($data);
        }

        // 2. Prospecto en Etapa 2: En Contacto (Asignado a Nicol Flores, id_usuario = 3)
        $leadContacto = Lead::create([
            'nombre' => 'Camila Andrea Torrico',
            'telefono' => '77334455',
            'correo' => 'camila.torrico@gmail.com',
            'id_origen' => 1, // Facebook
            'id_etapa' => 2,  // En Contacto
            'id_vendedor' => 3, // Nicol
            'id_profesion' => 1, // Sistemas
            'id_descuento' => 1, // Pronto Pago
            'fecha_asignacion' => now()->subDays(2),
            'created_by' => 1,
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(2),
        ]);

        AsignacionLead::create([
            'id_lead' => $leadContacto->id_lead,
            'id_vendedor_anterior' => null,
            'id_vendedor_nuevo' => 3,
            'asignado_por' => 1,
            'tipo' => 'MANUAL',
            'motivo' => 'Asignación directa a Nicol Flores',
            'created_at' => now()->subDays(2),
        ]);

        // 3. Prospecto en Etapa 3: Seguimiento (Asignado a Carlos Mendoza, id_usuario = 4)
        $leadSeguimiento = Lead::create([
            'nombre' => 'Alejandro Morales Paz',
            'telefono' => '75566778',
            'correo' => 'alejandro.morales@yahoo.es',
            'id_origen' => 2, // WhatsApp
            'id_etapa' => 3,  // Seguimiento
            'id_vendedor' => 4, // Carlos
            'id_profesion' => 4, // Auditoría
            'fecha_asignacion' => now()->subDays(2),
            'created_by' => 1,
            'created_at' => now()->subDays(4),
            'updated_at' => now()->subDays(1),
        ]);

        AsignacionLead::create([
            'id_lead' => $leadSeguimiento->id_lead,
            'id_vendedor_anterior' => null,
            'id_vendedor_nuevo' => 4,
            'asignado_por' => 1,
            'tipo' => 'MANUAL',
            'motivo' => 'Asignación directa a Carlos Mendoza',
            'created_at' => now()->subDays(2),
        ]);

        // 4. Prospecto en Etapa 4: Promesa de Pago (Asignado a Nicol Flores, id_usuario = 3)
        $leadPromesa = Lead::create([
            'nombre' => 'Luciana Beltrán Méndez',
            'telefono' => '77123456',
            'correo' => 'luciana.beltran@gmail.com',
            'id_origen' => 1, // Facebook
            'id_etapa' => 4,  // Promesa de Pago
            'id_vendedor' => 3, // Nicol
            'id_profesion' => 5, // Comercial / Marketing
            'id_descuento' => 1, // Beca Pronto Pago (15%)
            'fecha_asignacion' => now()->subDays(3),
            'created_by' => 1,
            'created_at' => now()->subDays(5),
            'updated_at' => now()->subHours(8),
        ]);

        AsignacionLead::create([
            'id_lead' => $leadPromesa->id_lead,
            'id_vendedor_anterior' => null,
            'id_vendedor_nuevo' => 3,
            'asignado_por' => 1,
            'tipo' => 'MANUAL',
            'motivo' => 'Asignación a Nicol Flores para cierre',
            'created_at' => now()->subDays(3),
        ]);

        // 5. Prospecto en Etapa 5: Convertido (Asignado a Carlos Mendoza, id_usuario = 4, con datos completos de alumno RF3.4)
        $leadConvertido = Lead::create([
            'nombre' => 'Mateo Benítez Vargas',
            'telefono' => '78234567',
            'correo' => 'mateo.benitez@gmail.com',
            'id_origen' => 2, // WhatsApp
            'id_etapa' => 5,  // Convertido
            'id_vendedor' => 4, // Carlos
            'id_profesion' => 1, // Sistemas
            'id_descuento' => 2, // Convenio Institucional (20%)
            'ci' => '6987412 SC',
            'nombre_completo' => 'Mateo Benítez Vargas',
            'fecha_nacimiento' => '1997-08-20',
            'ciudad' => 'Santa Cruz de la Sierra',
            'fecha_asignacion' => now()->subDays(4),
            'created_by' => 1,
            'created_at' => now()->subDays(6),
            'updated_at' => now()->subHours(4),
        ]);

        AsignacionLead::create([
            'id_lead' => $leadConvertido->id_lead,
            'id_vendedor_anterior' => null,
            'id_vendedor_nuevo' => 4,
            'asignado_por' => 1,
            'tipo' => 'MANUAL',
            'motivo' => 'Asignación y conversión exitosa',
            'created_at' => now()->subDays(4),
        ]);

        // 6. Prospecto en Etapa 6: Perdido (Asignado a Nicol Flores, id_usuario = 3, con motivo y comentario RF3.3)
        $leadPerdido = Lead::create([
            'nombre' => 'Daniela Castro Soliz',
            'telefono' => '70345678',
            'correo' => 'daniela.castro@gmail.com',
            'id_origen' => 3, // Web
            'id_etapa' => 6,  // Perdido
            'id_vendedor' => 3, // Nicol
            'id_profesion' => 3, // Administración
            'id_motivo_perdida' => 1, // Factor económico
            'comentario_perdida' => 'El prospecto indicó que no cuenta con el presupuesto requerido este semestre.',
            'fecha_asignacion' => now()->subDays(5),
            'created_by' => 1,
            'created_at' => now()->subDays(7),
            'updated_at' => now()->subHours(2),
        ]);

        AsignacionLead::create([
            'id_lead' => $leadPerdido->id_lead,
            'id_vendedor_anterior' => null,
            'id_vendedor_nuevo' => 3,
            'asignado_por' => 1,
            'tipo' => 'MANUAL',
            'motivo' => 'Asignado para seguimiento inicial',
            'created_at' => now()->subDays(5),
        ]);

        // Secuencias de PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('leads', 'id_lead'), coalesce(max(id_lead), 1)) FROM leads;");
            DB::statement("SELECT setval(pg_get_serial_sequence('asignaciones_lead', 'id_asignacion'), coalesce(max(id_asignacion), 1)) FROM asignaciones_lead;");
        }
    }
}
