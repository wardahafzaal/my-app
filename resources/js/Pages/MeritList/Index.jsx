import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Index({ programmes, selectedProgramme, criteria, applications, stats, canManageDecisions }) {
    const [sortField, setSortField] = useState('rank');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showConfigModal, setShowConfigModal] = useState(false);

    // Form to recalculate merit list with custom weights & criteria
    const { data: configData, setData: setConfigData, post: postGenerate, processing: isGenerating } = useForm({
        programme_id: selectedProgramme?.id || '',
        academic_weight_pct: criteria?.academic_weight_pct || 100,
        entry_test_weight_pct: criteria?.entry_test_weight_pct || 0,
        minimum_eligibility_pct: criteria?.minimum_eligibility_pct || 50,
        tiebreaker_rule: criteria?.tiebreaker_rule || 'earlier_submission',
    });

    const handleProgrammeChange = (progId) => {
        router.get(route('merit-list.index'), { programme_id: progId });
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection(field === 'merit_score' ? 'desc' : 'asc');
        }
    };

    const handleStatusChange = (appId, newStatus) => {
        router.patch(route('merit-list.applicant.status', appId), {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    const handleGenerateSubmit = (e) => {
        e.preventDefault();
        configData.programme_id = selectedProgramme.id;
        postGenerate(route('merit-list.generate'), {
            onSuccess: () => setShowConfigModal(false),
        });
    };

    // Client-side table sorting
    const sortedApplications = useMemo(() => {
        if (!applications) return [];
        return [...applications].sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === 'student_name') {
                aVal = (a.student_name || '').toLowerCase();
                bVal = (b.student_name || '').toLowerCase();
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [applications, sortField, sortDirection]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Automated Merit List & Ranking
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                Automated Rank Engine
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            Programme-specific merit lists generated with customizable criteria and submission-date tie-breakers.
                        </p>
                    </div>

                    {selectedProgramme && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowConfigModal(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
                            >
                                <span>⚙️ Configure Weights</span>
                            </button>

                            <a
                                href={route('merit-list.export', selectedProgramme.id)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Export CSV</span>
                            </a>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Merit List & Rankings" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Programme Selector Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
                            Select Programme:
                        </label>
                        <select
                            value={selectedProgramme?.id || ''}
                            onChange={(e) => handleProgrammeChange(e.target.value)}
                            className="rounded-xl border-slate-200 text-sm font-semibold text-slate-800 focus:border-purple-500 focus:ring-purple-500 shadow-xs"
                        >
                            {programmes.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.code} - {p.name} ({p.faculty})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Criteria formula badge */}
                    {criteria && (
                        <div className="flex items-center gap-3 text-xs text-slate-600 bg-purple-50/60 border border-purple-100 px-4 py-2 rounded-xl">
                            <span className="font-semibold text-purple-900">Current Formula:</span>
                            <span>Academic Weight: <strong>{criteria.academic_weight_pct}%</strong></span>
                            <span>•</span>
                            <span>Eligibility Cutoff: <strong>{criteria.minimum_eligibility_pct}%</strong></span>
                            <span>•</span>
                            <span>Tiebreaker: <strong>Submission Date (Earlier)</strong></span>
                        </div>
                    )}
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Applicants</div>
                        <div className="mt-1 text-2xl font-extrabold text-slate-900">{stats.total_applicants}</div>
                        <div className="text-xs text-slate-500 mt-1">For {selectedProgramme?.code}</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-linear-to-b from-white to-purple-50/30 shadow-xs">
                        <div className="text-xs font-bold uppercase tracking-wider text-purple-700">Programme Capacity</div>
                        <div className="mt-1 text-2xl font-extrabold text-purple-800">{stats.programme_capacity}</div>
                        <div className="text-xs text-purple-600 mt-1">Available Quota Seats</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-linear-to-b from-white to-emerald-50/30 shadow-xs">
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Top Merit Score</div>
                        <div className="mt-1 text-2xl font-extrabold text-emerald-800">{stats.top_merit}%</div>
                        <div className="text-xs text-emerald-600 mt-1">Rank 1 Candidate</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-linear-to-b from-white to-indigo-50/30 shadow-xs">
                        <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">Eligible Candidates</div>
                        <div className="mt-1 text-2xl font-extrabold text-indigo-800">{stats.eligible_applicants}</div>
                        <div className="text-xs text-indigo-600 mt-1">Above {criteria?.minimum_eligibility_pct || 50}% cutoff</div>
                    </div>
                </div>

                {/* Tie-breaker explanation banner */}
                <div className="p-4 rounded-2xl bg-linear-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            ⚖️
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-purple-950">Automated Tie-Breaking Policy Active</h4>
                            <p className="text-xs text-purple-900/80 mt-0.5">
                                When two or more applicants have identical merit scores, the candidate who submitted their application earlier is automatically awarded the higher rank order. Candidates with tied scores are highlighted with a badge below.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sortable Merit List Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Merit List: {selectedProgramme?.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Click any table header to sort dynamically. Green highlighted rows fall within programme quota capacity ({selectedProgramme?.capacity} seats).
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold select-none">
                                    <th
                                        onClick={() => handleSort('rank')}
                                        className="py-3 px-4 cursor-pointer hover:text-slate-800"
                                    >
                                        Rank {sortField === 'rank' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('student_name')}
                                        className="py-3 px-4 cursor-pointer hover:text-slate-800"
                                    >
                                        Applicant Details {sortField === 'student_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="py-3 px-4">Academic Background</th>
                                    <th
                                        onClick={() => handleSort('academic_percentage')}
                                        className="py-3 px-4 cursor-pointer hover:text-slate-800"
                                    >
                                        Marks / % {sortField === 'academic_percentage' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('merit_score')}
                                        className="py-3 px-4 cursor-pointer hover:text-slate-800"
                                    >
                                        Calculated Merit {sortField === 'merit_score' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('application_date_raw')}
                                        className="py-3 px-4 cursor-pointer hover:text-slate-800"
                                    >
                                        Submission Date (Tiebreaker) {sortField === 'application_date_raw' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="py-3 px-4">Status</th>
                                    {canManageDecisions && <th className="py-3 px-4 text-right">Decision</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan={canManageDecisions ? 8 : 7} className="py-12 text-center text-slate-400">
                                            No applicants found for this programme.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedApplications.map((app) => (
                                        <tr
                                            key={app.id}
                                            className={`transition ${
                                                app.is_within_capacity
                                                    ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                                                    : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            {/* Rank */}
                                            <td className="py-3.5 px-4 font-mono font-extrabold text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                                                        app.rank === 1
                                                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                                                            : app.rank === 2
                                                            ? 'bg-slate-300 text-slate-800'
                                                            : app.rank === 3
                                                            ? 'bg-amber-600 text-white'
                                                            : app.is_within_capacity
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        #{app.rank}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Applicant Details */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900 text-sm">{app.student_name}</div>
                                                <div className="font-mono text-[11px] text-slate-500">
                                                    CNIC: {app.cnic_bform} • {app.application_number}
                                                </div>
                                            </td>

                                            {/* Academic Background */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-slate-800">{app.qualification}</div>
                                                <div className="text-[11px] text-slate-500 truncate max-w-xs">{app.previous_institution}</div>
                                            </td>

                                            {/* Marks */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-slate-800">{app.obtained_marks} / {app.total_marks}</div>
                                                <div className="text-[11px] text-slate-500 font-mono">{app.academic_percentage}%</div>
                                            </td>

                                            {/* Merit Score */}
                                            <td className="py-3.5 px-4">
                                                <div className="text-sm font-extrabold text-indigo-700">
                                                    {app.merit_score}%
                                                </div>
                                                {app.is_within_capacity ? (
                                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                                        Within Quota ({selectedProgramme?.capacity})
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        Waiting List
                                                    </span>
                                                )}
                                            </td>

                                            {/* Submission Date & Tiebreaker note */}
                                            <td className="py-3.5 px-4">
                                                <div className="text-xs text-slate-700 font-medium">
                                                    {app.application_date || 'N/A'}
                                                </div>
                                                {app.is_tied && (
                                                    <div className="mt-1 flex items-center gap-1">
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                                            ⚖️ Tied Score (Ranked by Date)
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                                    app.status === 'accepted'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : app.status === 'rejected'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : app.status === 'under review'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {app.status.toUpperCase()}
                                                </span>
                                            </td>

                                            {/* Decision Control */}
                                            {canManageDecisions && (
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleStatusChange(app.id, 'accepted')}
                                                            className="px-2 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow-xs"
                                                            title="Accept Applicant"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(app.id, 'rejected')}
                                                            className="px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100"
                                                            title="Reject Applicant"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Criteria Configuration Modal */}
                {showConfigModal && (
                    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                Configure Merit Criteria & Weights
                            </h3>
                            <p className="text-xs text-slate-500 mb-5">
                                Adjust the weight percentage for qualifications and minimum cutoff threshold for {selectedProgramme?.name}.
                            </p>

                            <form onSubmit={handleGenerateSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Academic Marks Weight Percentage (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={configData.academic_weight_pct}
                                        onChange={(e) => setConfigData('academic_weight_pct', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 text-sm shadow-xs focus:border-purple-500 focus:ring-purple-500"
                                        required
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Typically 100% for standard intermediate merit.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Entry Test Weight Percentage (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={configData.entry_test_weight_pct}
                                        onChange={(e) => setConfigData('entry_test_weight_pct', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 text-sm shadow-xs focus:border-purple-500 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Minimum Eligibility Threshold (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={configData.minimum_eligibility_pct}
                                        onChange={(e) => setConfigData('minimum_eligibility_pct', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 text-sm shadow-xs focus:border-purple-500 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Tie-Breaker Rule
                                    </label>
                                    <select
                                        value={configData.tiebreaker_rule}
                                        onChange={(e) => setConfigData('tiebreaker_rule', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 text-sm shadow-xs focus:border-purple-500 focus:ring-purple-500"
                                    >
                                        <option value="earlier_submission">Application Submission Date (Earlier Date First)</option>
                                    </select>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfigModal(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isGenerating}
                                        className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 shadow-xs cursor-pointer"
                                    >
                                        {isGenerating ? 'Generating...' : 'Recalculate & Rank Applicants'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
