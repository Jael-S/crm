<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadInteres extends Model
{
    protected $table = 'lead_interes';
    protected $primaryKey = 'id_interes';
    public $timestamps = false;

    protected $fillable = [
        'id_lead',
        'tipo',
        'id_version_externo',
        'id_modulo_externo',
        'nombre_snapshot'
    ];

    // Relación: Un interés pertenece a un lead
    public function lead()
    {
        return $this->belongsTo(Lead::class, 'id_lead', 'id_lead');
    }
}