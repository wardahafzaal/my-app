import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ stats, student, tasks }) {
    const { auth } = usePage().props;
    const user = auth.user;

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
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Welcome back, {user?.name}!
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Campus Admission Management System • Fall 2026 Cycle
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Admission Module Quick-Action Cards tailored by role */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                        Student Admission Management Module
                    </h3>

                    {user?.role === 'applicant' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Card 1: Student Profile */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors duration-200">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                                            👤
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                            stats?.has_student_profile
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                                        }`}>
                                            {stats?.has_student_profile ? 'Profile Verified' : 'Incomplete'}
                                        </span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Standard Student Profile</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        {stats?.has_student_profile
                                            ? `CNIC: ${student?.cnic_bform} • Marks: ${student?.obtained_marks}/${student?.total_marks} (${student?.percentage}%)`
                                            : 'Create your single, reusable profile with CNIC and academic history.'}
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href={route('student.profile.edit')}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-between"
                                    >
                                        <span>{stats?.has_student_profile ? 'Edit Profile Details' : 'Create Profile Now →'}</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Card 2: Applications */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors duration-200">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-lg">
                                            🎓
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300">
                                            {stats?.my_applications_count || 0} Submitted
                                        </span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Programme Applications</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        Apply to multiple degree programmes across faculties using your standard profile.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <Link
                                        href={route('applications.index')}
                                        className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                                    >
                                        My Applications
                                    </Link>
                                    <Link
                                        href={route('applications.create')}
                                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50"
                                    >
                                        + Apply New
                                    </Link>
                                </div>
                            </div>

                            {/* Card 3: Document Verification */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors duration-200">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                                            📄
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                            PDF / JPG / PNG
                                        </span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Document Upload & Status</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        Upload CNIC, Marksheets, and Challan copies for verification by Admissions Officers.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href={route('applications.index')}
                                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-between"
                                    >
                                        <span>View Document Status</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {user?.role === 'admissions_officer' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800/40 p-5 shadow-xs flex flex-col justify-between transition-colors duration-200">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                                            ⏳
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                                            Action Needed
                                        </span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Document Review Queue</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        <strong>{stats?.pending_verifications || 0}</strong> uploaded documents awaiting officer verification or rejection.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href={route('admissions.dashboard')}
                                        className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center justify-between"
                                    >
                                        <span>Open Verification Queue</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between transition-colors duration-200">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-lg">
                                            📂
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                                            {stats?.total_applications || 0} Total
                                        </span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">All Applications</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Browse candidate submissions across all departments and faculties.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href={route('applications.index')}
                                        className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center justify-between"
                                    >
                                        <span>View All Applications</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800/40 p-5 shadow-xs flex flex-col justify-between transition-colors duration-200">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                                            ⚖️
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                                            Rank Engine
                                        </span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Merit Lists</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        View ranked candidate lists generated using criteria and tie-breakers.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href={route('merit-list.index')}
                                        className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center justify-between"
                                    >
                                        <span>Open Merit Lists</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {user?.role === 'programme_coordinator' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800/40 p-5 shadow-xs flex flex-col justify-between transition-colors duration-200">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                                            🏛️
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                                            Coordinator Control
                                        </span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Automated Merit Lists</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Configure qualification weight criteria, recalculate rankings, and review tie-breakers.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href={route('merit-list.index')}
                                        className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center justify-between"
                                    >
                                        <span>Manage Merit Lists</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between transition-colors duration-200">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-lg">
                                            📊
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                                            {stats?.total_applications || 0} Submissions
                                        </span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Programme Applications</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Review candidates applied for your academic programmes and finalize admission statuses.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href={route('applications.index')}
                                        className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center justify-between"
                                    >
                                        <span>Review Submissions</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 p-5 shadow-xs flex flex-col justify-between transition-colors duration-200">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                                            🛡️
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                                            Overview
                                        </span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Admissions Queue</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Monitor document verification status across departments.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href={route('admissions.dashboard')}
                                        className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center justify-between"
                                    >
                                        <span>View Queue</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Retained Tasks Widget */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 transition-colors duration-200">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">My Admission & Personal Tasks</h3>

                    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 items-end mb-6">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Task Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Upload attested intermediate marksheet"
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 text-xs focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                                required
                            />
                            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
                        </div>

                        <div className="w-full sm:w-48">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={data.due_date}
                                onChange={(e) => setData('due_date', e.target.value)}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition shadow-xs"
                            >
                                Add Task
                            </button>
                        </div>
                    </form>

                    {!tasks || tasks.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500">No tasks created yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={task.is_completed}
                                            onChange={() => toggleComplete(task)}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                                        />
                                        <span className={`text-xs font-medium ${task.is_completed ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                    {task.due_date && (
                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                                            Due: {task.due_date}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
