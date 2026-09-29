<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\Usuario;
use Tests\TestCase;

class LeadRoutesTest extends TestCase
{
    public function test_admin_can_access_leads_and_bolsa_comun(): void
    {
        $admin = Usuario::find(1); // Admin Nataly

        // 1. Probar acceso a /leads
        $response = $this->actingAs($admin)->get('/leads');
        $response->assertStatus(200);

        // 2. Probar acceso a /leads/bolsa-comun (no debe chocar con /leads/{id})
        $responsePool = $this->actingAs($admin)->get('/leads/bolsa-comun');
        $responsePool->assertStatus(200);

        // 3. Probar acceso a ficha de lead existente /leads/{id}
        $lead = Lead::first();
        $responseShow = $this->actingAs($admin)->get("/leads/{$lead->id_lead}");
        $responseShow->assertStatus(200);
    }

    public function test_vendedor_can_access_own_leads_and_bolsa_comun(): void
    {
        $vendedor = Usuario::find(3); // Nicol Flores (Vendedora 1)

        $response = $this->actingAs($vendedor)->get('/leads');
        $response->assertStatus(200);

        $responsePool = $this->actingAs($vendedor)->get('/leads/bolsa-comun');
        $responsePool->assertStatus(200);
    }
}
