<?php

namespace App\Models\ManagementTool;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\SizeClothing;
use App\Models\SizeShoes;
use App\Models\SizeType;

class Gender extends Model
{
    use HasFactory;

    protected $table = 'genders';

    protected $fillable = [
        'gender_name',
        'gender_status',
    ];

    public function sizeClothings(): HasMany {
        return $this->hasMany(SizeClothing::class, 'gender_id', 'id');
    }

    public function sizeShoes(): HasMany {
        return $this->hasMany(SizeShoes::class, 'gender_id', 'id');
    }

    // 通过 SizeClothing 获取相关的 SizeType
    public function sizeTypesFromClothing(): HasMany {
        return $this->hasManyThrough(
            SizeType::class,
            SizeClothing::class,
            'gender_id',      // SizeClothing 的外键
            'clothing_size_id', // SizeType 的外键
            'id',             // Gender 的本地键
            'id'              // SizeClothing 的本地键
        );
    }

    // 通过 SizeShoes 获取相关的 SizeType
    public function sizeTypesFromShoes(): HasMany {
        return $this->hasManyThrough(
            SizeType::class,
            SizeShoes::class,
            'gender_id',      // SizeShoes 的外键
            'shoe_size_id',   // SizeType 的外键
            'id',             // Gender 的本地键
            'id'              // SizeShoes 的本地键
        );
    }
}
