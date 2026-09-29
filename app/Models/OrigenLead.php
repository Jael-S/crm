<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrigenLead extends Model
{
    protected $table = 'origenes_lead';
    protected $primaryKey = 'id_origen';
    public $timestamps = false;

    protected $fillable = ['nombre'];

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'id_origen', 'id_origen');
    }
}