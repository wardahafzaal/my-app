import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Profile({ student, user, status }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        full_name: student?.full_name || user?.name || '',
        cnic_bform: student?.cnic_bform || '',
        email: student?.email || user?.email || '',
        phone: student?.phone || '',
        date_of_birth: student?.date_of_birth ? student.date_of_birth.substring(0, 10) : '',
        address: student?.address || '',
        previous_institution: student?.previous_institution || '',
        qualification: student?.qualification || 'FSc Pre-Engineering',
        total_marks: student?.total_marks || '1100',
        obtained_marks: student?.obtained_marks || '',
        marks_grade: student?.marks_grade || '',
    });

    // Auto-compute grade percentage preview
    const totalNum = parseFloat(data.total_marks) || 0;
    const obtainedNum = parseFloat(data.obtained_marks) || 0;
    const calculatedPercentage = totalNum > 0 && obtainedNum >= 0 && obtainedNum <= totalNum
        ? ((obtainedNum / totalNum) * 100).toFixed(2)
        : null;

    useEffect(() => {
        if (calculatedPercentage && !data.marks_grade) {
            setData('marks_grade', `${calculatedPercentage}%`);
        }
    }, [calculatedPercentage]);

    const submit = (e) => {
        e.preventDefault();
        post(route('student.profile.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            Standard Student Profile
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Your centralized academic profile created once and reused across all university programmes.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('profile.builder')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition focus:outline-none"
                        >
                            <span>Launch 5-Step Wizard</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                        {student && (
                            <Link
                                href={route('applications.create')}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                            >
                                <span>Apply for Programme</span>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Standard Student Profile" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Info Card */}
                <div className="mb-6 rounded-2xl bg-linear-to-r from-indigo-50 via-violet-50 to-blue-50 border border-indigo-100 p-5">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-indigo-950">One Profile, Multiple Applications</h3>
                            <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed">
                                Under Part 1 of the admission system, your CNIC/B-Form uniquely verifies your profile. You only have to fill out your personal information and academic history once. You can subsequently submit applications to multiple programmes without re-entering your credentials.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Duplicate CNIC error banner if triggered */}
                {errors.cnic_bform && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 flex items-start gap-3 shadow-xs">
                        <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-bold">Duplicate Profile Error</h4>
                            <p className="text-sm mt-0.5">{errors.cnic_bform}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Section 1: Personal Information */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                        <div className="border-b border-slate-100 pb-4 mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Personal Information</h3>
                                <p className="text-xs text-slate-500">Legal details as printed on your national identification document.</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                Step 1 of 2
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    placeholder="e.g. Ahmed Khan"
                                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                                    required
                                />
                                {errors.full_name && <p className="mt-1 text-xs text-rose-600">{errors.full_name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    CNIC / B-Form Number <span className="text-rose-500">*</span>
                                    <span className="text-slate-400 font-normal ml-1 lowercase">(unique identifier)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.cnic_bform}
                                    onChange={(e) => setData('cnic_bform', e.target.value)}
                                    placeholder="35202-1234567-1"
                                    className={`w-full rounded-xl text-sm shadow-xs ${errors.cnic_bform ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                    required
                                />
                                {errors.cnic_bform ? (
                                    <p className="mt-1 text-xs font-semibold text-rose-600">{errors.cnic_bform}</p>
                                ) : (
                                    <p className="mt-1 text-xs text-slate-400">Format: 13 digits with or without dashes</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Email Address <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="applicant@campus.edu"
                                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                                    required
                                />
                                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Phone Number <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="0300-1234567"
                                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                                    required
                                />
                                {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Date of Birth <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                                    required
                                />
                                {errors.date_of_birth && <p className="mt-1 text-xs text-rose-600">{errors.date_of_birth}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Residential Address <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Complete residential address, city, province"
                                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                                    required
                                />
                                {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Academic History */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                        <div className="border-b border-slate-100 pb-4 mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Academic History</h3>
                                <p className="text-xs text-slate-500">Your prior educational qualification used to compute automated merit rankings.</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                Step 2 of 2
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Previous Institution <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.previous_institution}
                                    onChange={(e) => setData('previous_institution', e.target.value)}
                                    placeholder="e.g. Punjab Group of Colleges / Beaconhouse / FG College"
                                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                                    required
                                />
                                {errors.previous_institution && <p className="mt-1 text-xs text-rose-600">{errors.previous_institution}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Qualification / Degree <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.qualification}
                                    onChange={(e) => setData('qualification', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                                    required
                                >
                                    <option value="FSc Pre-Engineering">FSc Pre-Engineering</option>
                                    <option value="FSc Pre-Medical">FSc Pre-Medical</option>
                                    <option value="ICS (Computer Science)">ICS (Computer Science)</option>
                                    <option value="A-Levels / Cambridge">A-Levels / Cambridge</option>
                                    <option value="ICom (Commerce)">ICom (Commerce)</option>
                                    <option value="DAE / Polytechnic">DAE / Polytechnic</option>
                                    <option value="Matriculation / O-Levels">Matriculation / O-Levels</option>
                                    <option value="Other Equivalent">Other Equivalent</option>
                                </select>
                                {errors.qualification && <p className="mt-1 text-xs text-rose-600">{errors.qualification}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Total Marks <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={data.total_marks}
                                    onChange={(e) => setData('total_marks', e.target.value)}
                                    placeholder="1100"
                                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                                    required
                                />
                                {errors.total_marks && <p className="mt-1 text-xs text-rose-600">{errors.total_marks}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Obtained Marks <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={data.obtained_marks}
                                    onChange={(e) => setData('obtained_marks', e.target.value)}
                                    placeholder="e.g. 990"
                                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-xs"
                                    required
                                />
                                {errors.obtained_marks && <p className="mt-1 text-xs text-rose-600">{errors.obtained_marks}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Marks Grade / Percentage
                                </label>
                                <input
                                    type="text"
                                    value={data.marks_grade}
                                    onChange={(e) => setData('marks_grade', e.target.value)}
                                    placeholder="e.g. 90.00% (A+)"
                                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-xs bg-slate-50"
                                />
                                {errors.marks_grade && <p className="mt-1 text-xs text-rose-600">{errors.marks_grade}</p>}
                            </div>
                        </div>

                        {/* Calculated Merit Preview Banner */}
                        {calculatedPercentage && (
                            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                        %
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-slate-500">Calculated Academic Score</div>
                                        <div className="text-base font-bold text-slate-900">
                                            {data.obtained_marks} / {data.total_marks} marks ({calculatedPercentage}%)
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800">
                                        Ready for Merit Ranking
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href={route('dashboard')}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Saving Profile...
                                </>
                            ) : (
                                student ? 'Save Changes' : 'Create Standard Profile'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
