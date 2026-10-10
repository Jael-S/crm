<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoordinadorVersion extends Model
{
    protected $table = 'coordinador_version';
    
    // Al ser una tabla puente con llave primaria compuesta, indicamos que no tiene un solo ID autoincremental
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_version_externo',
    ];

    // Relación: Pertenece a un usuario coordinador
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}