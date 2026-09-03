<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeritCriteria extends Model
{
    use HasFactory;

    protected $table = 'merit_criteria';

    protected $fillable = [
        'programme_id',
        'criteria_name',
        'academic_weight_pct',
        'entry_test_weight_pct',
        'minimum_eligibility_pct',
        'tiebreaker_rule',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'academic_weight_pct' => 'decimal:2',
            'entry_test_weight_pct' => 'decimal:2',
            'minimum_eligibility_pct' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function programme()
    {
        return $this->belongsTo(Programme::class);
    }

    public function calculateScore(float $academicPercentage, float $testPercentage = 0.0): float
    {
        $academicComponent = ($academicPercentage * ($this->academic_weight_pct / 100));
        $testComponent = ($testPercentage * ($this->entry_test_weight_pct / 100));

        return round($academicComponent + $testComponent, 2);
    }
}
