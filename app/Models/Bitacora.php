<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bitacora extends Model
{
    protected $table = 'bitacora';
    protected $primaryKey = 'id_evento';
    public $timestamps = false;

    protected $fillable = [
        'id_lead',
        'id_usuario',
        'tipo',
        'descripcion',
        'id_etapa_anterior',
        'id_etapa_nueva',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'id_lead', 'id_lead');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function etapaAnterior(): BelongsTo
    {
        return $this->belongsTo(EtapaPipeline::class, 'id_etapa_anterior', 'id_etapa');
    }

    public function etapaNueva(): BelongsTo
    {
        return $this->belongsTo(EtapaPipeline::class, 'id_etapa_nueva', 'id_etapa');
    }
}
