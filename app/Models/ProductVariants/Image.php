<?php

namespace App\Models\ProductVariants;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\ProductVariants\ProductVariant;

class Image extends Model
{
    use HasFactory;

    protected $table = 'images';

    protected $fillable = [
        'detail_image',
        'product_id',
    ];

    public function productVariant(): BelongsTo {
        return $this->belongsTo(ProductVariant::class, 'product_id', 'id');
    }
}
