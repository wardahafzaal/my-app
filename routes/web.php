<?php

use App\Http\Controllers\AdmissionsDashboardController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\MeritListController;
use App\Http\Controllers\ProfileBuilderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleSwitchController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\TaskController;
use App\Models\Application;
use App\Models\Document;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Application as LaravelApplication;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => LaravelApplication::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Smart Dashboard
    Route::get('/dashboard', function () {
        $user = auth()->user();

        $stats = [
            'role' => $user->role,
            'has_student_profile' => (bool) $user->student,
            'profile_completion' => $user->student ? $user->student->completion_percentage : 0,
            'my_applications_count' => $user->isApplicant() ? Application::where('student_id', optional($user->student)->id)->count() : 0,
            'total_applications' => Application::count(),
            'pending_verifications' => Document::where('verification_status', Document::STATUS_PENDING)->count(),
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'student' => $user->student,
            'tasks' => $user->tasks()->orderBy('due_date', 'asc')->get(),
        ]);
    })->name('dashboard');

    // Role Switcher for quick testing/evaluation
    Route::post('/dev/switch-role/{role}', [RoleSwitchController::class, 'switchRole'])->name('dev.switch-role');

    // PART 1: Standard Student Profile
    Route::get('/student/profile', [StudentProfileController::class, 'edit'])->name('student.profile.edit');
    Route::post('/student/profile', [StudentProfileController::class, 'update'])->name('student.profile.update');

    // 5-Step Profile Builder Wizard
    Route::get('/profile-builder', [ProfileBuilderController::class, 'index'])->name('profile.builder');
    Route::post('/profile-builder/save-step', [ProfileBuilderController::class, 'saveStep'])->name('profile.builder.save-step');
    Route::post('/profile-builder/submit', [ProfileBuilderController::class, 'submit'])->name('profile.builder.submit');

    // Sidebar navigation convenience aliases
    Route::get('/universities', function () {
        return redirect()->route('applications.create');
    })->name('universities.index');

    Route::get('/documents', function () {
        return redirect()->route('applications.index');
    })->name('documents.index');

    // PART 2: University / Programme Applications
    Route::get('/applications', [ApplicationController::class, 'index'])->name('applications.index');
    Route::get('/applications/create', [ApplicationController::class, 'create'])->name('applications.create');
    Route::post('/applications', [ApplicationController::class, 'store'])->name('applications.store');
    Route::get('/applications/{id}', [ApplicationController::class, 'show'])->name('applications.show');
    Route::patch('/applications/{id}/status', [ApplicationController::class, 'updateStatus'])
        ->middleware('role:admissions_officer,programme_coordinator')
        ->name('applications.updateStatus');
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy'])->name('applications.destroy');

    // PART 3: Document Upload & Verification
    Route::post('/applications/{id}/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::patch('/documents/{id}/verify', [DocumentController::class, 'verify'])
        ->middleware('role:admissions_officer')
        ->name('documents.verify');
    Route::get('/documents/{id}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    // Admissions Officer Dashboard View
    Route::get('/admissions/dashboard', [AdmissionsDashboardController::class, 'index'])
        ->middleware('role:admissions_officer,programme_coordinator')
        ->name('admissions.dashboard');

    // PART 4: Automated Merit List Generation
    Route::get('/merit-list', [MeritListController::class, 'index'])
        ->middleware('role:programme_coordinator,admissions_officer')
        ->name('merit-list.index');
    Route::post('/merit-list/generate', [MeritListController::class, 'generate'])
        ->middleware('role:programme_coordinator,admissions_officer')
        ->name('merit-list.generate');
    Route::patch('/merit-list/applicants/{id}/status', [MeritListController::class, 'updateApplicantStatus'])
        ->middleware('role:programme_coordinator,admissions_officer')
        ->name('merit-list.applicant.status');
    Route::get('/merit-list/{programmeId}/export', [MeritListController::class, 'exportCsv'])
        ->middleware('role:programme_coordinator,admissions_officer')
        ->name('merit-list.export');

    // Tasks & Profile
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::patch('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
