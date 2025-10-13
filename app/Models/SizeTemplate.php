<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\SizeLibrary;
use App\Models\Category;
use App\Models\Gender;

class SizeTemplate extends Model
{
    use HasFactory;

    protected $table = 'size_templates';

    protected $fillable = [
        'category_id',
        'gender_id',
        'size_library_id',
        'template_status',
    ];

    public function category(): BelongsTo {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function gender(): BelongsTo {
        return $this->belongsTo(Gender::class, 'gender_id', 'id');
    }


    public function sizeLibrary(): BelongsTo {
        return $this->belongsTo(SizeLibrary::class, 'size_library_id', 'id');
    }

}

