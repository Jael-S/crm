<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnvioMatricula extends Model
{
    protected $table = 'envios_matricula';
    protected $primaryKey = 'id_envio';

    protected $fillable = [
        'id_lead',
        'id_interes',
        'id_comprobante',
        'payload',
        'estado',
        'respuesta_api',
        'intentos',
        'fecha_envio',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'intentos' => 'integer',
            'fecha_envio' => 'datetime',
        ];
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'id_lead', 'id_lead');
    }

    public function interes(): BelongsTo
    {
        return $this->belongsTo(LeadInteres::class, 'id_interes', 'id_interes');
    }

    public function comprobante(): BelongsTo
    {
        return $this->belongsTo(ComprobantePago::class, 'id_comprobante', 'id_comprobante');
    }
}
