<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\SizeTemplate;

class Gender extends Model
{
    use HasFactory;

    protected $table = 'genders';

    protected $fillable = [
        'gender_name',
        'gender_status',
    ];

    public function sizeTemplates(): HasMany {
        return $this->hasMany(SizeTemplate::class, 'gender_id', 'id');
    }
}
