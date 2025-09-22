<?php

namespace App\Models\StorageLocations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use App\Models\StorageLocations\Zone;
use App\Models\StorageLocations\Location;
use App\Models\ProductVariants\ProductVariant;

class Rack extends Model
{
    use HasFactory;

    protected $table = 'racks';

    protected $fillable = [
        'rack_image',
        'rack_number',
        'capacity',
        'rack_status',
    ];

    public function zones(): HasManyThrough {
        return $this->hasManyThrough(Zone::class, Location::class, 'rack_id', 'zone_id', 'id');
    }

    public function locations(): HasMany {
        return $this->hasMany(Location::class, 'rack_id', 'id');
    }

    public function products(): HasMany {
        return $this->hasMany(ProductVariant::class, 'rack_id', 'id');
    }
}
