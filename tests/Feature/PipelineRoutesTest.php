<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\OrigenLead;
use App\Models\Usuario;
use Tests\TestCase;

class PipelineRoutesTest extends TestCase
{
    protected Usuario $admin;
    protected Usuario $vendedor;
    protected Lead $lead;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = Usuario::where('correo', 'admin@crm.bo')->first();
        $this->vendedor = Usuario::where('correo', 'vendedor1@crm.bo')->first();
        $this->lead = Lead::first();
    }

    public function test_admin_can_access_pipeline_and_origenes(): void
    {
        $responsePipeline = $this->actingAs($this->admin)->get('/pipeline');
        $responsePipeline->assertStatus(200);

        $responseOrigenes = $this->actingAs($this->admin)->get('/origenes');
        $responseOrigenes->assertStatus(200);
    }

    public function test_vendedor_can_access_pipeline_but_not_origenes(): void
    {
        $responsePipeline = $this->actingAs($this->vendedor)->get('/pipeline');
        $responsePipeline->assertStatus(200);

        $responseOrigenes = $this->actingAs($this->vendedor)->get('/origenes');
        $responseOrigenes->assertStatus(403);
    }

    public function test_admin_can_create_and_delete_origen(): void
    {
        $responseCreate = $this->actingAs($this->admin)->post('/origenes', [
            'nombre' => 'Canal Test QA',
        ]);
        $responseCreate->assertStatus(302);
        
        $nuevoOrigen = OrigenLead::where('nombre', 'Canal Test QA')->first();
        $this->assertNotNull($nuevoOrigen);

        $responseDelete = $this->actingAs($this->admin)->delete("/origenes/{$nuevoOrigen->id_origen}");
        $responseDelete->assertStatus(302);

        $this->assertNull(OrigenLead::where('nombre', 'Canal Test QA')->first());
    }

    public function test_change_stage_via_route(): void
    {
        $response = $this->actingAs($this->admin)->patch("/leads/{$this->lead->id_lead}/etapa", [
            'id_etapa' => 2, // En Contacto
        ]);

        $response->assertStatus(302);
        $this->assertEquals(2, $this->lead->fresh()->id_etapa);
    }
}
