<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Document;
use App\Models\MeritCriteria;
use App\Models\Programme;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdmissionModuleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    /**
     * PART 1: Standard Student Profile & Duplicate CNIC prevention.
     */
    public function test_applicant_can_create_student_profile(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_APPLICANT]);

        $response = $this->actingAs($user)->post(route('student.profile.update'), [
            'full_name' => 'Muhammad Ali',
            'cnic_bform' => '35201-1122334-5',
            'email' => 'ali@example.com',
            'phone' => '03001234567',
            'date_of_birth' => '2004-06-15',
            'address' => 'Gulberg, Lahore',
            'previous_institution' => 'Government College University',
            'qualification' => 'FSc Pre-Medical',
            'total_marks' => 1100,
            'obtained_marks' => 950,
            'marks_grade' => 'A+',
        ]);

        $response->assertRedirect(route('student.profile.edit'));
        $this->assertDatabaseHas('students', [
            'user_id' => $user->id,
            'cnic_bform' => '35201-1122334-5',
            'full_name' => 'Muhammad Ali',
        ]);
    }

    public function test_prevent_duplicate_student_profile_with_same_cnic(): void
    {
        $user1 = User::factory()->create(['role' => User::ROLE_APPLICANT]);
        $user2 = User::factory()->create(['role' => User::ROLE_APPLICANT]);

        // Create first student
        Student::create([
            'user_id' => $user1->id,
            'full_name' => 'First Student',
            'cnic_bform' => '35201-9999999-1',
            'email' => 'first@example.com',
            'phone' => '03001111111',
            'date_of_birth' => '2004-01-01',
            'address' => 'Lahore',
            'previous_institution' => 'College A',
            'qualification' => 'FSc',
            'total_marks' => 1100,
            'obtained_marks' => 900,
        ]);

        // Attempt to create second student with exact same CNIC
        $response = $this->actingAs($user2)->post(route('student.profile.update'), [
            'full_name' => 'Second Student',
            'cnic_bform' => '35201-9999999-1',
            'email' => 'second@example.com',
            'phone' => '03002222222',
            'date_of_birth' => '2004-02-02',
            'address' => 'Islamabad',
            'previous_institution' => 'College B',
            'qualification' => 'FSc',
            'total_marks' => 1100,
            'obtained_marks' => 880,
        ]);

        $response->assertSessionHasErrors('cnic_bform');
        $errors = session('errors')->get('cnic_bform');
        $this->assertStringContainsString('A student profile with this CNIC/B-Form number already exists', $errors[0]);
    }

    /**
     * PART 2: University/Programme Applications (One profile, multiple programmes).
     */
    public function test_student_can_apply_to_multiple_programmes(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_APPLICANT]);
        $student = Student::create([
            'user_id' => $user->id,
            'full_name' => 'Test Applicant',
            'cnic_bform' => '35201-4455667-8',
            'email' => $user->email,
            'phone' => '03003333333',
            'date_of_birth' => '2004-03-03',
            'address' => 'Karachi',
            'previous_institution' => 'College C',
            'qualification' => 'ICS',
            'total_marks' => 1100,
            'obtained_marks' => 900,
        ]);

        $prog1 = Programme::create([
            'code' => 'BSCS',
            'name' => 'BS Computer Science',
            'faculty' => 'Computing',
            'capacity' => 50,
        ]);

        $prog2 = Programme::create([
            'code' => 'BSSE',
            'name' => 'BS Software Engineering',
            'faculty' => 'Computing',
            'capacity' => 45,
        ]);

        // Apply to Programme 1
        $res1 = $this->actingAs($user)->post(route('applications.store'), [
            'programme_id' => $prog1->id,
            'university_name' => 'National Campus',
        ]);
        $res1->assertSessionHasNoErrors();

        // Apply to Programme 2
        $res2 = $this->actingAs($user)->post(route('applications.store'), [
            'programme_id' => $prog2->id,
            'university_name' => 'National Campus',
        ]);
        $res2->assertSessionHasNoErrors();

        // Verify both applications exist in database for this student
        $this->assertEquals(2, Application::where('student_id', $student->id)->count());

        // Attempt to apply to Programme 1 AGAIN (should be rejected)
        $resDuplicate = $this->actingAs($user)->post(route('applications.store'), [
            'programme_id' => $prog1->id,
        ]);
        $resDuplicate->assertSessionHasErrors('programme_id');
    }

    /**
     * PART 3: Document Upload (validation of formats) and Verification Status.
     */
    public function test_document_upload_accepts_pdf_jpg_png(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_APPLICANT]);
        $student = Student::create([
            'user_id' => $user->id,
            'full_name' => 'Doc Test',
            'cnic_bform' => '35201-1234567-0',
            'email' => $user->email,
            'phone' => '03001231231',
            'date_of_birth' => '2004-04-04',
            'address' => 'Peshawar',
            'previous_institution' => 'College D',
            'qualification' => 'FSc',
            'total_marks' => 1100,
            'obtained_marks' => 850,
        ]);

        $prog = Programme::create(['code' => 'BBA', 'name' => 'BBA', 'faculty' => 'Management', 'capacity' => 40]);
        $app = Application::create([
            'application_number' => 'APP-TEST-001',
            'student_id' => $student->id,
            'programme_id' => $prog->id,
            'application_date' => Carbon::now(),
        ]);

        // Upload valid PDF
        $pdfFile = UploadedFile::fake()->create('cnic_scan.pdf', 500, 'application/pdf');
        $resPdf = $this->actingAs($user)->post(route('documents.store', $app->id), [
            'document' => $pdfFile,
            'document_type' => 'CNIC / B-Form Copy',
        ]);
        $resPdf->assertSessionHasNoErrors();
        $this->assertDatabaseHas('documents', [
            'application_id' => $app->id,
            'document_type' => 'CNIC / B-Form Copy',
            'verification_status' => Document::STATUS_PENDING,
        ]);

        // Upload valid PNG
        $pngFile = UploadedFile::fake()->create('certificate.png', 500, 'image/png');
        $resPng = $this->actingAs($user)->post(route('documents.store', $app->id), [
            'document' => $pngFile,
            'document_type' => 'Matric Certificate',
        ]);
        $resPng->assertSessionHasNoErrors();

        // Reject invalid file type (e.g., .txt or .zip)
        $txtFile = UploadedFile::fake()->create('resume.txt', 100, 'text/plain');
        $resTxt = $this->actingAs($user)->post(route('documents.store', $app->id), [
            'document' => $txtFile,
            'document_type' => 'Other',
        ]);
        $resTxt->assertSessionHasErrors('document');
    }

    public function test_admissions_officer_can_verify_and_reject_documents(): void
    {
        $officer = User::factory()->create(['role' => User::ROLE_ADMISSIONS_OFFICER]);
        $applicant = User::factory()->create(['role' => User::ROLE_APPLICANT]);
        $student = Student::create([
            'user_id' => $applicant->id,
            'full_name' => 'Verify Test',
            'cnic_bform' => '35201-9988776-5',
            'email' => $applicant->email,
            'phone' => '03009988776',
            'date_of_birth' => '2004-05-05',
            'address' => 'Quetta',
            'previous_institution' => 'College E',
            'qualification' => 'FSc',
            'total_marks' => 1100,
            'obtained_marks' => 890,
        ]);
        $prog = Programme::create(['code' => 'BSEE', 'name' => 'Electrical Engineering', 'faculty' => 'Engineering', 'capacity' => 30]);
        $app = Application::create([
            'application_number' => 'APP-TEST-002',
            'student_id' => $student->id,
            'programme_id' => $prog->id,
            'application_date' => Carbon::now(),
        ]);

        $doc = Document::create([
            'application_id' => $app->id,
            'student_id' => $student->id,
            'document_type' => 'Matric Marksheet',
            'file_name' => 'marksheet.jpg',
            'file_path' => 'admission_documents/test.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 100000,
            'verification_status' => Document::STATUS_PENDING,
        ]);

        // Admissions officer verifies document
        $resVerify = $this->actingAs($officer)->patch(route('documents.verify', $doc->id), [
            'verification_status' => 'verified',
        ]);
        $resVerify->assertSessionHasNoErrors();
        $this->assertDatabaseHas('documents', [
            'id' => $doc->id,
            'verification_status' => 'verified',
            'verified_by' => $officer->id,
        ]);

        // Admissions officer rejects document with reason
        $resReject = $this->actingAs($officer)->patch(route('documents.verify', $doc->id), [
            'verification_status' => 'rejected',
            'rejection_reason' => 'Marksheet image is blurry. Please upload a clear scan.',
        ]);
        $resReject->assertSessionHasNoErrors();
        $this->assertDatabaseHas('documents', [
            'id' => $doc->id,
            'verification_status' => 'rejected',
            'rejection_reason' => 'Marksheet image is blurry. Please upload a clear scan.',
        ]);
    }

    /**
     * PART 4: Automated Merit List Generation with Tie-Breaker logic.
     */
    public function test_merit_list_tiebreaker_ranks_earlier_applicant_higher(): void
    {
        $coordinator = User::factory()->create(['role' => User::ROLE_PROGRAMME_COORDINATOR]);
        $prog = Programme::create(['code' => 'BSCS', 'name' => 'BS Computer Science', 'faculty' => 'Computing', 'capacity' => 10]);

        // Student A: 990/1100 = 90.00%, submitted earlier (Aug 01)
        $studentA = Student::create([
            'full_name' => 'Candidate A',
            'cnic_bform' => '35201-0000001-1',
            'email' => 'a@test.com',
            'phone' => '03001',
            'date_of_birth' => '2004-01-01',
            'address' => 'Lahore',
            'previous_institution' => 'Inst A',
            'qualification' => 'FSc',
            'total_marks' => 1100,
            'obtained_marks' => 990,
        ]);
        $appA = Application::create([
            'application_number' => 'APP-A',
            'student_id' => $studentA->id,
            'programme_id' => $prog->id,
            'application_date' => Carbon::parse('2026-08-01 10:00:00'),
            'status' => 'submitted',
        ]);

        // Student B: 990/1100 = 90.00% (IDENTICAL SCORE), submitted later (Aug 05)
        $studentB = Student::create([
            'full_name' => 'Candidate B',
            'cnic_bform' => '35201-0000002-2',
            'email' => 'b@test.com',
            'phone' => '03002',
            'date_of_birth' => '2004-02-02',
            'address' => 'Islamabad',
            'previous_institution' => 'Inst B',
            'qualification' => 'FSc',
            'total_marks' => 1100,
            'obtained_marks' => 990,
        ]);
        $appB = Application::create([
            'application_number' => 'APP-B',
            'student_id' => $studentB->id,
            'programme_id' => $prog->id,
            'application_date' => Carbon::parse('2026-08-05 14:00:00'),
            'status' => 'submitted',
        ]);

        // Student C: 880/1100 = 80.00%
        $studentC = Student::create([
            'full_name' => 'Candidate C',
            'cnic_bform' => '35201-0000003-3',
            'email' => 'c@test.com',
            'phone' => '03003',
            'date_of_birth' => '2004-03-03',
            'address' => 'Karachi',
            'previous_institution' => 'Inst C',
            'qualification' => 'FSc',
            'total_marks' => 1100,
            'obtained_marks' => 880,
        ]);
        $appC = Application::create([
            'application_number' => 'APP-C',
            'student_id' => $studentC->id,
            'programme_id' => $prog->id,
            'application_date' => Carbon::parse('2026-07-20 09:00:00'),
            'status' => 'submitted',
        ]);

        // Generate merit list
        $response = $this->actingAs($coordinator)->post(route('merit-list.generate'), [
            'programme_id' => $prog->id,
            'academic_weight_pct' => 100.00,
            'entry_test_weight_pct' => 0.00,
            'minimum_eligibility_pct' => 50.00,
            'tiebreaker_rule' => 'earlier_submission',
        ]);

        $response->assertRedirect(route('merit-list.index', ['programme_id' => $prog->id]));

        // Refresh models
        $appA->refresh();
        $appB->refresh();
        $appC->refresh();

        // Candidate A and B both have 90.00% merit score
        $this->assertEquals(90.00, (float) $appA->merit_score);
        $this->assertEquals(90.00, (float) $appB->merit_score);
        $this->assertEquals(80.00, (float) $appC->merit_score);

        // Due to tiebreaker (earlier application date), Candidate A MUST be Rank 1, Candidate B MUST be Rank 2
        $this->assertEquals(1, $appA->merit_rank, 'Candidate A submitted earlier and should be Rank 1');
        $this->assertEquals(2, $appB->merit_rank, 'Candidate B submitted later and should be Rank 2');
        $this->assertEquals(3, $appC->merit_rank, 'Candidate C has lower score and should be Rank 3');
    }
}
