<?php

namespace App\Models\AttributeVariants\SizeMappings;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\AttributeVariants\SizeMappings\SizeClothing;
use App\Models\AttributeVariants\SizeMappings\SizeShoes;
use App\Models\AttributeVariants\AttributeVariant;
use App\Models\CategoryMappings\Category;
use App\Models\AttributeVariants\Gender;

class SizeType extends Model
{
    use HasFactory;

    protected $table = 'size_types';

    protected $fillable = [
        'clothing_size_id',
        'shoe_size_id',
        'category_id',
        'size_status',
    ];

    protected $appends = ['size_value', 'gender'];

    public function clothingSize(): BelongsTo {
        return $this->belongsTo(SizeClothing::class, 'clothing_size_id', 'id');
    }

    public function shoeSize(): BelongsTo {
        return $this->belongsTo(SizeShoes::class, 'shoe_size_id', 'id');
    }

    public function category(): BelongsTo {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function attributeVariants(): HasMany {
        return $this->hasMany(AttributeVariant::class, 'size_id', 'id');
    }


    // 获取实际的尺码值
    public function getSizeValueAttribute() {
        if ($this->clothing_size_id) {
            return $this->clothingSize ? $this->clothingSize->size_value : null;
        }
        if ($this->shoe_size_id) {
            return $this->shoeSize ? $this->shoeSize->size_value : null;
        }
        return null;
    }

    // 获取性别信息
    public function getGenderAttribute() {
        if ($this->clothing_size_id && $this->clothingSize) {
            return $this->clothingSize->gender;
        }
        if ($this->shoe_size_id && $this->shoeSize) {
            return $this->shoeSize->gender;
        }
        return null;
    }

    // 获取尺码类型
    public function getTypeAttribute() {
        if ($this->clothing_size_id) {
            return 'clothing';
        }
        if ($this->shoe_size_id) {
            return 'shoes';
        }
        return null;
    }
}
