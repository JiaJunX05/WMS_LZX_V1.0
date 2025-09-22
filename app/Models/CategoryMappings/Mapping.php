<?php

namespace App\Models\CategoryMappings;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\CategoryMappings\Category;
use App\Models\CategoryMappings\Subcategory;

class Mapping extends Model
{
    use HasFactory;

    protected $table = 'mappings';

    protected $fillable = [
        'category_id',
        'subcategory_id',
    ];

    public function category(): BelongsTo {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function subcategory(): BelongsTo {
        return $this->belongsTo(Subcategory::class, 'subcategory_id', 'id');
    }
}
