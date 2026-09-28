<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EtapaPipeline extends Model
{
    protected $table = 'etapas_pipeline';
    protected $fillable = ['nombre', 'orden'];
}