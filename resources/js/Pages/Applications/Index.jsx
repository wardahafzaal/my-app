import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ applications, programmes, filters, isApplicant, hasProfile }) {
    const handleFilterChange = (key, value) => {
        router.get(route('applications.index'), {
            ...filters,
            [key]: value || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return { label: 'Accepted', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
            case 'rejected':
                return { label: 'Rejected', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
            case 'under review':
                return { label: 'Under Review', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
            case 'submitted':
            default:
                return { label: 'Submitted', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            {isApplicant ? 'My Programme Applications' : 'University Admission Applications'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {isApplicant
                                ? 'Track your admission applications across different faculties and submit verification documents.'
                                : 'Manage and review university-wide applicant submissions and statuses.'}
                        </p>
                    </div>

                    {isApplicant && (
                        <Link
                            href={route('applications.create')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Apply for Another Programme</span>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Admission Applications" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Notice if applicant hasn't created profile yet */}
                {isApplicant && !hasProfile && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">Profile Required</h4>
                                <p className="text-xs text-amber-700">Please complete your Standard Student Profile before applying to programmes.</p>
                            </div>
                        </div>
                        <Link
                            href={route('student.profile.edit')}
                            className="px-4 py-2 rounded-xl bg-amber-600 text-xs font-semibold text-white hover:bg-amber-500 transition"
                        >
                            Complete Profile
                        </Link>
                    </div>
                )}

                {/* Filters & Search for Officers/Coordinators */}
                {!isApplicant && (
                    <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-3 items-center flex-1">
                            <div className="w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search candidate / App #"
                                    defaultValue={filters.search || ''}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', e.target.value)}
                                    onBlur={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 text-xs shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <select
                                value={filters.programme_id || ''}
                                onChange={(e) => handleFilterChange('programme_id', e.target.value)}
                                className="rounded-xl border-slate-200 text-xs shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">All Programmes</option>
                                {programmes.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.code} - {p.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="rounded-xl border-slate-200 text-xs shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="submitted">Submitted</option>
                                <option value="under review">Under Review</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Applications list */}
                {applications.data.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-slate-800">No applications found</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                            {isApplicant
                                ? 'You haven’t applied for any university programmes yet. Submit your first application now!'
                                : 'No applications match the current filter criteria.'}
                        </p>
                        {isApplicant && (
                            <Link
                                href={route('applications.create')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                            >
                                Apply Now
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {applications.data.map((app) => {
                            const badge = getStatusBadge(app.status);
                            return (
                                <div
                                    key={app.id}
                                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-indigo-50 to-violet-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100 group-hover:scale-105 transition">
                                                {app.programme?.code || 'APP'}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                                        {app.programme?.name || 'Academic Programme'}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                                                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                                        {app.application_number}
                                                    </span>
                                                    <span>University: <strong>{app.university_name}</strong></span>
                                                    <span>Applied: {new Date(app.application_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                    {!isApplicant && app.student && (
                                                        <span>Applicant: <strong>{app.student.full_name}</strong> ({app.student.cnic_bform})</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-right hidden sm:block">
                                                <div className="text-xs text-slate-400">Merit Score</div>
                                                <div className="text-sm font-bold text-slate-900">
                                                    {app.merit_score ? `${app.merit_score}%` : 'Pending'}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {app.documents?.length || 0} doc(s) uploaded
                                                </div>
                                            </div>

                                            <Link
                                                href={route('applications.show', app.id)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-indigo-600 hover:text-white transition shadow-xs"
                                            >
                                                <span>View & Documents</span>
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
