<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Document;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentController extends Controller
{
    /**
     * Store an uploaded document linked to an application.
     */
    public function store(Request $request, int $applicationId): RedirectResponse
    {
        $user = $request->user();
        $application = Application::findOrFail($applicationId);

        // Security check: only application owner or admissions officer
        if ($user->isApplicant() && $application->student_id !== optional($user->student)->id) {
            abort(403, 'Unauthorized to upload documents for this application.');
        }

        $request->validate([
            'document' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:5120', // 5MB limit
            ],
            'document_type' => ['required', 'string', 'max:100'],
        ], [
            'document.required' => 'Please select a document file to upload.',
            'document.mimes' => 'Unsupported file format! Only PDF, JPG, and PNG files are accepted.',
            'document.max' => 'The document size must not exceed 5 MB.',
        ]);

        $file = $request->file('document');
        $extension = strtolower($file->getClientOriginalExtension());
        $safeExtensions = ['pdf', 'jpg', 'jpeg', 'png'];

        if (!in_array($extension, $safeExtensions)) {
            return back()->withErrors([
                'document' => 'Unsupported file format! Only PDF, JPG, and PNG files are accepted.',
            ]);
        }

        $originalName = $file->getClientOriginalName();
        $path = $file->store('admission_documents', 'public');

        Document::create([
            'application_id' => $application->id,
            'student_id' => $application->student_id,
            'document_type' => $request->document_type,
            'file_name' => $originalName,
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType() ?: ('image/' . $extension),
            'file_size' => $file->getSize(),
            'verification_status' => Document::STATUS_PENDING,
        ]);

        return back()->with('status', "Document '{$originalName}' uploaded successfully for verification.");
    }

    /**
     * Update verification status of a document (Admissions Officer only).
     */
    public function verify(Request $request, int $documentId): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isAdmissionsOfficer()) {
            abort(403, 'Only Admissions Officers can verify or reject application documents.');
        }

        $validated = $request->validate([
            'verification_status' => ['required', 'in:pending,verified,rejected'],
            'rejection_reason' => ['nullable', 'string', 'max:500'],
        ]);

        $document = Document::findOrFail($documentId);

        $document->update([
            'verification_status' => $validated['verification_status'],
            'rejection_reason' => $validated['verification_status'] === 'rejected'
                ? ($validated['rejection_reason'] ?: 'Document does not meet admission criteria or is illegible.')
                : null,
            'verified_by' => $user->id,
            'verified_at' => Carbon::now(),
        ]);

        $statusLabel = ucfirst($validated['verification_status']);
        return back()->with('status', "Document '{$document->file_name}' marked as {$statusLabel}.");
    }

    /**
     * Download or view document file.
     */
    public function download(int $id): BinaryFileResponse|RedirectResponse
    {
        $document = Document::findOrFail($id);
        $user = auth()->user();

        if ($user->isApplicant() && $document->student_id !== optional($user->student)->id) {
            abort(403, 'Unauthorized access.');
        }

        if (!Storage::disk('public')->exists($document->file_path)) {
            return back()->with('error', 'Document file could not be found on storage.');
        }

        return response()->file(Storage::disk('public')->path($document->file_path));
    }

    /**
     * Remove a document (only if pending).
     */
    public function destroy(int $id): RedirectResponse
    {
        $user = auth()->user();
        $document = Document::findOrFail($id);

        if ($user->isApplicant() && $document->student_id !== optional($user->student)->id) {
            abort(403, 'Unauthorized action.');
        }

        if ($document->verification_status === Document::STATUS_VERIFIED && $user->isApplicant()) {
            return back()->with('error', 'Verified documents cannot be deleted.');
        }

        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return back()->with('status', 'Document removed successfully.');
    }
}
