<?php

namespace App\Models\StorageLocation;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\StorageLocation\Zone;
use App\Models\StorageLocation\Rack;

class Location extends Model
{
    use HasFactory;

    protected $table = 'locations';

    protected $fillable = [
        'zone_id',
        'rack_id',
        'location_status',
    ];

    public function zone(): BelongsTo {
        return $this->belongsTo(Zone::class, 'zone_id', 'id');
    }

    public function rack(): BelongsTo {
        return $this->belongsTo(Rack::class, 'rack_id', 'id');
    }
}
