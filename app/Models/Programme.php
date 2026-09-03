<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Programme extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'faculty',
        'degree_level',
        'capacity',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function meritCriteria()
    {
        return $this->hasMany(MeritCriteria::class);
    }
}
