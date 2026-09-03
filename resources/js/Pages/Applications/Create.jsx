import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create({ student, programmes, appliedProgrammeIds }) {
    const { data, setData, post, processing, errors } = useForm({
        programme_id: '',
        university_name: 'National Campus',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('applications.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            Apply for University Programme
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Select an undergraduate programme to apply for using your verified standard student profile.
                        </p>
                    </div>

                    <Link
                        href={route('applications.index')}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                        Back to Applications
                    </Link>
                </div>
            }
        >
            <Head title="Submit Programme Application" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Linked Profile Banner */}
                <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                            🎓
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">Linked Standard Profile</div>
                            <div className="text-sm font-bold text-slate-900">
                                {student.full_name} <span className="font-normal text-slate-500">({student.cnic_bform})</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-600">
                        <div>Qualification: <strong>{student.qualification}</strong></div>
                        <div>Academic Score: <strong>{student.obtained_marks} / {student.total_marks} ({student.percentage}%)</strong></div>
                        <Link
                            href={route('student.profile.edit')}
                            className="text-indigo-600 font-semibold hover:underline"
                        >
                            Edit Profile
                        </Link>
                    </div>
                </div>

                {errors.programme_id && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{errors.programme_id}</span>
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="mb-6">
                        <h3 className="text-base font-bold text-slate-900 mb-3">
                            Available Undergraduate Programmes
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            You may apply to multiple programmes. Each application is ranked individually on its respective merit list.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {programmes.map((p) => {
                                const isApplied = appliedProgrammeIds.includes(p.id);
                                const isSelected = data.programme_id === p.id;

                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => !isApplied && setData('programme_id', p.id)}
                                        className={`rounded-2xl border p-5 transition relative flex flex-col justify-between ${
                                            isApplied
                                                ? 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed'
                                                : isSelected
                                                ? 'bg-indigo-50/50 border-indigo-600 shadow-md ring-2 ring-indigo-600/20 cursor-pointer'
                                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs cursor-pointer'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-slate-100 text-slate-700">
                                                    {p.code}
                                                </span>
                                                {isApplied ? (
                                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-200 text-slate-600">
                                                        ✓ Already Applied
                                                    </span>
                                                ) : isSelected ? (
                                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-600 text-white">
                                                        Selected
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] font-medium text-slate-400">
                                                        Quota: {p.capacity} seats
                                                    </span>
                                                )}
                                            </div>

                                            <h4 className="text-base font-bold text-slate-900 leading-snug">
                                                {p.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {p.faculty}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                            <span>{p.degree_level}</span>
                                            {!isApplied && (
                                                <span className="font-semibold text-indigo-600">
                                                    {isSelected ? '✓ Ready to Submit' : 'Click to Select'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-500">Campus Destination</span>
                            <div className="text-sm font-semibold text-slate-800">
                                National Campus Main (Fall 2026 Admissions)
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.programme_id}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? 'Submitting Application...' : 'Confirm & Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
