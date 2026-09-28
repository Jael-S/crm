<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrigenLead extends Model
{
    protected $table = 'origenes_lead';
    protected $primaryKey = 'id_origen';
    public $timestamps = false;
}