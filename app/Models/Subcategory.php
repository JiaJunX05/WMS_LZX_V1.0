<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use App\Models\Category;
use App\Models\Mapping;
use App\Models\ProductVariant;

class Subcategory extends Model
{
    use HasFactory;

    protected $table = 'subcategories';

    protected $fillable = [
        'subcategory_image',
        'subcategory_name',
        'subcategory_status',
    ];

    public function categories(): HasManyThrough {
        return $this->hasManyThrough(Category::class, Mapping::class, 'subcategory_id', 'category_id', 'id');
    }

    public function mappings(): HasMany {
        return $this->hasMany(Mapping::class, 'subcategory_id', 'id');
    }

    public function products(): HasMany {
        return $this->hasMany(ProductVariant::class, 'subcategory_id', 'id');
    }
}
