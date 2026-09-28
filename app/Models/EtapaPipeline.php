<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EtapaPipeline extends Model
{
    protected $table = 'etapas_pipeline';
    protected $primaryKey = 'id_etapa';
    public $timestamps = false; // Como esta tabla es un catálogo fijo, no requiere timestamps

    protected $fillable = ['nombre', 'orden'];
}