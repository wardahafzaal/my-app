<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_UNDER_REVIEW = 'under review';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'application_number',
        'student_id',
        'programme_id',
        'university_name',
        'application_date',
        'status',
        'merit_score',
        'merit_rank',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'application_date' => 'datetime',
            'merit_score' => 'decimal:2',
            'merit_rank' => 'integer',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function programme()
    {
        return $this->belongsTo(Programme::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public static function generateApplicationNumber(): string
    {
        $year = date('Y');
        $random = strtoupper(substr(uniqid(), -5));
        $count = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('APP-%s-%04d-%s', $year, $count, $random);
    }
}
