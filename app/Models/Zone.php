<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use App\Models\Rack;
use App\Models\Location;
use App\Models\ProductVariant;

class Zone extends Model
{
    use HasFactory;

    protected $table = 'zones';

    protected $fillable = [
        'zone_image',
        'zone_name',
        'location',
        'zone_status',
    ];

    public function racks(): HasManyThrough {
        return $this->hasManyThrough(Rack::class, Location::class, 'zone_id', 'rack_id', 'id');
    }

    public function locations(): HasMany {
        return $this->hasMany(Location::class, 'zone_id', 'id');
    }

    public function products(): HasMany {
        return $this->hasMany(ProductVariant::class, 'zone_id', 'id');
    }
}
