<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Usuario extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';

    protected $fillable = [
        'id_rol',
        'nombre_completo',
        'correo',
        'password_hash',
        'activo',
        'participa_round_robin',
        'ultimo_acceso',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'participa_round_robin' => 'boolean',
            'ultimo_acceso' => 'datetime',
        ];
    }

    /**
     * Get the password name for Laravel authentication.
     */
    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }

    public function isAdmin(): bool
    {
        return $this->rol?->nombre === 'Administrador';
    }

    public function isCoordinador(): bool
    {
        return $this->rol?->nombre === 'Coordinador';
    }

    public function isVendedor(): bool
    {
        return $this->rol?->nombre === 'Vendedor';
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'id_vendedor', 'id_usuario');
    }

    public function asignacionesRecibidas(): HasMany
    {
        return $this->hasMany(AsignacionLead::class, 'id_vendedor_nuevo', 'id_usuario');
    }

    public function asignacionesRealizadas(): HasMany
    {
        return $this->hasMany(AsignacionLead::class, 'asignado_por', 'id_usuario');
    }
}
