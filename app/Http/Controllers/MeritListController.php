<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\MeritCriteria;
use App\Models\Programme;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MeritListController extends Controller
{
    /**
     * Display the sortable Merit List for Admissions Officers and Programme Coordinators.
     */
    public function index(Request $request): Response
    {
        $programmes = Programme::where('is_active', true)->get();
        $selectedProgrammeId = $request->query('programme_id', optional($programmes->first())->id);
        $selectedProgramme = Programme::find($selectedProgrammeId);

        // Fetch or create criteria for this programme
        $criteria = null;
        if ($selectedProgramme) {
            $criteria = MeritCriteria::firstOrCreate(
                ['programme_id' => $selectedProgramme->id],
                [
                    'criteria_name' => "Standard Merit - {$selectedProgramme->code}",
                    'academic_weight_pct' => 100.00,
                    'entry_test_weight_pct' => 0.00,
                    'minimum_eligibility_pct' => 50.00,
                    'tiebreaker_rule' => 'earlier_submission',
                    'is_active' => true,
                ]
            );
        }

        // Fetch applicants for this programme
        $applications = [];
        $rankedCount = 0;
        $eligibleCount = 0;

        if ($selectedProgramme) {
            $rawApps = Application::with('student')
                ->where('programme_id', $selectedProgramme->id)
                ->join('students', 'applications.student_id', '=', 'students.id')
                ->select('applications.*')
                ->orderByDesc('applications.merit_score')
                ->orderBy('applications.application_date', 'asc')
                ->orderBy('applications.id', 'asc')
                ->get();

            // Compute ranking and check for tied scores to highlight tiebreak
            $scoreGroups = [];
            foreach ($rawApps as $app) {
                $scoreKey = (string) $app->merit_score;
                $scoreGroups[$scoreKey][] = $app->id;
            }

            $rank = 1;
            foreach ($rawApps as $app) {
                $scoreKey = (string) $app->merit_score;
                $isTied = count($scoreGroups[$scoreKey] ?? []) > 1;

                $appData = [
                    'id' => $app->id,
                    'application_number' => $app->application_number,
                    'student_id' => $app->student_id,
                    'student_name' => $app->student->full_name,
                    'cnic_bform' => $app->student->cnic_bform,
                    'email' => $app->student->email,
                    'phone' => $app->student->phone,
                    'date_of_birth' => $app->student->date_of_birth ? $app->student->date_of_birth->format('Y-m-d') : null,
                    'qualification' => $app->student->qualification,
                    'previous_institution' => $app->student->previous_institution,
                    'obtained_marks' => (float) $app->student->obtained_marks,
                    'total_marks' => (float) $app->student->total_marks,
                    'academic_percentage' => $app->student->percentage,
                    'merit_score' => (float) $app->merit_score,
                    'application_date' => $app->application_date ? $app->application_date->format('Y-m-d H:i') : null,
                    'application_date_raw' => $app->application_date ? $app->application_date->timestamp : 0,
                    'status' => $app->status,
                    'rank' => $rank,
                    'is_tied' => $isTied,
                    'tie_note' => $isTied 
                        ? "Tied at {$app->merit_score}%. Ranked by submission: " . ($app->application_date ? $app->application_date->format('M d, H:i') : 'N/A')
                        : null,
                    'is_within_capacity' => $rank <= $selectedProgramme->capacity,
                    'is_eligible' => $criteria ? ($app->merit_score >= $criteria->minimum_eligibility_pct) : true,
                ];

                if ($appData['is_eligible']) {
                    $eligibleCount++;
                }

                $applications[] = $appData;
                $rank++;
            }
            $rankedCount = count($applications);
        }

        return Inertia::render('MeritList/Index', [
            'programmes' => $programmes,
            'selectedProgramme' => $selectedProgramme,
            'criteria' => $criteria,
            'applications' => $applications,
            'stats' => [
                'total_applicants' => $rankedCount,
                'eligible_applicants' => $eligibleCount,
                'programme_capacity' => $selectedProgramme ? $selectedProgramme->capacity : 0,
                'top_merit' => !empty($applications) ? $applications[0]['merit_score'] : 0,
                'cutoff_merit' => ($selectedProgramme && !empty($applications))
                    ? ($applications[min($selectedProgramme->capacity - 1, count($applications) - 1)]['merit_score'] ?? 0)
                    : 0,
            ],
            'canManageDecisions' => auth()->user()->isProgrammeCoordinator() || auth()->user()->isAdmissionsOfficer(),
            'status' => session('status'),
            'error' => session('error'),
        ]);
    }

    /**
     * Recalculate merit scores and regenerate ranking using configured criteria and tiebreaker.
     */
    public function generate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'programme_id' => ['required', 'exists:programmes,id'],
            'academic_weight_pct' => ['required', 'numeric', 'min:0', 'max:100'],
            'entry_test_weight_pct' => ['required', 'numeric', 'min:0', 'max:100'],
            'minimum_eligibility_pct' => ['required', 'numeric', 'min:0', 'max:100'],
            'tiebreaker_rule' => ['required', 'string'],
        ]);

        $programme = Programme::findOrFail($validated['programme_id']);

        // Update or create merit criteria
        $criteria = MeritCriteria::updateOrCreate(
            ['programme_id' => $programme->id],
            $validated
        );

        // Fetch applications with student academic profile
        $applications = Application::with('student')
            ->where('programme_id', $programme->id)
            ->get();

        // 1. Calculate each applicant's merit score based on criteria
        foreach ($applications as $app) {
            $academicPct = $app->student ? $app->student->percentage : 0;
            $score = $criteria->calculateScore($academicPct, 0); // 0 test score unless entry test given
            $app->merit_score = $score;
            $app->save();
        }

        // 2. Automated ranking with tiebreaker:
        // Priority 1: merit_score DESC
        // Priority 2: application_date ASC (earlier application date wins)
        // Priority 3: student date_of_birth ASC
        $sortedApps = Application::with('student')
            ->where('programme_id', $programme->id)
            ->join('students', 'applications.student_id', '=', 'students.id')
            ->select('applications.*')
            ->orderByDesc('applications.merit_score')
            ->orderBy('applications.application_date', 'asc')
            ->orderBy('students.date_of_birth', 'asc')
            ->orderBy('applications.id', 'asc')
            ->get();

        $rank = 1;
        foreach ($sortedApps as $app) {
            $app->merit_rank = $rank;
            $app->save();
            $rank++;
        }

        return redirect()->route('merit-list.index', ['programme_id' => $programme->id])
            ->with('status', "Merit list successfully generated for {$programme->name}! {$sortedApps->count()} applicants ranked according to academic weight ({$criteria->academic_weight_pct}%) with submission date tiebreaker.");
    }

    /**
     * Update application status from Merit List (Accept / Reject / Under Review).
     */
    public function updateApplicantStatus(Request $request, int $applicationId): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:accepted,rejected,under review,submitted'],
        ]);

        $app = Application::findOrFail($applicationId);
        $app->update(['status' => $validated['status']]);

        return back()->with('status', "Applicant {$app->application_number} status updated to '{$validated['status']}'.");
    }

    /**
     * Export ranked merit list to CSV.
     */
    public function exportCsv(int $programmeId): StreamedResponse
    {
        $programme = Programme::findOrFail($programmeId);

        $applications = Application::with('student')
            ->where('programme_id', $programme->id)
            ->orderByDesc('merit_score')
            ->orderBy('application_date', 'asc')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"merit_list_{$programme->code}_" . date('Ymd') . ".csv\"",
        ];

        $callback = function () use ($applications, $programme) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Rank',
                'Application No',
                'Candidate Name',
                'CNIC / B-Form',
                'Qualification',
                'Obtained Marks',
                'Total Marks',
                'Academic %',
                'Merit Score %',
                'Application Date (Tiebreaker)',
                'Admission Status',
            ]);

            $rank = 1;
            foreach ($applications as $app) {
                fputcsv($handle, [
                    $rank,
                    $app->application_number,
                    $app->student ? $app->student->full_name : 'N/A',
                    $app->student ? $app->student->cnic_bform : 'N/A',
                    $app->student ? $app->student->qualification : 'N/A',
                    $app->student ? $app->student->obtained_marks : '0',
                    $app->student ? $app->student->total_marks : '0',
                    $app->student ? $app->student->percentage . '%' : '0%',
                    $app->merit_score . '%',
                    $app->application_date ? $app->application_date->format('Y-m-d H:i:s') : 'N/A',
                    ucfirst($app->status),
                ]);
                $rank++;
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
