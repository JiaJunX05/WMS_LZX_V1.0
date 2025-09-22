<?php

namespace App\Models\AttributeVariants;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\AttributeVariants\AttributeVariant;

class Brand extends Model
{
    use HasFactory;

    protected $table = 'brands';

    protected $fillable = [
        'brand_image',
        'brand_name',
        'brand_status',
    ];

    public function attributeVariants(): HasMany {
        return $this->hasMany(AttributeVariant::class, 'brand_id', 'id');
    }
}
