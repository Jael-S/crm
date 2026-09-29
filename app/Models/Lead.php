<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;

    protected $table = 'leads';
    protected $primaryKey = 'id_lead';

    protected $fillable = [
        'nombre',
        'telefono',
        'correo',
        'id_origen',
        'id_etapa',
        'id_vendedor',
        'id_motivo_perdida',
        'comentario_perdida',
        'id_importacion',
        'fecha_asignacion',
        'ci',
        'nombre_completo',
        'fecha_nacimiento',
        'ciudad',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'fecha_asignacion' => 'datetime',
            'fecha_nacimiento' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Canal u origen del prospecto (Facebook, WhatsApp, etc.)
     */
    public function origen(): BelongsTo
    {
        return $this->belongsTo(OrigenLead::class, 'id_origen', 'id_origen');
    }

    /**
     * Etapa actual en el pipeline (Nuevo, En Contacto, etc.)
     */
    public function etapa(): BelongsTo
    {
        return $this->belongsTo(EtapaPipeline::class, 'id_etapa', 'id_etapa');
    }

    /**
     * Asesor / Vendedor asignado (NULL = Bolsa Común)
     */
    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_vendedor', 'id_usuario');
    }

    /**
     * Usuario que registró inicialmente el prospecto
     */
    public function creador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'created_by', 'id_usuario');
    }

    /**
     * Motivo si el prospecto fue marcado como perdido
     */
    public function motivoPerdida(): BelongsTo
    {
        return $this->belongsTo(MotivoPerdida::class, 'id_motivo_perdida', 'id_motivo');
    }

    /**
     * Historial de asignaciones y transferencias
     */
    public function asignaciones(): HasMany
    {
        return $this->hasMany(AsignacionLead::class, 'id_lead', 'id_lead')->orderBy('created_at', 'desc');
    }

    /**
     * Verifica si el lead se encuentra libre en la bolsa común
     */
    public function esBolsaComun(): bool
    {
        return is_null($this->id_vendedor);
    }

    /**
     * Scope para filtrar solo prospectos en bolsa común
     */
    public function scopeBolsaComun($query)
    {
        return $query->whereNull('id_vendedor');
    }

    /**
     * Scope para filtrar por vendedor específico
     */
    public function scopeDeVendedor($query, int $idUsuario)
    {
        return $query->where('id_vendedor', $idUsuario);
    }
}
