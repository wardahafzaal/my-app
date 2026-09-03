<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleSwitchController extends Controller
{
    /**
     * Switch logged-in user persona for testing and evaluation.
     */
    public function switchRole(Request $request, string $role): RedirectResponse
    {
        $validRoles = [
            User::ROLE_APPLICANT => 'applicant@campus.edu',
            User::ROLE_ADMISSIONS_OFFICER => 'officer@campus.edu',
            User::ROLE_PROGRAMME_COORDINATOR => 'coordinator@campus.edu',
        ];

        if (!array_key_exists($role, $validRoles)) {
            return back()->with('error', 'Invalid role selected.');
        }

        $targetUser = User::where('email', $validRoles[$role])->first();

        if (!$targetUser) {
            // Fallback: update current user's role
            $user = auth()->user();
            $user->role = $role;
            $user->save();
        } else {
            Auth::login($targetUser);
        }

        $roleLabels = [
            User::ROLE_APPLICANT => 'Applicant',
            User::ROLE_ADMISSIONS_OFFICER => 'Admissions Officer',
            User::ROLE_PROGRAMME_COORDINATOR => 'Programme Coordinator',
        ];

        return redirect()->route('dashboard')->with('status', "Switched persona to {$roleLabels[$role]} (" . auth()->user()->email . ").");
    }
}
