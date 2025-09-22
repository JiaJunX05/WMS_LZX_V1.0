<?php

namespace App\Models\AttributeVariants;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\ProductVariants\ProductVariant;
use App\Models\AttributeVariants\Brand;
use App\Models\AttributeVariants\Color;
use App\Models\AttributeVariants\SizeMappings\SizeType;

class AttributeVariant extends Model
{
    use HasFactory;

    protected $table = 'attribute_variants';

    protected $fillable = [
        'variant_id',
        'brand_id',
        'color_id',
        'size_id',
    ];

    public function variant(): BelongsTo {
        return $this->belongsTo(ProductVariant::class, 'variant_id', 'id');
    }

    public function brand(): BelongsTo {
        return $this->belongsTo(Brand::class, 'brand_id', 'id');
    }

    public function color(): BelongsTo {
        return $this->belongsTo(Color::class, 'color_id', 'id');
    }

    public function size(): BelongsTo {
        return $this->belongsTo(SizeType::class, 'size_id', 'id');
    }
}
