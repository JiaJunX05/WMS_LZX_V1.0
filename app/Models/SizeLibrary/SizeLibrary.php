<?php

namespace App\Models\SizeLibrary;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\CategoryMapping\Category ;
use App\Models\SizeLibrary\SizeTemplate;

class SizeLibrary extends Model
{
    use HasFactory;

    protected $table = 'size_libraries';

    protected $fillable = [
        'category_id',
        'size_value',
        'size_status',
    ];

    public function category(): BelongsTo {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function sizeTemplates(): HasMany {
        return $this->hasMany(SizeTemplate::class, 'size_library_id', 'id');
    }
}
