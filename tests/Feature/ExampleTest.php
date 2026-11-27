<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use DatabaseTransactions;
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_public_registration_page_is_accessible(): void
    {
        $response = $this->get('/registro');

        $response->assertStatus(200);
    }

    public function test_public_registration_creates_lead_and_interest(): void
    {
        $tel = '7' . rand(1000000, 9999999);
        $response = $this->post('/registro', [
            'nombre' => 'Estudiante Prueba FICCT',
            'telefono' => $tel,
            'correo' => 'prueba.ficct.' . uniqid() . '@uagrm.edu.bo',
            'ciudad' => 'Santa Cruz de la Sierra',
            'id_profesion' => 1,
            'programa' => 'Excel Avanzado con Inteligencia Artificial',
            'precio' => 1200.0,
            'mensaje' => 'Interesado en turno noche',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('leads', [
            'nombre' => 'Estudiante Prueba FICCT',
            'telefono' => $tel,
            'id_etapa' => 1,
            'id_vendedor' => null,
            'id_profesion' => 1,
        ]);
    }

    public function test_dashboard_renders_all_reports_for_admin(): void
    {
        $admin = \App\Models\Usuario::where('id_rol', 1)->first() ?: \App\Models\Usuario::find(1);
        $this->actingAs($admin);

        $response = $this->get('/dashboard');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard/Index', false)
            ->has('reporteEmbudo')
            ->has('metricasGlobales')
            ->has('matrizVendedores')
            ->has('reporteOrigenes')
            ->has('reporteMotivosPerdida')
        );
    }

    public function test_dashboard_renders_seller_metrics_for_vendedor(): void
    {
        $vendedor = \App\Models\Usuario::where('id_rol', 3)->first();
        if ($vendedor) {
            $this->actingAs($vendedor);

            $response = $this->get('/dashboard');
            $response->assertStatus(200);
            $response->assertInertia(fn ($page) => $page
                ->component('Dashboard/Index', false)
                ->has('dashboardVendedor')
            );
        }
    }

    public function test_dashboard_renders_coordinator_metrics_filtered_by_program(): void
    {
        $coordinador = \App\Models\Usuario::where('id_rol', 2)->first();
        if ($coordinador) {
            $this->actingAs($coordinador);

            $response = $this->get('/dashboard');
            $response->assertStatus(200);
            $response->assertInertia(fn ($page) => $page
                ->component('Dashboard/Index', false)
                ->where('esCoordinador', true)
                ->has('reporteEmbudo')
                ->has('metricasGlobales')
            );
        }
    }

    public function test_qr_payment_generates_digital_voucher(): void
    {
        $admin = \App\Models\Usuario::where('id_rol', 1)->first() ?: \App\Models\Usuario::find(1);
        $this->actingAs($admin);

        $lead = \App\Models\Lead::create([
            'nombre' => 'Postulante QR Test',
            'telefono' => '7' . rand(1000000, 9999999),
            'correo' => 'test.qr.' . uniqid() . '@uagrm.edu.bo',
            'ciudad' => 'Santa Cruz de la Sierra',
            'id_origen' => 1,
            'id_etapa' => 4, // Promesa de Pago
            'created_by' => $admin->id_usuario,
        ]);

        $interes = \App\Models\LeadInteres::create([
            'id_lead' => $lead->id_lead,
            'tipo' => 'PROGRAMA',
            'id_version_externo' => 1,
            'nombre_snapshot' => 'Diplomado en Inteligencia Artificial',
            'monto_pactado' => 2600.00,
            'estado' => 'INTERESADO',
        ]);

        $ref = 'QR-' . rand(100000, 999999);
        $response = $this->post("/leads/{$lead->id_lead}/comprobantes", [
            'metodo_pago' => 'QR',
            'referencia_transaccion' => $ref,
            'monto' => 2600.00,
            'id_interes' => $interes->id_interes,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('comprobantes_pago', [
            'id_lead' => $lead->id_lead,
            'id_interes' => $interes->id_interes,
            'metodo_pago' => 'QR',
            'referencia_transaccion' => $ref,
            'monto' => 2600.00,
            'estado' => 'PENDIENTE',
        ]);
    }

    public function test_stripe_card_payment_generates_digital_voucher(): void
    {
        $admin = \App\Models\Usuario::where('id_rol', 1)->first() ?: \App\Models\Usuario::find(1);
        $this->actingAs($admin);

        $lead = \App\Models\Lead::create([
            'nombre' => 'Postulante Stripe Test',
            'telefono' => '7' . rand(1000000, 9999999),
            'correo' => 'test.stripe.' . uniqid() . '@uagrm.edu.bo',
            'ciudad' => 'Santa Cruz de la Sierra',
            'id_origen' => 1,
            'id_etapa' => 4, // Promesa de Pago
            'created_by' => $admin->id_usuario,
        ]);

        $interes = \App\Models\LeadInteres::create([
            'id_lead' => $lead->id_lead,
            'tipo' => 'PROGRAMA',
            'id_version_externo' => 1,
            'nombre_snapshot' => 'Diplomado en Inteligencia Artificial',
            'monto_pactado' => 2600.00,
            'estado' => 'INTERESADO',
        ]);

        $ref = 'ch_stripe_' . rand(100000, 999999);
        $response = $this->post("/leads/{$lead->id_lead}/comprobantes", [
            'metodo_pago' => 'TARJETA',
            'referencia_transaccion' => $ref,
            'stripe_titular' => 'Postulante Stripe Test',
            'monto' => 2600.00,
            'id_interes' => $interes->id_interes,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('comprobantes_pago', [
            'id_lead' => $lead->id_lead,
            'id_interes' => $interes->id_interes,
            'metodo_pago' => 'TARJETA',
            'referencia_transaccion' => $ref,
            'monto' => 2600.00,
            'estado' => 'PENDIENTE',
        ]);
    }
}
