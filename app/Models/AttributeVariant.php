<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\ProductVariant;
use App\Models\ManagementTool\Brand;
use App\Models\ManagementTool\Color;
use App\Models\SizeLibrary\SizeLibrary;

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
        return $this->belongsTo(SizeLibrary::class, 'size_id', 'id');
    }
}
