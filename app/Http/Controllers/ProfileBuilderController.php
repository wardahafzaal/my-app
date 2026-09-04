<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Programme;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileBuilderController extends Controller
{
    /**
     * Show the 5-step Profile & Application Builder wizard.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $student = $user->student;

        // Prospective Application ID for Step 5
        $prospectiveAppId = Application::generateApplicationNumber();

        $programmes = Programme::where('is_active', true)->get(['id', 'code', 'name', 'faculty', 'capacity', 'min_eligibility_percentage']);
        
        $appliedProgrammeIds = $student 
            ? Application::where('student_id', $student->id)->pluck('programme_id')->toArray()
            : [];

        // Province & District data for Step 1 & 2 dropdowns
        $regions = [
            'Punjab' => ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Sargodha', 'Bahawalpur', 'Sahiwal', 'Kasur', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Gujrat'],
            'Sindh' => ['Karachi Central', 'Karachi East', 'Karachi South', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas', 'Nawabshah (Shaheed Benazirabad)', 'Thatta', 'Badin'],
            'Khyber Pakhtunkhwa' => ['Peshawar', 'Abbottabad', 'Mardan', 'Swat', 'Kohat', 'Dera Ismail Khan', 'Bannu', 'Haripur', 'Mansehra', 'Charsadda'],
            'Balochistan' => ['Quetta', 'Gwadar', 'Turbat (Kech)', 'Khuzdar', 'Sibi', 'Zhob', 'Loralai', 'Hub', 'Jafarabad'],
            'Islamabad Capital Territory' => ['Islamabad'],
            'Azad Jammu & Kashmir' => ['Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli', 'Bhimber', 'Bagh'],
            'Gilgit-Baltistan' => ['Gilgit', 'Skardu', 'Hunza', 'Diamer', 'Ghizer', 'Astore'],
        ];

        $quotas = [
            [
                'id' => 'general_merit',
                'title' => 'General Merit',
                'description' => 'Open competition based purely on matriculation and intermediate academic scores.',
                'requirement' => 'Standard academic records and verification.',
                'badge' => 'Open Merit',
            ],
            [
                'id' => 'disabled',
                'title' => 'Disabled / Special Person',
                'description' => 'Reserved seat for differently-abled candidates as per government quota rules.',
                'requirement' => 'Requires disability verification certificate issued by Provincial/Federal Council.',
                'badge' => 'Special Quota',
            ],
            [
                'id' => 'sports',
                'title' => 'Sports Quota',
                'description' => 'Dedicated quota for candidates demonstrating outstanding achievements in sports.',
                'requirement' => 'Requires sports board / national / provincial association participation certificate.',
                'badge' => 'Sports Board',
            ],
            [
                'id' => 'hafiz_minority',
                'title' => 'Hafiz-e-Quran / Religious Minority',
                'description' => 'Additional consideration for certified Huffaz-e-Quran or religious minority applicants.',
                'requirement' => 'Requires Sanad from Wafaq-ul-Madaris / accredited board or minority community certificate.',
                'badge' => 'Special Category',
            ],
            [
                'id' => 'overseas_other',
                'title' => 'Overseas / Other Quota',
                'description' => 'Quota for overseas Pakistani children and foreign national applicants.',
                'requirement' => 'Requires valid passport, foreign resident permit/visa, or embassy verification.',
                'badge' => 'International',
            ],
        ];

        return Inertia::render('Student/ProfileBuilder', [
            'student' => $student,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'programmes' => $programmes,
            'appliedProgrammeIds' => $appliedProgrammeIds,
            'prospectiveAppId' => $prospectiveAppId,
            'regions' => $regions,
            'quotas' => $quotas,
            'completionPercentage' => $student ? $student->completion_percentage : 0,
            'status' => session('status'),
        ]);
    }

    /**
     * Save progress on an individual step without full submission.
     */
    public function saveStep(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $step = $request->input('step', 1);

        $data = $request->except(['step', '_token']);

        // Handle auto-calculation of percentages
        if (isset($data['matric_total_marks']) && isset($data['matric_obtained_marks'])) {
            $mTot = (float) $data['matric_total_marks'];
            $mObt = (float) $data['matric_obtained_marks'];
            $data['matric_percentage'] = $mTot > 0 ? round(($mObt / $mTot) * 100, 2) : 0;
        }

        if (isset($data['inter_total_marks']) && isset($data['inter_obtained_marks'])) {
            $iTot = (float) $data['inter_total_marks'];
            $iObt = (float) $data['inter_obtained_marks'];
            $data['inter_percentage'] = $iTot > 0 ? round(($iObt / $iTot) * 100, 2) : 0;

            // Backward compatibility syncing with existing system
            $data['total_marks'] = $iTot;
            $data['obtained_marks'] = $iObt;
            $data['marks_grade'] = sprintf('%.2f%%', $data['inter_percentage']);
            if (!empty($data['inter_group'])) {
                $data['qualification'] = 'HSSC ' . $data['inter_group'];
            }
        }

        $data['user_id'] = $user->id;

        // Ensure cnic_bform uniqueness if provided
        if (!empty($data['cnic_bform'])) {
            $existing = Student::where('cnic_bform', $data['cnic_bform'])
                ->where('user_id', '!=', $user->id)
                ->first();
            if ($existing) {
                return back()->withErrors(['cnic_bform' => 'A profile with this CNIC/B-Form already exists.']);
            }
        }

        if ($user->student) {
            $user->student->update($data);
        } else {
            // Provide defaults for any required DB columns
            $data['full_name'] = $data['full_name'] ?? $user->name;
            $data['email'] = $data['email'] ?? $user->email;
            $data['phone'] = $data['phone'] ?? '0300-0000000';
            $data['cnic_bform'] = $data['cnic_bform'] ?? '00000-0000000-0';
            $data['date_of_birth'] = $data['date_of_birth'] ?? '2000-01-01';
            $data['address'] = $data['address'] ?? 'Not specified';
            $data['previous_institution'] = $data['previous_institution'] ?? ($data['inter_board'] ?? 'BISE');
            $data['qualification'] = $data['qualification'] ?? 'HSSC';
            $data['total_marks'] = $data['total_marks'] ?? 1100;
            $data['obtained_marks'] = $data['obtained_marks'] ?? 0;

            Student::create($data);
        }

        return back()->with('status', "Step {$step} progress saved successfully!");
    }

    /**
     * Final submission of Application via Step 5.
     */
    public function submit(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $student = $user->student;

        $request->validate([
            'declaration_accepted' => ['required', 'accepted'],
            'programme_id' => ['required', 'exists:programmes,id'],
            'quota' => ['required', 'string'],
        ], [
            'declaration_accepted.accepted' => 'You must accept the declaration to submit your application.',
            'programme_id.required' => 'Please select an academic programme to apply for.',
        ]);

        if (!$student) {
            return back()->withErrors(['error' => 'Please complete your student profile steps first.']);
        }

        // Check if already applied to this programme
        $existing = Application::where('student_id', $student->id)
            ->where('programme_id', $request->programme_id)
            ->first();

        if ($existing) {
            return back()->withErrors(['programme_id' => 'You have already submitted an application for this programme.']);
        }

        $appNumber = $request->input('prospective_app_id') ?: Application::generateApplicationNumber();

        $application = Application::create([
            'application_number' => $appNumber,
            'student_id' => $student->id,
            'programme_id' => $request->programme_id,
            'university_name' => $request->input('university_name', 'National Campus'),
            'application_date' => Carbon::now(),
            'status' => Application::STATUS_SUBMITTED,
            'quota' => $request->quota,
            'declaration_accepted' => true,
            'submitted_at' => Carbon::now(),
            'merit_score' => $student->inter_percentage ?: $student->percentage,
        ]);

        return redirect()->route('applications.show', $application->id)
            ->with('status', "Application {$application->application_number} successfully submitted under {$application->quota} quota! You can now verify and upload your required documents.");
    }
}
