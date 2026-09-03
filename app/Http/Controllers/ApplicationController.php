<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Programme;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    /**
     * Display a listing of applications.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $programmeFilter = $request->query('programme_id');
        $statusFilter = $request->query('status');
        $search = $request->query('search');

        $query = Application::with(['student', 'programme', 'documents']);

        if ($user->isApplicant()) {
            $student = $user->student;
            if ($student) {
                $query->where('student_id', $student->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        } else {
            // Admissions Officer or Programme Coordinator can view all
            if ($programmeFilter) {
                $query->where('programme_id', $programmeFilter);
            }
            if ($statusFilter) {
                $query->where('status', $statusFilter);
            }
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('application_number', 'like', "%{$search}%")
                        ->orWhereHas('student', function ($sq) use ($search) {
                            $sq->where('full_name', 'like', "%{$search}%")
                               ->orWhere('cnic_bform', 'like', "%{$search}%");
                        });
                });
            }
        }

        $applications = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        $programmes = Programme::where('is_active', true)->get(['id', 'code', 'name', 'faculty']);

        return Inertia::render('Applications/Index', [
            'applications' => $applications,
            'programmes' => $programmes,
            'filters' => [
                'programme_id' => $programmeFilter,
                'status' => $statusFilter,
                'search' => $search,
            ],
            'isApplicant' => $user->isApplicant(),
            'hasProfile' => (bool) $user->student,
        ]);
    }

    /**
     * Show the form for creating a new application.
     */
    public function create(): Response|RedirectResponse
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return redirect()->route('student.profile.edit')
                ->with('status', 'Please complete your standard student profile before applying for programmes.');
        }

        $appliedProgrammeIds = Application::where('student_id', $student->id)
            ->pluck('programme_id')
            ->toArray();

        $programmes = Programme::where('is_active', true)->get();

        return Inertia::render('Applications/Create', [
            'student' => $student,
            'programmes' => $programmes,
            'appliedProgrammeIds' => $appliedProgrammeIds,
        ]);
    }

    /**
     * Store a newly created application in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return redirect()->route('student.profile.edit')
                ->with('error', 'Please complete your student profile first.');
        }

        $request->validate([
            'programme_id' => ['required', 'exists:programmes,id'],
            'university_name' => ['nullable', 'string', 'max:255'],
        ]);

        // Prevent duplicate application for the same programme
        $existing = Application::where('student_id', $student->id)
            ->where('programme_id', $request->programme_id)
            ->first();

        if ($existing) {
            return back()->withErrors([
                'programme_id' => 'You have already submitted an application for this programme.',
            ]);
        }

        $programme = Programme::findOrFail($request->programme_id);

        $application = Application::create([
            'application_number' => Application::generateApplicationNumber(),
            'student_id' => $student->id,
            'programme_id' => $programme->id,
            'university_name' => $request->university_name ?: 'National Campus',
            'application_date' => Carbon::now(),
            'status' => Application::STATUS_SUBMITTED,
            'merit_score' => $student->percentage,
        ]);

        return redirect()->route('applications.show', $application->id)
            ->with('status', "Application {$application->application_number} submitted successfully! Please upload required verification documents below.");
    }

    /**
     * Display the specified application.
     */
    public function show(int $id): Response|RedirectResponse
    {
        $user = auth()->user();
        $application = Application::with([
            'student.user',
            'programme',
            'documents.verifier',
        ])->findOrFail($id);

        if ($user->isApplicant() && $application->student_id !== optional($user->student)->id) {
            abort(403, 'Unauthorized access to this application.');
        }

        return Inertia::render('Applications/Show', [
            'application' => $application,
            'canManageStatus' => !$user->isApplicant(),
            'canVerifyDocuments' => $user->isAdmissionsOfficer(),
            'currentUser' => [
                'id' => $user->id,
                'role' => $user->role,
                'name' => $user->name,
            ],
            'status' => session('status'),
            'error' => session('error'),
        ]);
    }

    /**
     * Update application status (Admissions Officer & Coordinator).
     */
    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        if ($user->isApplicant()) {
            abort(403, 'Applicants cannot change application status.');
        }

        $validated = $request->validate([
            'status' => ['required', 'in:submitted,under review,accepted,rejected'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $application = Application::findOrFail($id);
        $application->update($validated);

        return back()->with('status', "Application status updated to '{$validated['status']}'.");
    }

    /**
     * Remove the specified application (withdraw).
     */
    public function destroy(int $id): RedirectResponse
    {
        $user = auth()->user();
        $application = Application::findOrFail($id);

        if ($user->isApplicant() && $application->student_id !== optional($user->student)->id) {
            abort(403, 'Unauthorized action.');
        }

        $application->delete();

        return redirect()->route('applications.index')
            ->with('status', 'Application withdrawn successfully.');
    }
}
