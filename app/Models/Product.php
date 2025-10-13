<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Zone;
use App\Models\Rack;
use App\Models\Image;
use App\Models\ProductVariant;
use App\Models\AttributeVariant;
use App\Models\User;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'cover_image',
        'name',
        'description',
        'price',
        'quantity',
        'sku_code',
        'category_id',
        'subcategory_id',
        'zone_id',
        'rack_id',
        'product_status',
        'user_id',
    ];

    public function category(): BelongsTo {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function subcategory(): BelongsTo {
        return $this->belongsTo(Subcategory::class, 'subcategory_id', 'id');
    }

    public function zone(): BelongsTo {
        return $this->belongsTo(Zone::class, 'zone_id', 'id');
    }

    public function rack(): BelongsTo {
        return $this->belongsTo(Rack::class, 'rack_id', 'id');
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function images(): HasMany {
        return $this->hasMany(Image::class, 'product_id', 'id');
    }

    public function variants(): HasMany {
        return $this->hasMany(ProductVariant::class, 'product_id', 'id');
    }

    public function barcode(): HasOne {
        return $this->hasOne(ProductVariant::class, 'product_id', 'id');
    }
}
