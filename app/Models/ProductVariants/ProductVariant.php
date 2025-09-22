<?php

namespace App\Models\ProductVariants;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\ProductVariants\Product;
use App\Models\ProductVariants\Image;
use App\Models\AttributeVariants\AttributeVariant;


class ProductVariant extends Model
{
    use HasFactory;

    protected $table = 'product_variants';

    protected $fillable = [
        'product_id',
        'barcode_number',
        'sku_code',
    ];

    public function product(): BelongsTo {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function attributeVariant(): HasOne {
        return $this->hasOne(AttributeVariant::class, 'variant_id', 'id');
    }
}
