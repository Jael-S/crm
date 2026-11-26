<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visita extends Model
{
    protected $table = 'visitas';
    public $timestamps = false;

    protected $fillable = [
        'pagina',
        'contador',
        'actualizado_en',
    ];

    protected function casts(): array
    {
        return [
            'contador' => 'integer',
            'actualizado_en' => 'datetime',
        ];
    }
}
