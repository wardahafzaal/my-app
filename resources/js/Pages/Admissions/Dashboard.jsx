import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ metrics, documents, programmes, filters }) {
    const [rejectionModalDoc, setRejectionModalDoc] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleFilterChange = (key, value) => {
        router.get(route('admissions.dashboard'), {
            ...filters,
            [key]: value || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleVerify = (documentId, status, reason = null) => {
        router.patch(route('documents.verify', documentId), {
            verification_status: status,
            rejection_reason: reason,
        }, {
            preserveScroll: true,
            onSuccess: () => setRejectionModalDoc(null),
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return { label: 'VERIFIED', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
            case 'rejected':
                return { label: 'REJECTED', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
            case 'pending':
            default:
                return { label: 'PENDING', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            Admissions Officer Dashboard
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Central verification console for student documents, credentials, and admission processing.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('merit-list.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 shadow-xs"
                        >
                            <span>View Merit Lists</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Admissions Dashboard" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between text-slate-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Total Applications</span>
                            <span className="text-lg">📁</span>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-slate-900">{metrics.total_applications}</div>
                        <div className="text-xs text-slate-500 mt-1">{metrics.total_students} registered students</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-linear-to-b from-white to-amber-50/30 shadow-xs">
                        <div className="flex items-center justify-between text-amber-600">
                            <span className="text-xs font-bold uppercase tracking-wider">Pending Documents</span>
                            <span className="text-lg">⏳</span>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-amber-700">{metrics.pending_documents}</div>
                        <div className="text-xs text-amber-600 mt-1">Requires officer action</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-linear-to-b from-white to-emerald-50/30 shadow-xs">
                        <div className="flex items-center justify-between text-emerald-600">
                            <span className="text-xs font-bold uppercase tracking-wider">Verified Documents</span>
                            <span className="text-lg">✅</span>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-emerald-700">{metrics.verified_documents}</div>
                        <div className="text-xs text-emerald-600 mt-1">Ready for merit calculation</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-linear-to-b from-white to-rose-50/30 shadow-xs">
                        <div className="flex items-center justify-between text-rose-600">
                            <span className="text-xs font-bold uppercase tracking-wider">Rejected Documents</span>
                            <span className="text-lg">⚠️</span>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-rose-700">{metrics.rejected_documents}</div>
                        <div className="text-xs text-rose-600 mt-1">Requires applicant re-upload</div>
                    </div>
                </div>

                {/* Document Verification Queue */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Document Verification Queue</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Review uploaded applicant documents and assign verified or rejected status.</p>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2.5 items-center">
                            <input
                                type="text"
                                placeholder="Search candidate or CNIC..."
                                defaultValue={filters.search || ''}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', e.target.value)}
                                onBlur={(e) => handleFilterChange('search', e.target.value)}
                                className="rounded-xl border-slate-200 text-xs py-1.5 focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                            />

                            <select
                                value={filters.status || 'all'}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="rounded-xl border-slate-200 text-xs py-1.5 focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                            >
                                <option value="all">All Document Statuses</option>
                                <option value="pending">Pending Only</option>
                                <option value="verified">Verified Only</option>
                                <option value="rejected">Rejected Only</option>
                            </select>

                            <select
                                value={filters.programme_id || ''}
                                onChange={(e) => handleFilterChange('programme_id', e.target.value)}
                                className="rounded-xl border-slate-200 text-xs py-1.5 focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                            >
                                <option value="">All Programmes</option>
                                {programmes.map((p) => (
                                    <option key={p.id} value={p.id}>{p.code}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4">Applicant & CNIC</th>
                                    <th className="py-3 px-4">Programme & App #</th>
                                    <th className="py-3 px-4">Document Type & File</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Uploaded / Verified</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {documents.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">
                                            No documents found matching the filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    documents.data.map((doc) => {
                                        const badge = getStatusBadge(doc.verification_status);
                                        return (
                                            <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900">{doc.student?.full_name}</div>
                                                    <div className="font-mono text-slate-500 text-[11px]">{doc.student?.cnic_bform}</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-slate-800">{doc.application?.programme?.name}</div>
                                                    <div className="font-mono text-slate-400 text-[11px]">{doc.application?.application_number}</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-slate-900">{doc.document_type}</div>
                                                    <a
                                                        href={route('documents.download', doc.id)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-indigo-600 hover:underline text-[11px] flex items-center gap-1 mt-0.5"
                                                    >
                                                        <span>📄 {doc.file_name}</span>
                                                        <span className="text-slate-400">({(doc.file_size / 1024).toFixed(1)} KB)</span>
                                                    </a>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bg}`}>
                                                        {badge.label}
                                                    </span>
                                                    {doc.verification_status === 'rejected' && doc.rejection_reason && (
                                                        <div className="text-[11px] text-rose-600 mt-1 max-w-xs truncate" title={doc.rejection_reason}>
                                                            Reason: {doc.rejection_reason}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                                                    <div>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</div>
                                                    {doc.verified_at && (
                                                        <div className="text-emerald-700 font-medium">
                                                            By {doc.verifier?.name || 'Officer'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <a
                                                            href={route('documents.download', doc.id)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                                            title="Preview File"
                                                        >
                                                            👁️
                                                        </a>
                                                        <button
                                                            onClick={() => handleVerify(doc.id, 'verified')}
                                                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow-xs"
                                                            title="Mark Verified"
                                                        >
                                                            Verify ✓
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRejectionModalDoc(doc);
                                                                setRejectionReason('');
                                                            }}
                                                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100"
                                                            title="Reject Document"
                                                        >
                                                            Reject ✗
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Rejection Modal */}
                {rejectionModalDoc && (
                    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
                            <h3 className="text-base font-bold text-slate-900 mb-2">
                                Reject Document: {rejectionModalDoc.document_type}
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                State the reason for rejection to notify the applicant.
                            </p>

                            <textarea
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g. Scanned copy is illegible, please upload a clear colored scan."
                                className="w-full rounded-xl border-slate-200 text-xs focus:border-rose-500 focus:ring-rose-500 mb-4"
                            />

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setRejectionModalDoc(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleVerify(rejectionModalDoc.id, 'rejected', rejectionReason)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 shadow-xs"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
