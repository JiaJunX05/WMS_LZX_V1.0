<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Zone;
use App\Models\Rack;

class Location extends Model
{
    use HasFactory;

    protected $table = 'locations';

    protected $fillable = [
        'zone_id',
        'rack_id',
        'current_usage',
        'location_status',
    ];

    public function zone(): BelongsTo {
        return $this->belongsTo(Zone::class, 'zone_id', 'id');
    }

    public function rack(): BelongsTo {
        return $this->belongsTo(Rack::class, 'rack_id', 'id');
    }
}
