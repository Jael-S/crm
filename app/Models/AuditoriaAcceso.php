<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditoriaAcceso extends Model
{
    protected $table = 'auditoria_accesos';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'tipo_evento',
        'ip',
        'user_agent',
        'detalles',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}
