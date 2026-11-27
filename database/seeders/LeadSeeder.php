<?php

namespace Database\Seeders;

use App\Models\AsignacionLead;
use App\Models\ComprobantePago;
use App\Models\EnvioMatricula;
use App\Models\Lead;
use App\Models\LeadInteres;
use App\Models\Recordatorio;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds for testing Leads, Bolsa Común, Multi-Intereses & Pipeline.
     * Generates 52 realistic Bolivian leads with complete corporate data for high-impact analytics.
     */
    public function run(): void
    {
        // 1. Limpieza de tablas dependientes
        DB::table('bitacora')->delete();
        DB::table('recordatorios')->delete();
        DB::table('envios_matricula')->delete();
        DB::table('comprobantes_pago')->delete();
        DB::table('lead_interes')->delete();
        DB::table('asignaciones_lead')->delete();
        DB::table('leads')->delete();

        // 2. Reseteo de secuencias en PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('leads', 'id_lead'), 1, false);");
            DB::statement("SELECT setval(pg_get_serial_sequence('lead_interes', 'id_interes'), 1, false);");
            DB::statement("SELECT setval(pg_get_serial_sequence('comprobantes_pago', 'id_comprobante'), 1, false);");
            DB::statement("SELECT setval(pg_get_serial_sequence('envios_matricula', 'id_envio'), 1, false);");
            DB::statement("SELECT setval(pg_get_serial_sequence('asignaciones_lead', 'id_asignacion'), 1, false);");
            DB::statement("SELECT setval(pg_get_serial_sequence('recordatorios', 'id_recordatorio'), 1, false);");
        }

        // Definición de prospectos bolivianos reales estructurados por etapa comercial
        $prospectos = [
            // =========================================================================
            // ETAPA 1: NUEVO / BOLSA COMÚN (Sin Vendedor asignado - 10 prospectos)
            // =========================================================================
            [
                'nombre' => 'María Laura Rojas Suárez',
                'telefono' => '71029384',
                'correo' => 'marialaura.rojas@gmail.com',
                'id_origen' => 1, // Facebook
                'id_etapa' => 1,
                'id_vendedor' => null,
                'id_profesion' => 1, // Sistemas
                'ci' => '8923411 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                    ['tipo' => 'PROGRAMA', 'ver' => 2, 'mod' => null, 'nom' => 'Diplomado en Marketing Digital y Analítica - Versión 1', 'monto' => 1500.00],
                ],
            ],
            [
                'nombre' => 'Roberto Carlos Gómez Saucedo',
                'telefono' => '76543210',
                'correo' => 'roberto.gomez@cotas.com.bo',
                'id_origen' => 2, // WhatsApp
                'id_etapa' => 1,
                'id_vendedor' => null,
                'id_profesion' => 2, // Informática / Redes
                'ci' => '7823901 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Fernanda Aguilera Banegas',
                'telefono' => '78901234',
                'correo' => 'fer.aguilera@outlook.com',
                'id_origen' => 3, // Web
                'id_etapa' => 1,
                'id_vendedor' => null,
                'id_profesion' => 3, // Administración
                'ci' => '9123847 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Jorge Suárez Vaca Díez',
                'telefono' => '70099881',
                'correo' => 'jorge.suarez@gmail.com',
                'id_origen' => 4, // Referido
                'id_etapa' => 1,
                'id_vendedor' => null,
                'id_profesion' => 5, // Comercial
                'ci' => '6712390 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 2, 'mod' => null, 'nom' => 'Diplomado en Marketing Digital y Analítica - Versión 1', 'monto' => 1500.00],
                ],
            ],
            [
                'nombre' => 'Valeria Morales Justiniano',
                'telefono' => '71345678',
                'correo' => 'valeria.morales@entel.bo',
                'id_origen' => 13, // LinkedIn
                'id_etapa' => 1,
                'id_vendedor' => null,
                'id_profesion' => 1, // Sistemas
                'ci' => '8472910 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Sebastián Arteaga Roca',
                'telefono' => '77011223',
                'correo' => 's.arteaga@hotmail.com',
                'id_origen' => 1, // Facebook
                'id_etapa' => 1,
                'id_vendedor' => null,
                'id_profesion' => 4, // Auditoría
                'ci' => '7392811 SC',
                'ciudad' => 'Montero',
                'intereses' => [
                    ['tipo' => 'MODULO', 'ver' => null, 'mod' => 1, 'nom' => 'Fundamentos de Inteligencia Artificial - Módulo 1', 'monto' => 650.00],
                ],
            ],
            [
                'nombre' => 'Gabriela Céspedes Paz',
                'telefono' => '78456123',
                'correo' => 'gaby.cespedes@gmail.com',
                'id_origen' => 2, // WhatsApp
                'id_etapa' => 1,
                'id_vendedor' => null,
                'id_profesion' => 9, // Estudiante
                'ci' => '9823410 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Mauricio Antelo Cuéllar',
                'telefono' => '76098765',
                'correo' => 'mauricio.antelo@yahoo.com',
                'id_origen' => 3, // Web
                'id_etapa' => 1,
                'id_vendedor' => null,
                'id_profesion' => 11, // Emprendedor
                'ci' => '6547890 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 2, 'mod' => null, 'nom' => 'Diplomado en Marketing Digital y Analítica - Versión 1', 'monto' => 1500.00],
                ],
            ],
            [
                'nombre' => 'Carla Patricia Ortiz Melgar',
                'telefono' => '70912345',
                'correo' => 'carla.ortiz@gmail.com',
                'id_origen' => 1, // Facebook
                'id_etapa' => 1,
                'id_vendedor' => null,
                'id_profesion' => 5, // Comercial
                'ci' => '8192837 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Rodrigo Banegas Salvatierra',
                'telefono' => '75389012',
                'correo' => 'rodrigo.banegas@gmail.com',
                'id_origen' => 2, // WhatsApp
                'id_etapa' => 1,
                'id_vendedor' => null,
                'id_profesion' => 1, // Sistemas
                'ci' => '7482910 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'MODULO', 'ver' => null, 'mod' => 2, 'nom' => 'Python para IA - Módulo 2', 'monto' => 700.00],
                ],
            ],

            // =========================================================================
            // ETAPA 2: CONTACTO INICIAL (10 prospectos asignados a Nicol y Carlos)
            // =========================================================================
            [
                'nombre' => 'Camila Andrea Torrico Menacho',
                'telefono' => '77334455',
                'correo' => 'camila.torrico@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 2,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 1,
                'id_descuento' => 1, // Pronto Pago (15%)
                'ci' => '8392019 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1530.00],
                ],
            ],
            [
                'nombre' => 'Alejandro Morales Villarroel',
                'telefono' => '75566778',
                'correo' => 'alejandro.morales@yahoo.es',
                'id_origen' => 2,
                'id_etapa' => 2,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 4,
                'ci' => '7281902 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Nicole Estefany Hurtado Soliz',
                'telefono' => '76655443',
                'correo' => 'nicole.hurtado@hotmail.com',
                'id_origen' => 3,
                'id_etapa' => 2,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 3,
                'ci' => '8920192 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 2, 'mod' => null, 'nom' => 'Diplomado en Marketing Digital y Analítica - Versión 1', 'monto' => 1500.00],
                ],
            ],
            [
                'nombre' => 'Daniel Fernando Pinto Vaca',
                'telefono' => '71122334',
                'correo' => 'daniel.pinto@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 2,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 2,
                'ci' => '7392810 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Natalia Isabel Mercado Justiniano',
                'telefono' => '78899001',
                'correo' => 'natalia.mercado@gmail.com',
                'id_origen' => 4,
                'id_etapa' => 2,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 5,
                'ci' => '8291029 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Luis Fernando Ribera Saucedo',
                'telefono' => '77223344',
                'correo' => 'luis.ribera@uagrm.edu.bo',
                'id_origen' => 2,
                'id_etapa' => 2,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 1,
                'ci' => '6892019 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'MODULO', 'ver' => null, 'mod' => 3, 'nom' => 'Machine Learning - Módulo 3', 'monto' => 850.00],
                ],
            ],
            [
                'nombre' => 'Adriana Paola Montero Paz',
                'telefono' => '75012345',
                'correo' => 'adriana.montero@gmail.com',
                'id_origen' => 13,
                'id_etapa' => 2,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 1,
                'ci' => '9012938 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Gonzalo Javier Chávez Roca',
                'telefono' => '76345678',
                'correo' => 'gonzalo.chavez@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 2,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 11,
                'ci' => '7192830 SC',
                'ciudad' => 'Montero',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 2, 'mod' => null, 'nom' => 'Diplomado en Marketing Digital y Analítica - Versión 1', 'monto' => 1500.00],
                ],
            ],
            [
                'nombre' => 'Mariela Belén Salvatierra Antelo',
                'telefono' => '78123456',
                'correo' => 'mariela.salvatierra@cotas.com.bo',
                'id_origen' => 2,
                'id_etapa' => 2,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 3,
                'ci' => '8492018 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Carlos Andrés Landívar Cuéllar',
                'telefono' => '77445566',
                'correo' => 'carlos.landivar@gmail.com',
                'id_origen' => 3,
                'id_etapa' => 2,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 2,
                'ci' => '6920193 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],

            // =========================================================================
            // ETAPA 3: EN SEGUIMIENTO (11 prospectos en negociación activa)
            // =========================================================================
            [
                'nombre' => 'Luciana Beltrán Méndez',
                'telefono' => '77123456',
                'correo' => 'luciana.beltran@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 3,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 5,
                'id_descuento' => 1,
                'ci' => '8492010 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1530.00],
                ],
            ],
            [
                'nombre' => 'Bruno Alejandro Montero Hurtado',
                'telefono' => '76998877',
                'correo' => 'bruno.montero@gmail.com',
                'id_origen' => 2,
                'id_etapa' => 3,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 1,
                'ci' => '7829103 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Claudia Viviana Paz Banegas',
                'telefono' => '78334422',
                'correo' => 'claudia.paz@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 3,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 4,
                'ci' => '8920194 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 2, 'mod' => null, 'nom' => 'Diplomado en Marketing Digital y Analítica - Versión 1', 'monto' => 1500.00],
                ],
            ],
            [
                'nombre' => 'Juan José Cuéllar Vaca',
                'telefono' => '71998822',
                'correo' => 'jj.cuellar@entel.bo',
                'id_origen' => 4,
                'id_etapa' => 3,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 2,
                'ci' => '7192039 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Sofía Gabriela Mercado Justiniano',
                'telefono' => '77665511',
                'correo' => 'sofia.mercado@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 3,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 1,
                'ci' => '9102934 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Mario Alberto Dorado Saucedo',
                'telefono' => '75223311',
                'correo' => 'mario.dorado@gmail.com',
                'id_origen' => 2,
                'id_etapa' => 3,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 5,
                'ci' => '6829104 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 2, 'mod' => null, 'nom' => 'Diplomado en Marketing Digital y Analítica - Versión 1', 'monto' => 1500.00],
                ],
            ],
            [
                'nombre' => 'Paola Andrea Soliz Melgar',
                'telefono' => '76112233',
                'correo' => 'paola.soliz@hotmail.com',
                'id_origen' => 3,
                'id_etapa' => 3,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 3,
                'ci' => '8392011 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Ricardo Andrés Vaca Pereira',
                'telefono' => '70889900',
                'correo' => 'ricardo.vaca@gmail.com',
                'id_origen' => 13,
                'id_etapa' => 3,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 1,
                'ci' => '7291028 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Giselle Marcela Roca Aguilera',
                'telefono' => '78445566',
                'correo' => 'giselle.roca@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 3,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 8, // Educación
                'ci' => '8729103 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'MODULO', 'ver' => null, 'mod' => 1, 'nom' => 'Fundamentos de Inteligencia Artificial - Módulo 1', 'monto' => 650.00],
                ],
            ],
            [
                'nombre' => 'Álvaro Mauricio Céspedes Banegas',
                'telefono' => '75998811',
                'correo' => 'alvaro.cespedes@gmail.com',
                'id_origen' => 2,
                'id_etapa' => 3,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 2,
                'ci' => '7192038 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Tania Lorena Justiniano Antelo',
                'telefono' => '77881122',
                'correo' => 'tania.justiniano@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 3,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 1,
                'ci' => '8920195 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],

            // =========================================================================
            // ETAPA 4: PROMESA DE PAGO (8 prospectos listos para matricularse)
            // =========================================================================
            [
                'nombre' => 'Marcelo Banegas Justiniano',
                'telefono' => '76882233',
                'correo' => 'marcelo.banegas@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 4,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 1,
                'id_descuento' => 1, // Pronto Pago
                'ci' => '7829104 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1530.00],
                ],
            ],
            [
                'nombre' => 'Jéssica Paola Morales Vaca',
                'telefono' => '75001122',
                'correo' => 'jessica.morales@yahoo.es',
                'id_origen' => 2,
                'id_etapa' => 4,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 5,
                'id_descuento' => 2, // Convenio Institucional (20%)
                'ci' => '8920196 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 2, 'mod' => null, 'nom' => 'Diplomado en Marketing Digital y Analítica - Versión 1', 'monto' => 1200.00],
                ],
            ],
            [
                'nombre' => 'Fabricio Andrés Salvatierra Banegas',
                'telefono' => '71223344',
                'correo' => 'fabricio.salvatierra@gmail.com',
                'id_origen' => 3,
                'id_etapa' => 4,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 2,
                'id_descuento' => 1,
                'ci' => '7291030 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1530.00],
                ],
            ],
            [
                'nombre' => 'Karen Daniela Roca Menacho',
                'telefono' => '78990011',
                'correo' => 'karen.roca@hotmail.com',
                'id_origen' => 1,
                'id_etapa' => 4,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 3,
                'ci' => '8192039 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Ernesto Javier Soliz Antelo',
                'telefono' => '76113355',
                'correo' => 'ernesto.soliz@gmail.com',
                'id_origen' => 4,
                'id_etapa' => 4,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 1,
                'ci' => '7392019 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Romina Alejandra Paz Justiniano',
                'telefono' => '77559911',
                'correo' => 'romina.paz@gmail.com',
                'id_origen' => 2,
                'id_etapa' => 4,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 4,
                'ci' => '8729104 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'MODULO', 'ver' => null, 'mod' => 2, 'nom' => 'Python para IA - Módulo 2', 'monto' => 700.00],
                ],
            ],
            [
                'nombre' => 'Gustavo Adolfo Cuéllar Hurtado',
                'telefono' => '70445566',
                'correo' => 'gustavo.cuellar@cotas.com.bo',
                'id_origen' => 1,
                'id_etapa' => 4,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 1,
                'ci' => '6920195 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Carla Mariana Dorado Banegas',
                'telefono' => '78224466',
                'correo' => 'carla.dorado@gmail.com',
                'id_origen' => 13,
                'id_etapa' => 4,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 5,
                'id_descuento' => 1,
                'ci' => '8492012 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1530.00],
                ],
            ],

            // =========================================================================
            // ETAPA 5: MATRICULADO / CONVERTIDO (8 alumnos formales con comprobante)
            // =========================================================================
            [
                'nombre' => 'Mateo Benítez Vargas',
                'telefono' => '78234567',
                'correo' => 'mateo.benitez@gmail.com',
                'id_origen' => 2,
                'id_etapa' => 5,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 1,
                'id_descuento' => 2, // Convenio (20%)
                'ci' => '6987412 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'fecha_nacimiento' => '1997-08-20',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1440.00, 'estado' => 'MATRICULADO'],
                ],
                'comprobante' => [
                    'monto' => 1440.00,
                    'ref' => 'BNB-TR-889922',
                    'metodo' => 'TRANSFERENCIA',
                ],
            ],
            [
                'nombre' => 'Andrea Belén Salvatierra Roca',
                'telefono' => '77889900',
                'correo' => 'andrea.salvatierra@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 5,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 1,
                'id_descuento' => 1, // Pronto Pago (15%)
                'ci' => '8392012 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'fecha_nacimiento' => '1996-03-14',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1530.00, 'estado' => 'MATRICULADO'],
                ],
                'comprobante' => [
                    'monto' => 1530.00,
                    'ref' => 'MSC-TR-102934',
                    'metodo' => 'TRANSFERENCIA',
                ],
            ],
            [
                'nombre' => 'Juan Pablo Antelo Cuéllar',
                'telefono' => '76123456',
                'correo' => 'jp.antelo@entel.bo',
                'id_origen' => 2,
                'id_etapa' => 5,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 2,
                'id_descuento' => 4, // Exalumno (10%)
                'ci' => '7192030 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'fecha_nacimiento' => '1995-11-28',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1620.00, 'estado' => 'MATRICULADO'],
                ],
                'comprobante' => [
                    'monto' => 1620.00,
                    'ref' => 'BUN-TR-554433',
                    'metodo' => 'TRANSFERENCIA',
                ],
            ],
            [
                'nombre' => 'María René Pinto Saavedra',
                'telefono' => '71887766',
                'correo' => 'mariarene.pinto@gmail.com',
                'id_origen' => 3,
                'id_etapa' => 5,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 5,
                'id_descuento' => 1,
                'ci' => '8920197 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'fecha_nacimiento' => '1998-05-19',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 2, 'mod' => null, 'nom' => 'Diplomado en Marketing Digital y Analítica - Versión 1', 'monto' => 1275.00, 'estado' => 'MATRICULADO'],
                ],
                'comprobante' => [
                    'monto' => 1275.00,
                    'ref' => 'BISA-TR-901823',
                    'metodo' => 'TRANSFERENCIA',
                ],
            ],
            [
                'nombre' => 'Diego Fernando Banegas Melgar',
                'telefono' => '78443322',
                'correo' => 'diego.banegas@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 5,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 1,
                'id_descuento' => 3, // Excelencia (25%)
                'ci' => '7482911 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'fecha_nacimiento' => '1999-09-03',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1350.00, 'estado' => 'MATRICULADO'],
                ],
                'comprobante' => [
                    'monto' => 1350.00,
                    'ref' => 'BNB-TR-332211',
                    'metodo' => 'TRANSFERENCIA',
                ],
            ],
            [
                'nombre' => 'Valeria Sofía Hurtado Banegas',
                'telefono' => '75332211',
                'correo' => 'valeria.hurtado@cotas.com.bo',
                'id_origen' => 4,
                'id_etapa' => 5,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 3,
                'id_descuento' => 1,
                'ci' => '8291030 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'fecha_nacimiento' => '1994-12-10',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1530.00, 'estado' => 'MATRICULADO'],
                ],
                'comprobante' => [
                    'monto' => 1530.00,
                    'ref' => 'BUN-TR-778899',
                    'metodo' => 'TRANSFERENCIA',
                ],
            ],
            [
                'nombre' => 'Gabriel Antonio Ribera Melgar',
                'telefono' => '76991133',
                'correo' => 'gabriel.ribera@gmail.com',
                'id_origen' => 2,
                'id_etapa' => 5,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 1,
                'ci' => '7192031 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'fecha_nacimiento' => '1996-07-25',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00, 'estado' => 'MATRICULADO'],
                ],
                'comprobante' => [
                    'monto' => 1800.00,
                    'ref' => 'MSC-TR-445566',
                    'metodo' => 'TRANSFERENCIA',
                ],
            ],
            [
                'nombre' => 'Luciana Marcela Vaca Díez Saucedo',
                'telefono' => '77002244',
                'correo' => 'luciana.vaca@gmail.com',
                'id_origen' => 13,
                'id_etapa' => 5,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 5,
                'id_descuento' => 1,
                'ci' => '8729105 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'fecha_nacimiento' => '1997-04-01',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 2, 'mod' => null, 'nom' => 'Diplomado en Marketing Digital y Analítica - Versión 1', 'monto' => 1275.00, 'estado' => 'MATRICULADO'],
                ],
                'comprobante' => [
                    'monto' => 1275.00,
                    'ref' => 'BNB-TR-990011',
                    'metodo' => 'TRANSFERENCIA',
                ],
            ],

            // =========================================================================
            // ETAPA 6: DESCARTADO / PERDIDO (7 prospectos con motivos reales y claros)
            // =========================================================================
            [
                'nombre' => 'Daniela Castro Soliz',
                'telefono' => '70345678',
                'correo' => 'daniela.castro@gmail.com',
                'id_origen' => 3,
                'id_etapa' => 6,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 3,
                'id_motivo_perdida' => 1, // Factor económico
                'comentario_perdida' => 'El postulante indicó que no cuenta con el presupuesto requerido este semestre; solicitó contacto en julio.',
                'ci' => '7392020 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Rodrigo Sebastián Saucedo Paz',
                'telefono' => '76445588',
                'correo' => 'rodrigo.saucedo@hotmail.com',
                'id_origen' => 1,
                'id_etapa' => 6,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 1,
                'id_motivo_perdida' => 2, // Horario no disponible
                'comentario_perdida' => 'Los horarios presenciales cruzan con su jornada laboral en turno noche; requiere clases los fines de semana.',
                'ci' => '8291031 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Carla Tatiana Banegas Roca',
                'telefono' => '78119933',
                'correo' => 'carla.banegas@gmail.com',
                'id_origen' => 2,
                'id_etapa' => 6,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 4,
                'id_motivo_perdida' => 1, // Factor económico
                'comentario_perdida' => 'Solicitó beca del 50% que no está disponible institucionalmente; no continuó el trámite.',
                'ci' => '7192032 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Mauricio Fernando Ortiz Vaca',
                'telefono' => '75667799',
                'correo' => 'mauricio.ortiz@cotas.com.bo',
                'id_origen' => 4,
                'id_etapa' => 6,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 2,
                'id_motivo_perdida' => 3, // Ya no interesado
                'comentario_perdida' => 'Decidió postularse a una maestría en el exterior y pospuso la realización de diplomados cortos.',
                'ci' => '8920198 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Patricia Jimena Justiniano Dorado',
                'telefono' => '77330022',
                'correo' => 'patricia.justiniano@gmail.com',
                'id_origen' => 1,
                'id_etapa' => 6,
                'id_vendedor' => 3, // Nicol
                'id_profesion' => 5,
                'id_motivo_perdida' => 4, // Sin respuesta
                'comentario_perdida' => 'Se realizaron tres llamadas y se enviaron cuatro mensajes de seguimiento por WhatsApp sin respuesta.',
                'ci' => '7482912 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 2, 'mod' => null, 'nom' => 'Diplomado en Marketing Digital y Analítica - Versión 1', 'monto' => 1500.00],
                ],
            ],
            [
                'nombre' => 'Jorge Eduardo Antelo Menacho',
                'telefono' => '71009944',
                'correo' => 'jorge.antelo@gmail.com',
                'id_origen' => 2,
                'id_etapa' => 6,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 1,
                'id_motivo_perdida' => 2, // Horario no disponible
                'comentario_perdida' => 'Viaja constantemente al interior por proyectos mineros y no puede garantizar asistencia regular.',
                'ci' => '6920196 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
            [
                'nombre' => 'Silvia Marcela Céspedes Roca',
                'telefono' => '76880011',
                'correo' => 'silvia.cespedes@yahoo.es',
                'id_origen' => 1,
                'id_etapa' => 6,
                'id_vendedor' => 4, // Carlos
                'id_profesion' => 3,
                'id_motivo_perdida' => 1, // Factor económico
                'comentario_perdida' => 'Manifestó dificultades para cubrir la cuota inicial este mes.',
                'ci' => '8729106 SC',
                'ciudad' => 'Santa Cruz de la Sierra',
                'intereses' => [
                    ['tipo' => 'PROGRAMA', 'ver' => 1, 'mod' => null, 'nom' => 'Diplomado en Inteligencia Artificial Aplicada - Versión 1', 'monto' => 1800.00],
                ],
            ],
        ];

        // 3. Inserción controlada de leads, intereses, asignaciones y comprobantes
        foreach ($prospectos as $data) {
            $lead = Lead::create([
                'nombre' => $data['nombre'],
                'telefono' => $data['telefono'],
                'correo' => $data['correo'],
                'id_origen' => $data['id_origen'],
                'id_etapa' => $data['id_etapa'],
                'id_vendedor' => $data['id_vendedor'],
                'id_profesion' => $data['id_profesion'],
                'id_descuento' => $data['id_descuento'] ?? null,
                'ci' => $data['ci'] ?? null,
                'nombre_completo' => $data['nombre'],
                'fecha_nacimiento' => $data['fecha_nacimiento'] ?? '1995-05-15',
                'ciudad' => $data['ciudad'] ?? 'Santa Cruz de la Sierra',
                'id_motivo_perdida' => $data['id_motivo_perdida'] ?? null,
                'comentario_perdida' => $data['comentario_perdida'] ?? null,
                'fecha_asignacion' => $data['id_vendedor'] ? now()->subDays(rand(2, 8)) : null,
                'created_by' => 1, // Admin Nataly Valenzuela
                'created_at' => now()->subDays(rand(4, 15))->subHours(rand(1, 10)),
                'updated_at' => now()->subHours(rand(1, 12)),
            ]);

            // Asignación histórica si tiene vendedor
            if ($data['id_vendedor']) {
                AsignacionLead::create([
                    'id_lead' => $lead->id_lead,
                    'id_vendedor_anterior' => null,
                    'id_vendedor_nuevo' => $data['id_vendedor'],
                    'asignado_por' => 1,
                    'tipo' => 'MANUAL',
                    'motivo' => 'Asignación comercial para seguimiento institucional',
                    'created_at' => $lead->created_at,
                ]);
            }

            // Intereses académicos
            $primerInteres = null;
            foreach ($data['intereses'] as $it) {
                $estadoInteres = $it['estado'] ?? ($data['id_etapa'] === 5 ? 'MATRICULADO' : ($data['id_etapa'] === 4 ? 'EN_PAGO' : 'EN_SEGUIMIENTO'));
                $interes = LeadInteres::create([
                    'id_lead' => $lead->id_lead,
                    'tipo' => $it['tipo'],
                    'id_version_externo' => $it['ver'],
                    'id_modulo_externo' => $it['mod'],
                    'nombre_snapshot' => $it['nom'],
                    'estado' => $estadoInteres,
                    'monto_pactado' => $it['monto'],
                ]);

                if (!$primerInteres) {
                    $primerInteres = $interes;
                }
            }

            // Comprobante y matrícula para convertidos (Etapa 5)
            if (isset($data['comprobante']) && $primerInteres) {
                $comprobante = ComprobantePago::create([
                    'id_lead' => $lead->id_lead,
                    'id_interes' => $primerInteres->id_interes,
                    'subido_por' => $data['id_vendedor'] ?? 1,
                    'revisado_por' => 1,
                    'archivo_url' => '/storage/comprobantes/demo_voucher_' . $lead->id_lead . '.png',
                    'tipo_archivo' => 'imagen',
                    'monto' => $data['comprobante']['monto'],
                    'metodo_pago' => $data['comprobante']['metodo'],
                    'referencia_transaccion' => $data['comprobante']['ref'],
                    'estado' => 'APROBADO',
                    'fecha_revision' => now()->subHours(rand(2, 6)),
                    'created_at' => now()->subHours(rand(4, 12)),
                    'updated_at' => now()->subHours(rand(1, 3)),
                ]);

                $docClean = preg_replace('/[^0-9]/', '', $lead->ci) ?: (string)rand(1000000, 9999999);
                EnvioMatricula::create([
                    'id_lead' => $lead->id_lead,
                    'id_interes' => $primerInteres->id_interes,
                    'id_comprobante' => $comprobante->id_comprobante,
                    'payload' => [
                        'crm_lead_id' => 'LEAD-' . $lead->id_lead,
                        'documento' => $docClean,
                        'name' => explode(' ', $lead->nombre)[0],
                        'apellidos' => explode(' ', $lead->nombre)[1] ?? '',
                        'tipo' => 'cohorte',
                        'cohorte_id' => $primerInteres->id_version_externo ?? 1,
                    ],
                    'estado' => 'ENVIADO',
                    'respuesta_api' => json_encode([
                        'usuario' => ['id' => rand(50, 200), 'documento' => $docClean, 'nombre' => $lead->nombre],
                        'matriculas' => [['id' => rand(100, 500), 'estado' => 'activa']],
                    ]),
                    'intentos' => 1,
                    'fecha_envio' => now()->subHours(rand(1, 4)),
                ]);
            }
        }

        // 4. Recordatorios activos para los vendedores (Tareas de seguimiento en vivo)
        $leadsNicol = Lead::where('id_vendedor', 3)->whereIn('id_etapa', [2, 3])->take(3)->get();
        foreach ($leadsNicol as $idx => $l) {
            Recordatorio::create([
                'id_lead' => $l->id_lead,
                'id_usuario' => 3, // Nicol Flores
                'descripcion' => 'Llamada de seguimiento para coordinar plan de pagos y beca pronto pago.',
                'fecha_hora' => now()->addHours(($idx + 1) * 3),
                'estado' => 'PENDIENTE',
            ]);
        }

        $leadsCarlos = Lead::where('id_vendedor', 4)->whereIn('id_etapa', [2, 3])->take(3)->get();
        foreach ($leadsCarlos as $idx => $l) {
            Recordatorio::create([
                'id_lead' => $l->id_lead,
                'id_usuario' => 4, // Carlos Mendoza
                'descripcion' => 'Enviar temario detallado y requisitos de titulación por WhatsApp.',
                'fecha_hora' => now()->addHours(($idx + 1) * 4),
                'estado' => 'PENDIENTE',
            ]);
        }

        // 5. Asignación de versión 1 (IAA) a la Coordinadora Jael (id_usuario = 2)
        \App\Models\CoordinadorVersion::firstOrCreate([
            'id_usuario' => 2,
            'id_version_externo' => 1,
        ]);

        // 6. Ajustar secuencias en PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('leads', 'id_lead'), coalesce(max(id_lead), 1)) FROM leads;");
            DB::statement("SELECT setval(pg_get_serial_sequence('lead_interes', 'id_interes'), coalesce(max(id_interes), 1)) FROM lead_interes;");
            DB::statement("SELECT setval(pg_get_serial_sequence('comprobantes_pago', 'id_comprobante'), coalesce(max(id_comprobante), 1)) FROM comprobantes_pago;");
            DB::statement("SELECT setval(pg_get_serial_sequence('envios_matricula', 'id_envio'), coalesce(max(id_envio), 1)) FROM envios_matricula;");
            DB::statement("SELECT setval(pg_get_serial_sequence('asignaciones_lead', 'id_asignacion'), coalesce(max(id_asignacion), 1)) FROM asignaciones_lead;");
            DB::statement("SELECT setval(pg_get_serial_sequence('recordatorios', 'id_recordatorio'), coalesce(max(id_recordatorio), 1)) FROM recordatorios;");
        }
    }
}
