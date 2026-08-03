<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Ticket extends Model
{
    public const ORIGENS = ['cosisi', 'erni_sedena', 'erni_semar', 'manual'];
    public const STATUSES = ['abierto', 'en_proceso', 'resuelto', 'cancelado'];

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'ticket_number',
        'origen',
        'unit_id',
        'site_name',
        'area',
        'equipo',
        'numero_serie',
        'problema',
        'ultimo_avance',
        'estatus',
        'fecha_apertura',
        'contacto_aduana',
        'contacto_anam',
        'notes',
    ];

    protected $casts = [
        'fecha_apertura' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $model): void {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(TicketStatusHistory::class);
    }
}
