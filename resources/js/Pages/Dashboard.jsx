import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Dashboard({ tasks }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        due_date: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('tasks.store'), {
            onSuccess: () => reset(),
        });
    };

    const toggleComplete = (task) => {
        router.patch(route('tasks.update', task.id), {
            is_completed: !task.is_completed,
        }, {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Add Task Form */}
                    <div className="mb-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="mb-4 text-lg font-medium">Create a Task</h3>
                            <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="flex-1">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Task Title</label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                </div>
                                <div>
                                    <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date (optional)</label>
                                    <input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {errors.due_date && <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>}
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        Add Task
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="mb-4 text-lg font-medium">Your Tasks</h3>
                            {!tasks || tasks.length === 0 ? (
                                <p className="text-gray-500">No tasks yet. Create one above!</p>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {tasks.map((task) => (
                                        <li key={task.id} className="flex items-center justify-between py-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={task.is_completed}
                                                    onChange={() => toggleComplete(task)}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div className="ml-3">
                                                    <p className={`text-sm font-medium ${task.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                        {task.title}
                                                    </p>
                                                    {task.due_date && (
                                                        <p className={`text-xs ${task.is_completed ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Due: {task.due_date}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
