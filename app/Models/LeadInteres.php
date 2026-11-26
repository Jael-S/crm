<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeadInteres extends Model
{
    protected $table = 'lead_interes';
    protected $primaryKey = 'id_interes';
    public $timestamps = true;

    protected $fillable = [
        'id_lead',
        'tipo',
        'id_version_externo',
        'id_modulo_externo',
        'nombre_snapshot',
        'estado',
        'monto_pactado',
        'id_descuento',
    ];

    protected function casts(): array
    {
        return [
            'monto_pactado' => 'decimal:2',
        ];
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'id_lead', 'id_lead');
    }

    public function descuento(): BelongsTo
    {
        return $this->belongsTo(Descuento::class, 'id_descuento', 'id_descuento');
    }

    public function comprobantes(): HasMany
    {
        return $this->hasMany(ComprobantePago::class, 'id_interes', 'id_interes');
    }

    public function enviosMatricula(): HasMany
    {
        return $this->hasMany(EnvioMatricula::class, 'id_interes', 'id_interes');
    }

    public function esMatriculado(): bool
    {
        return $this->estado === 'MATRICULADO';
    }
}
