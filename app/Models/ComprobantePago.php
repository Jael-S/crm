<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ComprobantePago extends Model
{
    protected $table = 'comprobantes_pago';
    protected $primaryKey = 'id_comprobante';

    protected $fillable = [
        'id_lead',
        'subido_por',
        'archivo_url',
        'tipo_archivo',
        'monto',
        'estado',
        'revisado_por',
        'fecha_revision',
        'comentario_rechazo',
    ];

    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'fecha_revision' => 'datetime',
        ];
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'id_lead', 'id_lead');
    }

    public function subidoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'subido_por', 'id_usuario');
    }

    public function revisadoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'revisado_por', 'id_usuario');
    }

    public function envioMatricula(): HasOne
    {
        return $this->hasOne(EnvioMatricula::class, 'id_comprobante', 'id_comprobante');
    }
}
