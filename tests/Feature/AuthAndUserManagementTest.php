<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AuthAndUserManagementTest extends TestCase
{
    use DatabaseTransactions;

    public function test_login_page_renders_successfully(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $response = $this->post('/login', [
            'correo' => 'admin@crm.bo',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        $response = $this->post('/login', [
            'correo' => 'admin@crm.bo',
            'password' => 'clave_incorrecta',
        ]);

        $response->assertSessionHasErrors('correo');
        $this->assertGuest();
    }

    public function test_inactive_user_cannot_login(): void
    {
        $usuario = Usuario::where('correo', 'vendedor2@crm.bo')->first();
        $usuario->update(['activo' => false]);

        $response = $this->post('/login', [
            'correo' => 'vendedor2@crm.bo',
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('correo');
        $this->assertGuest();
    }

    public function test_admin_can_access_user_management(): void
    {
        $admin = Usuario::where('id_rol', 1)->first();

        $response = $this->actingAs($admin)->get('/usuarios');

        $response->assertStatus(200);
    }

    public function test_vendedor_cannot_access_user_management(): void
    {
        $vendedor = Usuario::where('id_rol', 3)->first();

        $response = $this->actingAs($vendedor)->get('/usuarios');

        $response->assertStatus(403);
    }

    public function test_admin_can_create_new_user(): void
    {
        $admin = Usuario::where('id_rol', 1)->first();

        $response = $this->actingAs($admin)->post('/usuarios', [
            'nombre_completo' => 'Nuevo Prospector',
            'correo' => 'nuevo.vendedor@crm.bo',
            'id_rol' => 3,
            'password' => 'password123',
            'activo' => true,
            'participa_round_robin' => true,
        ]);

        $response->assertRedirect('/usuarios');
        $this->assertDatabaseHas('usuarios', [
            'correo' => 'nuevo.vendedor@crm.bo',
            'id_rol' => 3,
            'participa_round_robin' => true,
        ]);
    }

    public function test_admin_can_toggle_user_status(): void
    {
        $admin = Usuario::where('id_rol', 1)->first();
        $vendedor = Usuario::where('id_rol', 3)->first();
        $originalStatus = $vendedor->activo;

        $response = $this->actingAs($admin)->patch("/usuarios/{$vendedor->id_usuario}/status");

        $response->assertRedirect('/usuarios');
        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $vendedor->id_usuario,
            'activo' => ! $originalStatus,
        ]);
    }

    public function test_admin_can_toggle_round_robin(): void
    {
        $admin = Usuario::where('id_rol', 1)->first();
        $vendedor = Usuario::where('id_rol', 3)->first();
        $originalRR = $vendedor->participa_round_robin;

        $response = $this->actingAs($admin)->patch("/usuarios/{$vendedor->id_usuario}/round-robin");

        $response->assertRedirect('/usuarios');
        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $vendedor->id_usuario,
            'participa_round_robin' => ! $originalRR,
        ]);
    }
}
