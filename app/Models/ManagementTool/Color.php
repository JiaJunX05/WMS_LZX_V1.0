<?php

namespace App\Models\ManagementTool;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\AttributeVariant;

class Color extends Model
{
    use HasFactory;

    protected $table = 'colors';

    protected $fillable = [
        'color_name',
        'color_hex',
        'color_rgb',
        'color_status',
    ];

    public function attributeVariants(): HasMany {
        return $this->hasMany(AttributeVariant::class, 'color_id');
    }
}
