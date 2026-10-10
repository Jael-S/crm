<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profesion extends Model
{
    protected $table = 'profesiones';
    protected $primaryKey = 'id_profesion';
    public $timestamps = false; // Como no tiene created_at / updated_at

    protected $fillable = ['nombre'];

    // Relación inversa: Una profesión la pueden tener muchos leads
    public function leads()
    {
        return $this->hasMany(Lead::class, 'id_profesion', 'id_profesion');
    }
}