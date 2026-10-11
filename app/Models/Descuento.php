<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Descuento extends Model
{
    use HasFactory;

    protected $table = 'descuentos';
    protected $primaryKey = 'id_descuento';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'porcentaje',
        'descripcion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'porcentaje' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }

    /**
     * Prospectos que tienen asignado este descuento
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'id_descuento', 'id_descuento');
    }

    /**
     * Scope para filtrar únicamente descuentos activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
