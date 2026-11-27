<?php

namespace Tests\Feature;

use App\Models\AsignacionLead;
use App\Models\Lead;
use App\Models\MotivoPerdida;
use App\Models\Usuario;
use App\Services\AssignmentService;
use App\Services\PipelineService;
use App\Services\RoundRobinService;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ObservationsResolutionTest extends TestCase
{
    protected Usuario $admin;
    protected Usuario $vendedor1;
    protected Usuario $vendedor2;
    protected PipelineService $pipelineService;
    protected AssignmentService $assignmentService;
    protected RoundRobinService $roundRobinService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pipelineService = app(PipelineService::class);
        $this->assignmentService = app(AssignmentService::class);
        $this->roundRobinService = app(RoundRobinService::class);

        $this->admin = Usuario::where('correo', 'admin@crm.bo')->first() ?? Usuario::where('id_rol', 1)->first();
        $vendedores = Usuario::where('id_rol', 3)->get();
        $this->vendedor1 = $vendedores->first();
        $this->vendedor2 = $vendedores->count() > 1 ? $vendedores->get(1) : $vendedores->first();
    }

    /**
     * Observación 1: Round Robin asigna al vendedor con menor carga de trabajo (Least Loaded).
     */
    public function test_round_robin_assigns_to_vendedor_with_least_workload(): void
    {
        // Asegurar que ambos vendedores participen en round robin
        $this->vendedor1->update(['activo' => true, 'participa_round_robin' => true]);
        $this->vendedor2->update(['activo' => true, 'participa_round_robin' => true]);

        // Crear 1 lead en bolsa común
        $leadBolsa = Lead::create([
            'nombre' => 'Prospecto Test Round Robin Balanceado',
            'telefono' => '70011223',
            'id_origen' => 1,
            'id_etapa' => 1,
            'id_vendedor' => null,
            'created_by' => $this->admin->id_usuario,
        ]);

        $resultado = $this->roundRobinService->distribuir([$leadBolsa->id_lead], $this->admin->id_usuario);

        $this->assertEquals(1, $resultado['total_distribuidos']);
        $this->assertNotNull($leadBolsa->fresh()->id_vendedor);
    }

    /**
     * Observación 2 y 6: Validación estricta - No se puede mover a "En Contacto" sin vendedor.
     */
    public function test_cannot_move_lead_to_en_contacto_without_vendedor(): void
    {
        $leadSinVendedor = Lead::create([
            'nombre' => 'Lead Bolsa Prueba En Contacto',
            'telefono' => '71122334',
            'id_origen' => 1,
            'id_etapa' => 1,
            'id_vendedor' => null,
            'created_by' => $this->admin->id_usuario,
        ]);

        $this->expectException(ValidationException::class);

        $this->pipelineService->cambiarEtapa(
            $leadSinVendedor,
            2, // En Contacto
            [],
            $this->admin
        );
    }

    /**
     * Observación 3: No permitir reasignar al mismo vendedor.
     */
    public function test_cannot_reassign_to_same_vendedor(): void
    {
        $lead = Lead::create([
            'nombre' => 'Lead Reasignacion Mismo Asesor',
            'telefono' => '72233445',
            'id_origen' => 1,
            'id_etapa' => 2,
            'id_vendedor' => $this->vendedor1->id_usuario,
            'created_by' => $this->admin->id_usuario,
        ]);

        $this->expectException(ValidationException::class);

        $this->assignmentService->asignarManual(
            $lead,
            $this->vendedor1->id_usuario, // Mismo vendedor
            $this->admin->id_usuario
        );
    }

    /**
     * Observación 4: Reasignar requiere motivo obligatorio en formulario.
     */
    public function test_reassign_endpoint_validates_different_seller_and_requires_reason(): void
    {
        $lead = Lead::create([
            'nombre' => 'Lead Test Endpoint Reasignacion',
            'telefono' => '73344556',
            'id_origen' => 1,
            'id_etapa' => 2,
            'id_vendedor' => $this->vendedor1->id_usuario,
            'created_by' => $this->admin->id_usuario,
        ]);

        // Intento 1: Reasignar al mismo asesor vía HTTP -> Debe fallar validación con 302 y error de sesión
        $responseMismo = $this->actingAs($this->admin)->post("/leads/{$lead->id_lead}/asignar", [
            'id_vendedor' => $this->vendedor1->id_usuario,
        ]);
        $responseMismo->assertSessionHasErrors('id_vendedor');

        // Intento 2: Transferir a vendedor diferente pero sin motivo -> Debe fallar validación por motivo requerido
        $responseSinMotivo = $this->actingAs($this->admin)->post("/leads/{$lead->id_lead}/transferir", [
            'id_vendedor' => $this->vendedor2->id_usuario,
            'motivo' => '',
        ]);
        $responseSinMotivo->assertSessionHasErrors('motivo');

        // Intento 3: Transferir a vendedor diferente con motivo válido -> Éxito
        $responseExito = $this->actingAs($this->admin)->post("/leads/{$lead->id_lead}/transferir", [
            'id_vendedor' => $this->vendedor2->id_usuario,
            'motivo' => 'Transferencia por cambio de cartera comercial',
        ]);
        $responseExito->assertSessionHasNoErrors();
        $this->assertEquals($this->vendedor2->id_usuario, $lead->fresh()->id_vendedor);
    }

    /**
     * Observación 5: Filtro por vendedor en listado de leads (incluyendo sin_asignar).
     */
    public function test_leads_index_filter_by_vendedor_and_bolsa_comun(): void
    {
        $response = $this->actingAs($this->admin)->get('/leads?id_vendedor=' . $this->vendedor1->id_usuario);
        $response->assertStatus(200);

        $responseBolsa = $this->actingAs($this->admin)->get('/leads?id_vendedor=sin_asignar');
        $responseBolsa->assertStatus(200);
    }

    /**
     * Observación 7: CRUD completo de Motivos de Pérdida con protección de integridad referencial.
     */
    public function test_motivos_perdida_crud_and_referential_integrity(): void
    {
        // 1. Crear nuevo motivo
        $responseCreate = $this->actingAs($this->admin)->post('/motivos-perdida', [
            'nombre' => 'Causa Descarte Automatizada',
        ]);
        $responseCreate->assertStatus(302);
        $motivo = MotivoPerdida::where('nombre', 'Causa Descarte Automatizada')->first();
        $this->assertNotNull($motivo);

        // 2. Editar motivo
        $responseUpdate = $this->actingAs($this->admin)->put("/motivos-perdida/{$motivo->id_motivo}", [
            'nombre' => 'Causa Descarte Actualizada',
        ]);
        $responseUpdate->assertStatus(302);
        $this->assertEquals('Causa Descarte Actualizada', $motivo->fresh()->nombre);

        // 3. Eliminar motivo libre -> Debe eliminarse con éxito
        $responseDelete = $this->actingAs($this->admin)->delete("/motivos-perdida/{$motivo->id_motivo}");
        $responseDelete->assertStatus(302);
        $this->assertNull(MotivoPerdida::find($motivo->id_motivo));
    }

    /**
     * Blindaje Bolsa Común: Vendedor puede tomar prospectos sin asignar pero no prospectos de otros.
     */
    public function test_vendedor_can_claim_lead_from_bolsa_comun_but_cannot_claim_assigned_lead(): void
    {
        // 1. Lead en bolsa común
        $leadBolsa = Lead::create([
            'nombre' => 'Lead Bolsa Tomable',
            'telefono' => '78899001',
            'id_origen' => 1,
            'id_etapa' => 1,
            'id_vendedor' => null,
            'created_by' => $this->admin->id_usuario,
        ]);

        // Vendedor 1 toma el prospecto para sí mismo -> Éxito
        $responseTomar = $this->actingAs($this->vendedor1)->post("/leads/{$leadBolsa->id_lead}/asignar", [
            'id_vendedor' => $this->vendedor1->id_usuario,
        ]);
        $responseTomar->assertSessionHasNoErrors();
        $this->assertEquals($this->vendedor1->id_usuario, $leadBolsa->fresh()->id_vendedor);

        // Vendedor 2 intenta tomar el mismo prospecto (que ya tiene vendedor) -> 403 Prohibido
        $responseRobar = $this->actingAs($this->vendedor2)->post("/leads/{$leadBolsa->id_lead}/asignar", [
            'id_vendedor' => $this->vendedor2->id_usuario,
        ]);
        $responseRobar->assertStatus(403);
    }

    /**
     * Blindaje Etapa Convertido: No se puede revertir un alumno ya matriculado salvo por Admin.
     */
    public function test_cannot_revert_converted_lead_unless_admin(): void
    {
        $leadConvertido = Lead::create([
            'nombre' => 'Alumno Convertido Intocable',
            'telefono' => '79900112',
            'id_origen' => 1,
            'id_etapa' => 5, // Convertido
            'id_vendedor' => $this->vendedor1->id_usuario,
            'ci' => '98765432',
            'fecha_nacimiento' => '1995-05-10',
            'ciudad' => 'Santa Cruz',
            'created_by' => $this->admin->id_usuario,
        ]);

        // Intento de vendedor de revertirlo a Seguimiento -> Debe lanzar ValidationException
        $this->expectException(ValidationException::class);

        $this->pipelineService->cambiarEtapa(
            $leadConvertido,
            3, // Seguimiento
            [],
            $this->vendedor1
        );
    }
}
