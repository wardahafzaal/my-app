<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Document;
use App\Models\MeritCriteria;
use App\Models\Programme;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdmissionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Programmes
        $programmes = [
            [
                'code' => 'BSCS',
                'name' => 'BS Computer Science',
                'faculty' => 'Faculty of Computing & Information Technology',
                'degree_level' => 'Undergraduate (BS - 4 Years)',
                'capacity' => 50,
                'is_active' => true,
            ],
            [
                'code' => 'BSSE',
                'name' => 'BS Software Engineering',
                'faculty' => 'Faculty of Computing & Information Technology',
                'degree_level' => 'Undergraduate (BS - 4 Years)',
                'capacity' => 45,
                'is_active' => true,
            ],
            [
                'code' => 'BSDS',
                'name' => 'BS Data Science',
                'faculty' => 'Faculty of Computing & Information Technology',
                'degree_level' => 'Undergraduate (BS - 4 Years)',
                'capacity' => 40,
                'is_active' => true,
            ],
            [
                'code' => 'BBA',
                'name' => 'Bachelor of Business Administration',
                'faculty' => 'Faculty of Management Sciences',
                'degree_level' => 'Undergraduate (BBA - 4 Years)',
                'capacity' => 60,
                'is_active' => true,
            ],
            [
                'code' => 'BSEE',
                'name' => 'BS Electrical Engineering',
                'faculty' => 'Faculty of Engineering',
                'degree_level' => 'Undergraduate (BS - 4 Years)',
                'capacity' => 40,
                'is_active' => true,
            ],
        ];

        $programmeModels = [];
        foreach ($programmes as $prog) {
            $p = Programme::updateOrCreate(['code' => $prog['code']], $prog);
            $programmeModels[$prog['code']] = $p;

            // Seed default merit criteria for programme
            MeritCriteria::updateOrCreate(
                ['programme_id' => $p->id],
                [
                    'criteria_name' => 'Standard Academic Merit 2026',
                    'academic_weight_pct' => 100.00,
                    'entry_test_weight_pct' => 0.00,
                    'minimum_eligibility_pct' => 50.00,
                    'tiebreaker_rule' => 'earlier_submission',
                    'is_active' => true,
                ]
            );
        }

        // 2. Seed Users
        $applicant1 = User::updateOrCreate(
            ['email' => 'applicant@campus.edu'],
            [
                'name' => 'Ahmed Khan',
                'role' => User::ROLE_APPLICANT,
                'password' => Hash::make('password'),
            ]
        );

        $applicant2 = User::updateOrCreate(
            ['email' => 'applicant2@campus.edu'],
            [
                'name' => 'Sara Ali',
                'role' => User::ROLE_APPLICANT,
                'password' => Hash::make('password'),
            ]
        );

        $applicant3 = User::updateOrCreate(
            ['email' => 'applicant3@campus.edu'],
            [
                'name' => 'Bilal Tariq',
                'role' => User::ROLE_APPLICANT,
                'password' => Hash::make('password'),
            ]
        );

        $officer = User::updateOrCreate(
            ['email' => 'officer@campus.edu'],
            [
                'name' => 'Fatima Noor (Admissions)',
                'role' => User::ROLE_ADMISSIONS_OFFICER,
                'password' => Hash::make('password'),
            ]
        );

        $coordinator = User::updateOrCreate(
            ['email' => 'coordinator@campus.edu'],
            [
                'name' => 'Dr. Usman Qureshi (Coordinator)',
                'role' => User::ROLE_PROGRAMME_COORDINATOR,
                'password' => Hash::make('password'),
            ]
        );

        // 3. Seed Students
        $student1 = Student::updateOrCreate(
            ['cnic_bform' => '35202-1234567-1'],
            [
                'user_id' => $applicant1->id,
                'full_name' => 'Ahmed Khan',
                'email' => 'applicant@campus.edu',
                'phone' => '0300-1234567',
                'date_of_birth' => '2004-05-15',
                'address' => 'House 14, Street 7, Gulberg III, Lahore',
                'previous_institution' => 'Punjab Group of Colleges, Lahore',
                'qualification' => 'FSc Pre-Engineering',
                'total_marks' => 1100.00,
                'obtained_marks' => 990.00,
                'marks_grade' => '90.00% (A+)',
            ]
        );

        // Sara Ali has identical marks (990/1100 = 90.00%) to test tie-breaker!
        $student2 = Student::updateOrCreate(
            ['cnic_bform' => '35202-7654321-2'],
            [
                'user_id' => $applicant2->id,
                'full_name' => 'Sara Ali',
                'email' => 'applicant2@campus.edu',
                'phone' => '0301-9876543',
                'date_of_birth' => '2004-08-20',
                'address' => 'Sector F-8/2, Islamabad',
                'previous_institution' => 'Islamabad College for Girls',
                'qualification' => 'FSc Pre-Engineering',
                'total_marks' => 1100.00,
                'obtained_marks' => 990.00,
                'marks_grade' => '90.00% (A+)',
            ]
        );

        $student3 = Student::updateOrCreate(
            ['cnic_bform' => '35202-3344556-3'],
            [
                'user_id' => $applicant3->id,
                'full_name' => 'Bilal Tariq',
                'email' => 'applicant3@campus.edu',
                'phone' => '0321-4567890',
                'date_of_birth' => '2003-11-10',
                'address' => 'DHA Phase 5, Karachi',
                'previous_institution' => 'Adamjee Govt Science College, Karachi',
                'qualification' => 'ICS (Physics, Math, Computer)',
                'total_marks' => 1100.00,
                'obtained_marks' => 935.00,
                'marks_grade' => '85.00% (A)',
            ]
        );

        // 4. Seed Applications
        // Student 1 applies to BSCS (earlier date: Aug 1) and BSSE (Aug 2)
        $app1 = Application::updateOrCreate(
            [
                'student_id' => $student1->id,
                'programme_id' => $programmeModels['BSCS']->id,
            ],
            [
                'application_number' => 'APP-2026-0001-BSCS',
                'university_name' => 'National Campus',
                'application_date' => Carbon::parse('2026-08-01 09:30:00'),
                'status' => Application::STATUS_SUBMITTED,
                'merit_score' => 90.00,
            ]
        );

        $app2 = Application::updateOrCreate(
            [
                'student_id' => $student1->id,
                'programme_id' => $programmeModels['BSSE']->id,
            ],
            [
                'application_number' => 'APP-2026-0002-BSSE',
                'university_name' => 'National Campus',
                'application_date' => Carbon::parse('2026-08-02 11:15:00'),
                'status' => Application::STATUS_SUBMITTED,
                'merit_score' => 90.00,
            ]
        );

        // Student 2 applies to BSCS (later date: Aug 5) -> Tied score with Student 1, tie-breaker will put Student 1 first
        $app3 = Application::updateOrCreate(
            [
                'student_id' => $student2->id,
                'programme_id' => $programmeModels['BSCS']->id,
            ],
            [
                'application_number' => 'APP-2026-0003-BSCS',
                'university_name' => 'National Campus',
                'application_date' => Carbon::parse('2026-08-05 15:45:00'),
                'status' => Application::STATUS_SUBMITTED,
                'merit_score' => 90.00,
            ]
        );

        // Student 3 applies to BSCS and BSDS
        $app4 = Application::updateOrCreate(
            [
                'student_id' => $student3->id,
                'programme_id' => $programmeModels['BSCS']->id,
            ],
            [
                'application_number' => 'APP-2026-0004-BSCS',
                'university_name' => 'National Campus',
                'application_date' => Carbon::parse('2026-08-03 14:00:00'),
                'status' => Application::STATUS_SUBMITTED,
                'merit_score' => 85.00,
            ]
        );

        $app5 = Application::updateOrCreate(
            [
                'student_id' => $student3->id,
                'programme_id' => $programmeModels['BSDS']->id,
            ],
            [
                'application_number' => 'APP-2026-0005-BSDS',
                'university_name' => 'National Campus',
                'application_date' => Carbon::parse('2026-08-04 16:30:00'),
                'status' => Application::STATUS_SUBMITTED,
                'merit_score' => 85.00,
            ]
        );

        // 5. Seed Documents
        Document::updateOrCreate(
            [
                'application_id' => $app1->id,
                'document_type' => 'CNIC / B-Form Copy',
            ],
            [
                'student_id' => $student1->id,
                'file_name' => 'cnic_ahmed_khan.pdf',
                'file_path' => 'admission_documents/sample_cnic.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 245000,
                'verification_status' => Document::STATUS_PENDING,
            ]
        );

        Document::updateOrCreate(
            [
                'application_id' => $app1->id,
                'document_type' => 'Intermediate Marksheet',
            ],
            [
                'student_id' => $student1->id,
                'file_name' => 'fsc_marksheet.jpg',
                'file_path' => 'admission_documents/sample_marksheet.jpg',
                'mime_type' => 'image/jpeg',
                'file_size' => 450000,
                'verification_status' => Document::STATUS_VERIFIED,
                'verified_by' => $officer->id,
                'verified_at' => Carbon::now()->subDays(1),
            ]
        );

        Document::updateOrCreate(
            [
                'application_id' => $app3->id,
                'document_type' => 'Matric Certificate',
            ],
            [
                'student_id' => $student2->id,
                'file_name' => 'matric_certificate_sara.png',
                'file_path' => 'admission_documents/sample_matric.png',
                'mime_type' => 'image/png',
                'file_size' => 380000,
                'verification_status' => Document::STATUS_PENDING,
            ]
        );
    }
}
