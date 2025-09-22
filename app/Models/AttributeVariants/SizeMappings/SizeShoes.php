<?php

namespace App\Models\AttributeVariants\SizeMappings;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\AttributeVariants\Gender;
use App\Models\AttributeVariants\SizeMappings\SizeType;

class SizeShoes extends Model
{
    use HasFactory;

    protected $table = 'size_shoes';

    protected $fillable = [
        'size_value',
        'gender_id',
        'measurements',
        'size_status',
    ];

    protected $casts = [
        'measurements' => 'array',
    ];

    public function gender(): BelongsTo {
        return $this->belongsTo(Gender::class, 'gender_id', 'id');
    }

    public function sizeTypes(): HasMany {
        return $this->hasMany(SizeType::class, 'shoe_size_id', 'id');
    }
}
