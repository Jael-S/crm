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
        'id_comprobante',
        'payload',
        'estado',
        'respuesta_api',
        'intentos',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'intentos' => 'integer',
        ];
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'id_lead', 'id_lead');
    }

    public function comprobante(): BelongsTo
    {
        return $this->belongsTo(ComprobantePago::class, 'id_comprobante', 'id_comprobante');
    }
}
