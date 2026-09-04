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
        'father_name',
        'gender',
        'cnic_bform',
        'email',
        'phone',
        'alternate_phone',
        'date_of_birth',
        'domicile_province',
        'domicile_district',
        'nationality',
        'address',
        'current_address',
        'province',
        'district',
        'tehsil',
        'city',
        'postal_code',
        'previous_institution',
        'qualification',
        'total_marks',
        'obtained_marks',
        'marks_grade',
        'matric_board',
        'matric_roll_no',
        'matric_reg_no',
        'matric_passing_year',
        'matric_total_marks',
        'matric_obtained_marks',
        'matric_percentage',
        'matric_grade',
        'matric_status',
        'inter_board',
        'inter_roll_no',
        'inter_reg_no',
        'inter_passing_year',
        'inter_total_marks',
        'inter_obtained_marks',
        'inter_percentage',
        'inter_group',
        'inter_status',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'total_marks' => 'decimal:2',
            'obtained_marks' => 'decimal:2',
            'matric_total_marks' => 'decimal:2',
            'matric_obtained_marks' => 'decimal:2',
            'matric_percentage' => 'decimal:2',
            'inter_total_marks' => 'decimal:2',
            'inter_obtained_marks' => 'decimal:2',
            'inter_percentage' => 'decimal:2',
        ];
    }

    protected $appends = ['percentage', 'completion_percentage'];

    public function getPercentageAttribute(): float
    {
        if ($this->total_marks > 0) {
            return round(($this->obtained_marks / $this->total_marks) * 100, 2);
        }

        return 0.0;
    }

    public function getCompletionPercentageAttribute(): int
    {
        $fields = [
            // Step 1: Personal (8)
            $this->full_name,
            $this->father_name,
            $this->gender,
            $this->date_of_birth,
            $this->cnic_bform,
            $this->domicile_province,
            $this->domicile_district,
            $this->nationality,

            // Step 2: Contact (7)
            $this->phone,
            $this->email,
            $this->address,
            $this->current_address,
            $this->province,
            $this->district,
            $this->city,

            // Step 3: Academic (11)
            $this->matric_board,
            $this->matric_roll_no,
            $this->matric_passing_year,
            $this->matric_total_marks,
            $this->matric_obtained_marks,
            $this->inter_board,
            $this->inter_roll_no,
            $this->inter_passing_year,
            $this->inter_total_marks,
            $this->inter_obtained_marks,
            $this->inter_group,
        ];

        $filled = count(array_filter($fields, fn($val) => !empty($val) || (is_numeric($val) && $val > 0)));
        $total = count($fields);

        return (int) round(($filled / $total) * 100);
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
