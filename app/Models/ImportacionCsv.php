<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ImportacionCsv extends Model
{
    use HasFactory;

    protected $table = 'importaciones_csv';
    protected $primaryKey = 'id_importacion';

    /**
     * La migración solo define created_at (sin updated_at).
     */
    const UPDATED_AT = null;

    protected $fillable = [
        'id_usuario',
        'nombre_archivo',
        'total_filas',
        'filas_exitosas',
        'filas_fallidas',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'total_filas' => 'integer',
            'filas_exitosas' => 'integer',
            'filas_fallidas' => 'integer',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'id_importacion', 'id_importacion');
    }
}
