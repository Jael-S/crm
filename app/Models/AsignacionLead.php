<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsignacionLead extends Model
{
    use HasFactory;

    protected $table = 'asignaciones_lead';
    protected $primaryKey = 'id_asignacion';
    public $timestamps = false; // Solo maneja created_at en la BD

    protected $fillable = [
        'id_lead',
        'id_vendedor_anterior',
        'id_vendedor_nuevo',
        'asignado_por',
        'tipo',
        'motivo',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /**
     * Prospecto al que pertenece la asignación
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'id_lead', 'id_lead');
    }

    /**
     * Vendedor que lo tenía asignado anteriormente (NULL si viene de bolsa común)
     */
    public function vendedorAnterior(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_vendedor_anterior', 'id_usuario');
    }

    /**
     * Vendedor que recibe el prospecto
     */
    public function vendedorNuevo(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_vendedor_nuevo', 'id_usuario');
    }

    /**
     * Usuario (Administrador o Coordinador) que realizó la acción
     */
    public function asignadoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'asignado_por', 'id_usuario');
    }
}
