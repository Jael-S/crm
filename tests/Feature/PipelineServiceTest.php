<?php

namespace Tests\Feature;

use App\Models\EtapaPipeline;
use App\Models\Lead;
use App\Models\MotivoPerdida;
use App\Models\Usuario;
use App\Services\PipelineService;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PipelineServiceTest extends TestCase
{
    protected PipelineService $pipelineService;
    protected Usuario $admin;
    protected Lead $lead;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pipelineService = app(PipelineService::class);
        $this->admin = Usuario::where('correo', 'admin@crm.bo')->first();
        $this->lead = Lead::first();
    }

    public function test_obtener_tablero_retorna_6_columnas(): void
    {
        $tablero = $this->pipelineService->obtenerTablero($this->admin);

        $this->assertArrayHasKey('columnas', $tablero);
        $this->assertArrayHasKey('total_leads', $tablero);
        $this->assertCount(6, $tablero['columnas']);
        $this->assertEquals(Lead::count(), $tablero['total_leads']);
    }

    public function test_cambio_etapa_ordinario_exitoso(): void
    {
        $leadActualizado = $this->pipelineService->cambiarEtapa(
            $this->lead,
            2, // En Contacto
            [],
            $this->admin
        );

        $this->assertEquals(2, $leadActualizado->id_etapa);
    }

    public function test_marcar_perdido_sin_motivo_lanza_excepcion(): void
    {
        $this->expectException(ValidationException::class);

        $this->pipelineService->cambiarEtapa(
            $this->lead,
            6, // Perdido
            [], // Sin id_motivo_perdida
            $this->admin
        );
    }

    public function test_marcar_perdido_con_motivo_exitoso(): void
    {
        $motivo = MotivoPerdida::first();

        $leadPerdido = $this->pipelineService->cambiarEtapa(
            $this->lead,
            6,
            [
                'id_motivo_perdida' => $motivo->id_motivo,
                'comentario_perdida' => 'No tiene presupuesto este semestre',
            ],
            $this->admin
        );

        $this->assertEquals(6, $leadPerdido->id_etapa);
        $this->assertEquals($motivo->id_motivo, $leadPerdido->id_motivo_perdida);
        $this->assertEquals('No tiene presupuesto este semestre', $leadPerdido->comentario_perdida);
    }

    public function test_marcar_convertido_sin_datos_alumno_lanza_excepcion(): void
    {
        // Limpiamos los datos de conversión del lead si existieran
        $this->lead->update([
            'ci' => null,
            'fecha_nacimiento' => null,
            'ciudad' => null,
        ]);

        $this->expectException(ValidationException::class);

        $this->pipelineService->cambiarEtapa(
            $this->lead,
            5, // Convertido
            [],
            $this->admin
        );
    }

    public function test_marcar_convertido_con_datos_completos_exitoso(): void
    {
        $leadConvertido = $this->pipelineService->cambiarEtapa(
            $this->lead,
            5, // Convertido
            [
                'ci' => '1234567 SC',
                'nombre_completo' => 'María Laura Rojas Suárez',
                'fecha_nacimiento' => '1998-05-15',
                'ciudad' => 'Santa Cruz de la Sierra',
            ],
            $this->admin
        );

        $this->assertEquals(5, $leadConvertido->id_etapa);
        $this->assertEquals('1234567 SC', $leadConvertido->ci);
        $this->assertEquals('Santa Cruz de la Sierra', $leadConvertido->ciudad);
    }
}
