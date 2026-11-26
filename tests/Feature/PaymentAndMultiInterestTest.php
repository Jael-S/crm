<?php

namespace Tests\Feature;

use App\Models\ComprobantePago;
use App\Models\EnvioMatricula;
use App\Models\EtapaPipeline;
use App\Models\Lead;
use App\Models\LeadInteres;
use App\Models\Usuario;
use App\Services\EnrollmentService;
use App\Services\PaymentService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PaymentAndMultiInterestTest extends TestCase
{
    protected PaymentService $paymentService;
    protected Usuario $admin;
    protected Lead $lead;

    protected function setUp(): void
    {
        parent::setUp();
        $this->paymentService = app(PaymentService::class);
        $this->admin = Usuario::where('correo', 'admin@crm.bo')->first();
        $this->lead = Lead::create([
            'nombre' => 'Test Lead Multicurso',
            'correo' => 'multicurso_' . uniqid() . '@test.com',
            'telefono' => '77112233',
            'ci' => '1234567',
            'fecha_nacimiento' => '1995-04-12',
            'id_etapa' => 4,
            'id_origen' => 1,
            'id_vendedor' => $this->admin->id_usuario,
            'created_by' => $this->admin->id_usuario,
        ]);
    }

    public function test_subir_comprobante_para_interes_especifico_cambia_estado_a_en_pago(): void
    {
        Storage::fake('public');

        $interes = LeadInteres::create([
            'id_lead' => $this->lead->id_lead,
            'tipo' => 'PROGRAMA',
            'id_version_externo' => 1,
            'nombre_snapshot' => 'Diplomado en Inteligencia Artificial',
            'monto_pactado' => 1400.00,
            'estado' => 'EN_SEGUIMIENTO',
        ]);

        $file = UploadedFile::fake()->create('comprobante_qr.png', 100, 'image/png');

        $comprobante = $this->paymentService->subirComprobante(
            lead: $this->lead,
            archivo: $file,
            monto: 1400.00,
            idUsuario: $this->admin->id_usuario,
            idInteres: $interes->id_interes,
            metodoPago: 'QR',
            referencia: 'QR-TEST-778899'
        );

        $this->assertInstanceOf(ComprobantePago::class, $comprobante);
        $this->assertEquals('PENDIENTE', $comprobante->estado);
        $this->assertEquals($interes->id_interes, $comprobante->id_interes);
        $this->assertEquals('QR', $comprobante->metodo_pago);
        $this->assertEquals('QR-TEST-778899', $comprobante->referencia_transaccion);

        $interes->refresh();
        $this->assertEquals('EN_PAGO', $interes->estado);
    }

    public function test_aprobar_pago_matricula_interes_y_controla_etapa_del_lead(): void
    {
        Storage::fake('public');

        // Lead con dos intereses
        $interes1 = LeadInteres::create([
            'id_lead' => $this->lead->id_lead,
            'tipo' => 'PROGRAMA',
            'id_version_externo' => 1,
            'nombre_snapshot' => 'Programa 1',
            'monto_pactado' => 1500.00,
            'estado' => 'EN_SEGUIMIENTO',
        ]);

        $interes2 = LeadInteres::create([
            'id_lead' => $this->lead->id_lead,
            'tipo' => 'MODULO',
            'id_modulo_externo' => 2,
            'nombre_snapshot' => 'Módulo 2 Independiente',
            'monto_pactado' => 450.00,
            'estado' => 'EN_SEGUIMIENTO',
        ]);

        $file = UploadedFile::fake()->create('recibo.png', 100, 'image/png');
        $comprobante = $this->paymentService->subirComprobante(
            $this->lead,
            $file,
            1500.00,
            $this->admin->id_usuario,
            $interes1->id_interes,
            'TRANSFERENCIA',
            'TR-123456'
        );

        // Simulamos respuesta exitosa del microservicio de matrícula Proyecto 2
        Http::fake([
            '*/matriculas*' => Http::response([
                'status' => 'success',
                'matriculas' => [['id' => 999, 'estado' => 'activa']],
                'usuario' => ['id' => 888, 'documento' => $this->lead->ci],
            ], 200),
            '*' => Http::response([], 200),
        ]);

        // Aseguramos que el lead esté en etapa 4 (Promesa de pago)
        $this->lead->update(['id_etapa' => 4]);

        $resultado = $this->paymentService->aprobar($comprobante, $this->admin->id_usuario);

        $this->assertInstanceOf(EnvioMatricula::class, $resultado);
        $this->assertEquals('ENVIADO', $resultado->estado);
        $comprobante->refresh();
        $this->assertEquals('APROBADO', $comprobante->estado);

        $interes1->refresh();
        $this->assertEquals('MATRICULADO', $interes1->estado);

        // Como el interes2 sigue pendiente, el lead no se pasa ciegamente a Convertido (se queda activo en seguimiento)
        $this->lead->refresh();
        $this->assertNotEquals(5, $this->lead->id_etapa);

        // Ahora matriculamos el interes2
        $file2 = UploadedFile::fake()->create('recibo2.png', 100, 'image/png');
        $comprobante2 = $this->paymentService->subirComprobante(
            $this->lead,
            $file2,
            450.00,
            $this->admin->id_usuario,
            $interes2->id_interes,
            'TARJETA',
            'STRIPE-CH-999'
        );

        $this->lead->update(['id_etapa' => 4]);
        $resultado2 = $this->paymentService->aprobar($comprobante2, $this->admin->id_usuario);

        $this->assertInstanceOf(EnvioMatricula::class, $resultado2);
        $this->assertEquals('ENVIADO', $resultado2->estado);
        $interes2->refresh();
        $this->assertEquals('MATRICULADO', $interes2->estado);

        // Ahora que no quedan intereses pendientes, el lead se convierte exitosamente
        $this->lead->refresh();
        $this->assertEquals(5, $this->lead->id_etapa); // 5 = Convertido
    }

    public function test_deteccion_automatica_de_ex_alumno_por_ci_y_beneficio_fidelidad(): void
    {
        $ciAlumno = '99887766';
        $emailAlumno = 'alumno.historico@test.com';

        // 1. Lead previo histórico ya convertido con matrícula completada
        $leadHistorico = Lead::create([
            'nombre' => 'Alumno Histórico Graduado',
            'correo' => $emailAlumno,
            'telefono' => '70011223',
            'ci' => $ciAlumno,
            'fecha_nacimiento' => '1992-08-15',
            'id_etapa' => 5, // Convertido
            'id_origen' => 1,
            'id_vendedor' => $this->admin->id_usuario,
            'created_by' => $this->admin->id_usuario,
        ]);

        $interesHistorico = LeadInteres::create([
            'id_lead' => $leadHistorico->id_lead,
            'tipo' => 'PROGRAMA',
            'id_version_externo' => 1,
            'nombre_snapshot' => 'Diplomado en Data Science',
            'estado' => 'MATRICULADO',
        ]);

        $comprobanteHistorico = ComprobantePago::create([
            'id_lead' => $leadHistorico->id_lead,
            'id_interes' => $interesHistorico->id_interes,
            'subido_por' => $this->admin->id_usuario,
            'archivo_url' => '/storage/comprobantes/test.png',
            'tipo_archivo' => 'imagen',
            'monto' => 1500.00,
            'estado' => 'APROBADO',
        ]);

        EnvioMatricula::create([
            'id_comprobante' => $comprobanteHistorico->id_comprobante,
            'id_lead' => $leadHistorico->id_lead,
            'id_interes' => $interesHistorico->id_interes,
            'payload_enviado' => ['name' => $leadHistorico->nombre],
            'respuesta_api' => json_encode(['status' => 'success']),
            'estado' => 'ENVIADO',
            'intentos' => 1,
            'fecha_envio' => now(),
        ]);

        // 2. Nuevo lead que consulta por otro curso con el mismo CI
        $nuevoLead = Lead::create([
            'nombre' => 'Alumno Histórico Consultando Nuevo Curso',
            'correo' => 'nuevo.contacto@empresa.com',
            'telefono' => '70011223',
            'ci' => $ciAlumno, // Mismo CI
            'id_etapa' => 1,
            'id_origen' => 2,
            'created_by' => $this->admin->id_usuario,
        ]);

        $controller = app(\App\Http\Controllers\LeadController::class);
        $infoExAlumno = $controller->obtenerInfoExAlumno($nuevoLead);

        $this->assertTrue($infoExAlumno['es_ex_alumno']);
        $this->assertGreaterThanOrEqual(1, $infoExAlumno['total_cursos_concluidos']);
        $this->assertNotEmpty($infoExAlumno['cursos_previos']);
        $this->assertEquals('Diplomado en Data Science', $infoExAlumno['cursos_previos'][0]['curso']);
    }
}
