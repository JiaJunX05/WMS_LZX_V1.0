<?php

namespace App\Models\CategoryMapping;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use App\Models\CategoryMapping\Subcategory;
use App\Models\CategoryMapping\Mapping;
use App\Models\ProductVariant;
use App\Models\SizeLibrary\SizeTemplate;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = [
        'category_image',
        'category_name',
        'category_status',
    ];

    public function subcategories(): HasManyThrough {
        return $this->hasManyThrough(Subcategory::class, Mapping::class, 'category_id', 'subcategory_id', 'id');
    }

    public function mappings(): HasMany {
        return $this->hasMany(Mapping::class, 'category_id', 'id');
    }

    public function products(): HasMany {
        return $this->hasMany(ProductVariant::class, 'category_id', 'id');
    }

    public function sizeSystems(): HasMany {
        return $this->hasMany(SizeSystem::class, 'category_id', 'id');
    }
}
