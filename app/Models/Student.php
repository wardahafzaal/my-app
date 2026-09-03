<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'cnic_bform',
        'email',
        'phone',
        'date_of_birth',
        'address',
        'previous_institution',
        'qualification',
        'total_marks',
        'obtained_marks',
        'marks_grade',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'total_marks' => 'decimal:2',
            'obtained_marks' => 'decimal:2',
        ];
    }

    protected $appends = ['percentage'];

    public function getPercentageAttribute(): float
    {
        if ($this->total_marks > 0) {
            return round(($this->obtained_marks / $this->total_marks) * 100, 2);
        }

        return 0.0;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
