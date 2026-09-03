<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Document;
use App\Models\Programme;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdmissionsDashboardController extends Controller
{
    /**
     * Display Admissions Officer dashboard with metrics and document review queue.
     */
    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status', 'all');
        $programmeFilter = $request->query('programme_id');
        $search = $request->query('search');

        // Overview metrics
        $metrics = [
            'total_students' => Student::count(),
            'total_applications' => Application::count(),
            'pending_documents' => Document::where('verification_status', Document::STATUS_PENDING)->count(),
            'verified_documents' => Document::where('verification_status', Document::STATUS_VERIFIED)->count(),
            'rejected_documents' => Document::where('verification_status', Document::STATUS_REJECTED)->count(),
            'under_review_apps' => Application::where('status', Application::STATUS_UNDER_REVIEW)->count(),
        ];

        // Document query
        $docQuery = Document::with(['student', 'application.programme', 'verifier']);

        if ($statusFilter && $statusFilter !== 'all') {
            $docQuery->where('verification_status', $statusFilter);
        }

        if ($programmeFilter) {
            $docQuery->whereHas('application', function ($q) use ($programmeFilter) {
                $q->where('programme_id', $programmeFilter);
            });
        }

        if ($search) {
            $docQuery->where(function ($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                  ->orWhere('document_type', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($sq) use ($search) {
                      $sq->where('full_name', 'like', "%{$search}%")
                         ->orWhere('cnic_bform', 'like', "%{$search}%");
                  });
            });
        }

        $documents = $docQuery->orderByRaw("CASE WHEN verification_status = 'pending' THEN 0 ELSE 1 END")
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $programmes = Programme::where('is_active', true)->get(['id', 'code', 'name']);

        return Inertia::render('Admissions/Dashboard', [
            'metrics' => $metrics,
            'documents' => $documents,
            'programmes' => $programmes,
            'filters' => [
                'status' => $statusFilter,
                'programme_id' => $programmeFilter,
                'search' => $search,
            ],
            'status' => session('status'),
            'error' => session('error'),
        ]);
    }
}
