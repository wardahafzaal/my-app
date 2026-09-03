<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentProfileRequest;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StudentProfileController extends Controller
{
    /**
     * Display the student profile form.
     */
    public function edit(): Response
    {
        $user = auth()->user();
        $student = $user->student;

        return Inertia::render('Student/Profile', [
            'student' => $student,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'status' => session('status'),
        ]);
    }

    /**
     * Create or update the standard student profile.
     */
    public function update(StudentProfileRequest $request): RedirectResponse
    {
        $user = auth()->user();
        $data = $request->validated();

        // Calculate marks_grade if not provided
        $total = (float) $data['total_marks'];
        $obtained = (float) $data['obtained_marks'];
        $pct = $total > 0 ? round(($obtained / $total) * 100, 2) : 0;

        if (empty($data['marks_grade'])) {
            $data['marks_grade'] = sprintf('%.2f%%', $pct);
        }

        $data['user_id'] = $user->id;

        if ($user->student) {
            $user->student->update($data);
            $message = 'Student profile updated successfully!';
        } else {
            Student::create($data);
            $message = 'Standard student profile created successfully!';
        }

        return redirect()->route('student.profile.edit')->with('status', $message);
    }
}
