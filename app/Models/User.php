<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_APPLICANT = 'applicant';
    public const ROLE_ADMISSIONS_OFFICER = 'admissions_officer';
    public const ROLE_PROGRAMME_COORDINATOR = 'programme_coordinator';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isApplicant(): bool
    {
        return $this->role === self::ROLE_APPLICANT;
    }

    public function isAdmissionsOfficer(): bool
    {
        return $this->role === self::ROLE_ADMISSIONS_OFFICER;
    }

    public function isProgrammeCoordinator(): bool
    {
        return $this->role === self::ROLE_PROGRAMME_COORDINATOR;
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function verifiedDocuments()
    {
        return $this->hasMany(Document::class, 'verified_by');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
