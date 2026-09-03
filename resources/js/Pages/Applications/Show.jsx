import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ application, canManageStatus, canVerifyDocuments, currentUser }) {
    const [rejectionModalDoc, setRejectionModalDoc] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [fileTypeError, setFileTypeError] = useState(null);

    // Document Upload Form
    const { data, setData, post, processing, errors, reset } = useForm({
        document: null,
        document_type: 'CNIC / B-Form Copy',
    });

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileTypeError(null);

        if (file) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                setFileTypeError(`Unsupported format ".${ext}". Only PDF, JPG, and PNG files are allowed.`);
                e.target.value = '';
                setData('document', null);
                return;
            }
            setData('document', file);
        }
    };

    const submitDocument = (e) => {
        e.preventDefault();
        if (!data.document) {
            setFileTypeError('Please select a valid PDF, JPG, or PNG file.');
            return;
        }

        post(route('documents.store', application.id), {
            forceFormData: true,
            onSuccess: () => {
                reset('document');
                setFileTypeError(null);
            },
        });
    };

    // Verification Action
    const handleVerify = (documentId, status, reason = null) => {
        router.patch(route('documents.verify', documentId), {
            verification_status: status,
            rejection_reason: reason,
        }, {
            preserveScroll: true,
            onSuccess: () => setRejectionModalDoc(null),
        });
    };

    // Status change for Application
    const handleApplicationStatus = (newStatus) => {
        router.patch(route('applications.updateStatus', application.id), {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
            case 'accepted':
                return { label: status.toUpperCase(), bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
            case 'rejected':
                return { label: status.toUpperCase(), bg: 'bg-rose-100 text-rose-800 border-rose-200' };
            case 'under review':
                return { label: 'UNDER REVIEW', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
            case 'pending':
            case 'submitted':
            default:
                return { label: status.toUpperCase(), bg: 'bg-amber-100 text-amber-800 border-amber-200' };
        }
    };

    const appStatusBadge = getStatusBadge(application.status);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Application {application.application_number}
                            </h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${appStatusBadge.bg}`}>
                                {appStatusBadge.label}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            {application.programme?.name} • {application.university_name}
                        </p>
                    </div>

                    <Link
                        href={route('applications.index')}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                        ← Back to Applications
                    </Link>
                </div>
            }
        >
            <Head title={`Application ${application.application_number}`} />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Top Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                        <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Candidate Profile</div>
                            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{application.student?.full_name}</h3>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                                <span>CNIC: <strong>{application.student?.cnic_bform}</strong></span>
                                <span>Email: <strong>{application.student?.email}</strong></span>
                                <span>Phone: <strong>{application.student?.phone}</strong></span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-xs text-slate-400">Academic Score</div>
                                <div className="text-lg font-bold text-indigo-600">
                                    {application.student?.percentage}%
                                </div>
                                <div className="text-xs text-slate-500">
                                    {application.student?.obtained_marks} / {application.student?.total_marks} marks
                                </div>
                            </div>

                            <div className="text-right border-l pl-6 border-slate-200">
                                <div className="text-xs text-slate-400">Application Date</div>
                                <div className="text-sm font-semibold text-slate-800">
                                    {new Date(application.application_date).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    {new Date(application.application_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admissions Officer / Coordinator Controls */}
                    {canManageStatus && (
                        <div className="mt-4 pt-2 flex items-center justify-between flex-wrap gap-3">
                            <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                                <span>🛡️ Admission Decision Actions:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleApplicationStatus('under review')}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                >
                                    Mark Under Review
                                </button>
                                <button
                                    onClick={() => handleApplicationStatus('accepted')}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                >
                                    Accept Application
                                </button>
                                <button
                                    onClick={() => handleApplicationStatus('rejected')}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                                >
                                    Reject Application
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Document Upload Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                    <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Application Verification Documents
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Strictly accepted formats: <strong className="text-indigo-600 font-mono">PDF, JPG, PNG</strong> (Max size: 5 MB).
                            </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                            {application.documents?.length || 0} Uploaded
                        </span>
                    </div>

                    {/* Upload Box */}
                    <form onSubmit={submitDocument} className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                            Upload New Document for Verification
                        </h4>

                        {fileTypeError && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                                <span>❌</span>
                                <span>{fileTypeError}</span>
                            </div>
                        )}

                        {errors.document && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                                <span>❌</span>
                                <span>{errors.document}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Document Type
                                </label>
                                <select
                                    value={data.document_type}
                                    onChange={(e) => setData('document_type', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 text-xs focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                                >
                                    <option value="CNIC / B-Form Copy">CNIC / B-Form Copy</option>
                                    <option value="Intermediate / Equivalent Certificate">Intermediate / Equivalent Certificate</option>
                                    <option value="Matric Marksheet">Matric Marksheet</option>
                                    <option value="Paid Admission Challan">Paid Admission Challan</option>
                                    <option value="Character Certificate">Character Certificate</option>
                                    <option value="Other Certificate">Other Certificate</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Select File <span className="text-slate-400 font-normal">(.pdf, .jpg, .png only)</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                    required
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={processing || !data.document}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Uploading...' : 'Upload Document'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Uploaded Documents List */}
                    <div className="space-y-3">
                        {application.documents?.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                                <p className="text-xs text-slate-400">
                                    No documents uploaded yet. Please upload your CNIC and academic marksheet to proceed with admission verification.
                                </p>
                            </div>
                        ) : (
                            application.documents.map((doc) => {
                                const docBadge = getStatusBadge(doc.verification_status);
                                const isPending = doc.verification_status === 'pending';
                                const isVerified = doc.verification_status === 'verified';
                                const isRejected = doc.verification_status === 'rejected';

                                return (
                                    <div
                                        key={doc.id}
                                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                                                {doc.file_name.endsWith('.pdf') ? 'PDF' : 'IMG'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-sm font-bold text-slate-900">{doc.document_type}</h4>
                                                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${docBadge.bg}`}>
                                                        {docBadge.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {doc.file_name} • {(doc.file_size / 1024).toFixed(1)} KB • Uploaded {new Date(doc.created_at).toLocaleDateString()}
                                                </p>

                                                {isRejected && doc.rejection_reason && (
                                                    <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                                                        <strong>Rejection Note:</strong> {doc.rejection_reason}
                                                    </div>
                                                )}

                                                {isVerified && doc.verifier && (
                                                    <p className="text-[11px] text-emerald-700 font-medium mt-1">
                                                        ✓ Verified by {doc.verifier.name} on {new Date(doc.verified_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {/* Preview/Download link */}
                                            <a
                                                href={route('documents.download', doc.id)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                            >
                                                View / Download
                                            </a>

                                            {/* Admissions Officer verification controls */}
                                            {canVerifyDocuments && (
                                                <>
                                                    <button
                                                        onClick={() => handleVerify(doc.id, 'verified')}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-xs"
                                                    >
                                                        Verify ✓
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setRejectionModalDoc(doc);
                                                            setRejectionReason('');
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
                                                    >
                                                        Reject ✗
                                                    </button>
                                                </>
                                            )}

                                            {/* Delete for applicant if pending */}
                                            {!canVerifyDocuments && isPending && (
                                                <button
                                                    onClick={() => router.delete(route('documents.destroy', doc.id))}
                                                    className="text-xs text-rose-600 hover:text-rose-800 p-1"
                                                    title="Delete pending document"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Rejection Modal for Admissions Officer */}
                {rejectionModalDoc && (
                    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
                            <h3 className="text-base font-bold text-slate-900 mb-2">
                                Reject Document: {rejectionModalDoc.document_type}
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Provide an optional rejection reason to instruct the applicant on why this document was rejected and how to re-upload.
                            </p>

                            <textarea
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g. Image resolution is illegible, please upload a clear scanned copy of your original certificate."
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
                                    Confirm Document Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
