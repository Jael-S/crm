<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MotivoPerdida extends Model
{
    protected $table = 'motivos_perdida';
    protected $primaryKey = 'id_motivo';
    public $timestamps = false;
}