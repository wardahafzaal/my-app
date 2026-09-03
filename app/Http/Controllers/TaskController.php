<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'due_date' => 'nullable|date',
        ]);

        $request->user()->tasks()->create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Task $task)
    {
        if ($task->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'is_completed' => 'required|boolean',
        ]);

        $task->update($validated);

        return redirect()->back();
    }
}
