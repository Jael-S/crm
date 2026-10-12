<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportacionCsvError extends Model
{
    protected $table = 'importaciones_csv_errores';
    protected $primaryKey = 'id_error';
    public $timestamps = false;

    protected $fillable = ['id_importacion', 'numero_linea', 'motivo'];

    public function importacion(): BelongsTo
    {
        return $this->belongsTo(ImportacionCsv::class, 'id_importacion', 'id_importacion');
    }
}
