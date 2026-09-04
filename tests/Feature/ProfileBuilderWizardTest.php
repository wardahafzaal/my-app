<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Programme;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileBuilderWizardTest extends TestCase
{
    use RefreshDatabase;

    public function test_applicant_can_access_profile_builder(): void
    {
        $user = User::factory()->create(['role' => 'applicant']);
        $programme = Programme::create([
            'code' => 'BSCS',
            'name' => 'BS Computer Science',
            'faculty' => 'Computing',
            'capacity' => 50,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->get(route('profile.builder'));
        $response->assertOk();
    }

    public function test_applicant_can_save_wizard_step_and_auto_calculate_percentage(): void
    {
        $user = User::factory()->create(['role' => 'applicant']);

        $stepData = [
            'step' => 3,
            'full_name' => 'Ali Raza',
            'father_name' => 'Muhammad Raza',
            'gender' => 'Male',
            'cnic_bform' => '35202-1234567-3',
            'date_of_birth' => '2004-05-15',
            'domicile_province' => 'Punjab',
            'domicile_district' => 'Lahore',
            'nationality' => 'Pakistani',
            'phone' => '0300-1112233',
            'email' => 'ali.raza@example.com',
            'address' => 'House 12, Street 4, Lahore',
            'current_address' => 'House 12, Street 4, Lahore',
            'province' => 'Punjab',
            'district' => 'Lahore',
            'city' => 'Lahore',
            'matric_board' => 'BISE Lahore',
            'matric_roll_no' => '112233',
            'matric_passing_year' => '2022',
            'matric_total_marks' => 1100,
            'matric_obtained_marks' => 990, // 90.00%
            'inter_board' => 'BISE Lahore',
            'inter_roll_no' => '445566',
            'inter_passing_year' => '2024',
            'inter_total_marks' => 1100,
            'inter_obtained_marks' => 880, // 80.00%
            'inter_group' => 'ICS',
        ];

        $response = $this->actingAs($user)->post(route('profile.builder.save-step'), $stepData);
        $response->assertSessionHas('status');

        $student = Student::where('user_id', $user->id)->first();
        $this->assertNotNull($student);
        $this->assertEquals('Ali Raza', $student->full_name);
        $this->assertEquals('Muhammad Raza', $student->father_name);
        $this->assertEquals('35202-1234567-3', $student->cnic_bform);
        $this->assertEquals(90.00, (float) $student->matric_percentage);
        $this->assertEquals(80.00, (float) $student->inter_percentage);
        $this->assertGreaterThan(50, $student->completion_percentage);
    }

    public function test_application_submission_requires_declaration(): void
    {
        $user = User::factory()->create(['role' => 'applicant']);
        $programme = Programme::create([
            'code' => 'BSE',
            'name' => 'BS Software Engineering',
            'faculty' => 'Computing',
            'capacity' => 50,
            'is_active' => true,
        ]);

        $student = Student::create([
            'user_id' => $user->id,
            'full_name' => 'Usman Tariq',
            'cnic_bform' => '35201-9876543-1',
            'email' => 'usman@example.com',
            'phone' => '0300-9988776',
            'date_of_birth' => '2003-08-20',
            'address' => 'Model Town, Lahore',
            'previous_institution' => 'GCU',
            'qualification' => 'HSSC Pre-Engineering',
            'total_marks' => 1100,
            'obtained_marks' => 950,
            'inter_total_marks' => 1100,
            'inter_obtained_marks' => 950,
            'inter_percentage' => 86.36,
        ]);

        // Attempt submit without declaration
        $response = $this->actingAs($user)->post(route('profile.builder.submit'), [
            'programme_id' => $programme->id,
            'quota' => 'sports',
            'declaration_accepted' => false,
        ]);

        $response->assertSessionHasErrors('declaration_accepted');

        // Submit with declaration
        $submitResponse = $this->actingAs($user)->post(route('profile.builder.submit'), [
            'programme_id' => $programme->id,
            'quota' => 'sports',
            'declaration_accepted' => true,
        ]);

        $submitResponse->assertRedirect();

        $application = Application::where('student_id', $student->id)->where('programme_id', $programme->id)->first();
        $this->assertNotNull($application);
        $this->assertEquals('sports', $application->quota);
        $this->assertTrue($application->declaration_accepted);
        $this->assertNotNull($application->submitted_at);
    }

    public function test_dashboard_displays_profile_completion_percentage(): void
    {
        $user = User::factory()->create(['role' => 'applicant']);

        $response = $this->actingAs($user)->get(route('dashboard'));
        $response->assertOk();
    }
}
