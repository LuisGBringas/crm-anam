<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Unit extends Model
{
    public const TYPES = ['energia', 'auxiliar'];
    public const STATUSES = ['correcto', 'mantenimiento_programado', 'mantenimiento_necesario'];

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'unit_type',
        'category',
        'operator',
        'capacity_mw',
        'status',
        'latitude',
        'longitude',
        'address',
        'state',
        'source',
        'external_ref',
        'notes',
        'vpn_code',
        'site_name',
        'hostname',
        'marca',
        'modelo',
        'numero_serie',
        'capacity_label',
        'rack_location',
        'iniciativa',
        'responsable_administracion',
        'criticidad',
        'es_virtual',
    ];

    protected $casts = [
        'capacity_mw' => 'decimal:3',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $model): void {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(StatusHistory::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
