import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

export default function ProfileBuilder({
    student,
    user,
    programmes = [],
    appliedProgrammeIds = [],
    prospectiveAppId,
    regions = {},
    quotas = [],
    completionPercentage = 0,
    status,
}) {
    // Current active step (1 to 5)
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState(() => {
        const completed = new Set();
        if (student?.full_name && student?.cnic_bform && student?.father_name) completed.add(1);
        if (student?.phone && student?.email && student?.address) completed.add(2);
        if (student?.matric_obtained_marks && student?.inter_obtained_marks) completed.add(3);
        return completed;
    });

    const [sameAsPermanent, setSameAsPermanent] = useState(false);

    // Main Form state
    const { data, setData, post, processing, errors, transform } = useForm({
        // Step 1: Personal Info
        full_name: student?.full_name || user?.name || '',
        father_name: student?.father_name || '',
        gender: student?.gender || 'Male',
        date_of_birth: student?.date_of_birth ? student.date_of_birth.substring(0, 10) : '',
        cnic_bform: student?.cnic_bform || '',
        domicile_province: student?.domicile_province || 'Punjab',
        domicile_district: student?.domicile_district || 'Lahore',
        nationality: student?.nationality || 'Pakistani',

        // Step 2: Contact Info
        phone: student?.phone || '',
        alternate_phone: student?.alternate_phone || '',
        email: student?.email || user?.email || '',
        address: student?.address || '',
        current_address: student?.current_address || '',
        province: student?.province || 'Punjab',
        district: student?.district || 'Lahore',
        tehsil: student?.tehsil || '',
        city: student?.city || 'Lahore',
        postal_code: student?.postal_code || '',

        // Step 3: Academic Info - Matric / SSC
        matric_board: student?.matric_board || 'BISE Lahore',
        matric_roll_no: student?.matric_roll_no || '',
        matric_reg_no: student?.matric_reg_no || '',
        matric_passing_year: student?.matric_passing_year || '2024',
        matric_total_marks: student?.matric_total_marks || '1100',
        matric_obtained_marks: student?.matric_obtained_marks || '',
        matric_grade: student?.matric_grade || 'A+',
        matric_status: student?.matric_status || 'Pass',

        // Step 3: Academic Info - Intermediate / HSSC
        inter_board: student?.inter_board || 'BISE Lahore',
        inter_roll_no: student?.inter_roll_no || '',
        inter_reg_no: student?.inter_reg_no || '',
        inter_passing_year: student?.inter_passing_year || '2026',
        inter_total_marks: student?.inter_total_marks || '1100',
        inter_obtained_marks: student?.inter_obtained_marks || '',
        inter_group: student?.inter_group || 'Pre-Engineering',
        inter_status: student?.inter_status || 'Pass',

        // Step 4: Quota Selection & Programme
        programme_id: programmes.length > 0 ? programmes[0].id : '',
        university_name: 'National Campus',
        quota: 'general_merit',

        // Step 5: Declaration
        declaration_accepted: false,
        prospective_app_id: prospectiveAppId,
    });

    // Handle CNIC Formatting (xxxxx-xxxxxxx-x)
    const handleCnicChange = (e) => {
        let val = e.target.value.replace(/\D/g, ''); // Numbers only
        if (val.length > 13) val = val.substring(0, 13);

        let formatted = val;
        if (val.length > 5 && val.length <= 12) {
            formatted = `${val.substring(0, 5)}-${val.substring(5)}`;
        } else if (val.length > 12) {
            formatted = `${val.substring(0, 5)}-${val.substring(5, 12)}-${val.substring(12, 13)}`;
        }
        setData('cnic_bform', formatted);
    };

    // Auto-calculate Matric Percentage: (Obtained / Total) * 100
    const matricPercentage = useMemo(() => {
        const tot = parseFloat(data.matric_total_marks);
        const obt = parseFloat(data.matric_obtained_marks);
        if (tot > 0 && obt >= 0 && obt <= tot) {
            return ((obt / tot) * 100).toFixed(2);
        }
        return '0.00';
    }, [data.matric_total_marks, data.matric_obtained_marks]);

    // Auto-calculate Inter Percentage: (Obtained / Total) * 100
    const interPercentage = useMemo(() => {
        const tot = parseFloat(data.inter_total_marks);
        const obt = parseFloat(data.inter_obtained_marks);
        if (tot > 0 && obt >= 0 && obt <= tot) {
            return ((obt / tot) * 100).toFixed(2);
        }
        return '0.00';
    }, [data.inter_total_marks, data.inter_obtained_marks]);

    // Quick copy permanent address to current address
    useEffect(() => {
        if (sameAsPermanent) {
            setData('current_address', data.address);
        }
    }, [sameAsPermanent, data.address]);

    // Step names and definitions
    const steps = [
        { number: 1, title: 'Personal Info', subtitle: 'Basic identity & domicile' },
        { number: 2, title: 'Contact Info', subtitle: 'Address & communication' },
        { number: 3, title: 'Academic Info', subtitle: 'Matric & Intermediate' },
        { number: 4, title: 'Quota Selection', subtitle: 'Category & Programme' },
        { number: 5, title: 'Declaration', subtitle: 'Review & submit' },
    ];

    // Districts for Step 1
    const domicileDistricts = regions[data.domicile_province] || [];
    // Districts for Step 2
    const contactDistricts = regions[data.province] || [];

    // Save & Continue Action
    const handleSaveAndContinue = (e) => {
        e?.preventDefault();

        // Mark current step as completed
        setCompletedSteps((prev) => new Set([...prev, currentStep]));

        // Persist progress to backend
        router.post(
            route('profile.builder.save-step'),
            {
                step: currentStep,
                ...data,
                matric_percentage: matricPercentage,
                inter_percentage: interPercentage,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (currentStep < 5) {
                        setCurrentStep(currentStep + 1);
                    }
                },
            }
        );
    };

    // Back Action
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Step 5 Submit Application
    const handleSubmitApplication = (e) => {
        e.preventDefault();
        post(route('profile.builder.submit'), {
            preserveScroll: true,
        });
    };

    // Current formatted submission date
    const todayFormatted = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                            <span>ADMISSION APPLICATION WIZARD</span>
                            <span>•</span>
                            <span>FALL 2026 CYCLE</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Student Profile & Application Builder
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Profile Completion</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{completionPercentage}% Completed</div>
                        </div>
                        <div className="w-24 bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-linear-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(completionPercentage, 20)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Profile & Application Builder (5-Step Wizard)" />

            <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* 5-Step Progress Indicator Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs transition-colors duration-200">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
                        {steps.map((s, idx) => {
                            const isCurrent = currentStep === s.number;
                            const isCompleted = completedSteps.has(s.number) || currentStep > s.number;

                            return (
                                <button
                                    key={s.number}
                                    type="button"
                                    onClick={() => setCurrentStep(s.number)}
                                    className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition text-left cursor-pointer ${
                                        isCurrent
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                                            : isCompleted
                                            ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            : 'opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                            isCurrent
                                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300 dark:shadow-none'
                                                : isCompleted
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                                        }`}
                                    >
                                        {isCompleted && !isCurrent ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            s.number
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`text-xs font-bold truncate ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {s.title}
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate hidden lg:block">
                                            {s.subtitle}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Wizard Body Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 transition-colors duration-200">
                    <form onSubmit={currentStep === 5 ? handleSubmitApplication : handleSaveAndContinue}>
                        {/* ================= STEP 1: PERSONAL INFORMATION ================= */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">1</span>
                                        Personal Information
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Enter your official identity details exactly as printed on your CNIC / Smart Card / B-Form.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Applicant Full Name */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Applicant Full Name <span className="text-rose-500">*</span>
                                            <span className="text-[10px] font-normal text-slate-400 ml-1">(as per CNIC / B-Form)</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            placeholder="e.g. Ahmed Khan"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                        {errors.full_name && <p className="text-rose-500 text-xs mt-1">{errors.full_name}</p>}
                                    </div>

                                    {/* Father/Guardian Name */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Father / Guardian Name <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={data.father_name}
                                            onChange={(e) => setData('father_name', e.target.value)}
                                            placeholder="e.g. Muhammad Khan"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                        {errors.father_name && <p className="text-rose-500 text-xs mt-1">{errors.father_name}</p>}
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Gender <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Male', 'Female', 'Other'].map((g) => (
                                                <button
                                                    type="button"
                                                    key={g}
                                                    onClick={() => setData('gender', g)}
                                                    className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition cursor-pointer text-center ${
                                                        data.gender === g
                                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Date of Birth <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                        {errors.date_of_birth && <p className="text-rose-500 text-xs mt-1">{errors.date_of_birth}</p>}
                                    </div>

                                    {/* CNIC / B-Form Number */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            CNIC / B-Form Number <span className="text-rose-500">*</span>
                                            <span className="text-[10px] font-normal text-slate-400 ml-1">(Format: 35201-1234567-1)</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={data.cnic_bform}
                                            onChange={handleCnicChange}
                                            placeholder="35201-1234567-1"
                                            maxLength={15}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                        {errors.cnic_bform && <p className="text-rose-500 text-xs mt-1">{errors.cnic_bform}</p>}
                                    </div>

                                    {/* Nationality */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Nationality <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={data.nationality}
                                            onChange={(e) => setData('nationality', e.target.value)}
                                            placeholder="Pakistani"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                    </div>

                                    {/* Domicile Province */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Domicile Province <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={data.domicile_province}
                                            onChange={(e) => {
                                                const prov = e.target.value;
                                                setData((prev) => ({
                                                    ...prev,
                                                    domicile_province: prov,
                                                    domicile_district: regions[prov]?.[0] || '',
                                                }));
                                            }}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition cursor-pointer"
                                        >
                                            {Object.keys(regions).map((prov) => (
                                                <option key={prov} value={prov}>
                                                    {prov}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Domicile District */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Domicile District <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={data.domicile_district}
                                            onChange={(e) => setData('domicile_district', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition cursor-pointer"
                                        >
                                            {domicileDistricts.map((dist) => (
                                                <option key={dist} value={dist}>
                                                    {dist}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 2: CONTACT INFORMATION ================= */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">2</span>
                                        Contact Information
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Provide active mobile numbers and addresses for admission calls, interview notices, and courier dispatches.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Mobile Number */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Mobile Number (Primary) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="0300-1234567"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                        {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>

                                    {/* Alternate Mobile Number */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Alternate Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.alternate_phone}
                                            onChange={(e) => setData('alternate_phone', e.target.value)}
                                            placeholder="0321-9876543"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                    </div>

                                    {/* Email Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Email Address <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="student@example.com"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                        {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    {/* Permanent Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Permanent Address <span className="text-rose-500">*</span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            required
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="House / Street / Sector / Village details..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                    </div>

                                    {/* Current Address */}
                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                Current / Correspondence Address <span className="text-rose-500">*</span>
                                            </label>
                                            <label className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer font-medium">
                                                <input
                                                    type="checkbox"
                                                    checked={sameAsPermanent}
                                                    onChange={(e) => setSameAsPermanent(e.target.checked)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                Same as permanent address
                                            </label>
                                        </div>
                                        <textarea
                                            rows={2}
                                            required
                                            value={data.current_address}
                                            onChange={(e) => setData('current_address', e.target.value)}
                                            placeholder="Present residential mailing address..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                    </div>

                                    {/* Province Dropdown */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Province <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={data.province}
                                            onChange={(e) => {
                                                const p = e.target.value;
                                                setData((prev) => ({
                                                    ...prev,
                                                    province: p,
                                                    district: regions[p]?.[0] || '',
                                                }));
                                            }}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition cursor-pointer"
                                        >
                                            {Object.keys(regions).map((prov) => (
                                                <option key={prov} value={prov}>
                                                    {prov}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* District Dropdown */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            District <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={data.district}
                                            onChange={(e) => setData('district', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition cursor-pointer"
                                        >
                                            {contactDistricts.map((dist) => (
                                                <option key={dist} value={dist}>
                                                    {dist}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Tehsil */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Tehsil <span className="text-slate-400 font-normal">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.tehsil}
                                            onChange={(e) => setData('tehsil', e.target.value)}
                                            placeholder="e.g. Model Town"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            City <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="e.g. Lahore"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                    </div>

                                    {/* Postal Code */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Postal / ZIP Code <span className="text-slate-400 font-normal">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                            placeholder="54000"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 3: ACADEMIC INFORMATION ================= */}
                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">3</span>
                                        Academic Information
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Enter your SSC/Matriculation and HSSC/Intermediate marks. Percentages are automatically computed as (Obtained ÷ Total × 100).
                                    </p>
                                </div>

                                {/* Section 3A: Matric / SSC Details */}
                                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Matric / SSC Details</h4>
                                        </div>
                                        {/* Auto Percentage Pill */}
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                                            <span>Matric Percentage:</span>
                                            <span className="text-sm font-extrabold">{matricPercentage}%</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Board Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={data.matric_board}
                                                onChange={(e) => setData('matric_board', e.target.value)}
                                                placeholder="e.g. BISE Lahore / Federal Board"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Roll Number <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={data.matric_roll_no}
                                                onChange={(e) => setData('matric_roll_no', e.target.value)}
                                                placeholder="e.g. 145920"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Registration Number <span className="text-slate-400 font-normal">(Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.matric_reg_no}
                                                onChange={(e) => setData('matric_reg_no', e.target.value)}
                                                placeholder="e.g. 2022-GR-491"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Passing Year <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="2010"
                                                max="2026"
                                                required
                                                value={data.matric_passing_year}
                                                onChange={(e) => setData('matric_passing_year', e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Total Marks <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={data.matric_total_marks}
                                                onChange={(e) => setData('matric_total_marks', e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Obtained Marks <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={data.matric_total_marks || 1100}
                                                required
                                                value={data.matric_obtained_marks}
                                                onChange={(e) => setData('matric_obtained_marks', e.target.value)}
                                                placeholder="e.g. 1020"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Grade / Division <span className="text-slate-400 font-normal">(Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.matric_grade}
                                                onChange={(e) => setData('matric_grade', e.target.value)}
                                                placeholder="e.g. A+ or 1st Division"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Status <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                value={data.matric_status}
                                                onChange={(e) => setData('matric_status', e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                            >
                                                <option value="Pass">Pass</option>
                                                <option value="Awaiting">Awaiting</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3B: Intermediate / HSSC Details */}
                                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Intermediate / HSSC Details</h4>
                                        </div>
                                        {/* Auto Percentage Pill */}
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                                            <span>HSSC Percentage:</span>
                                            <span className="text-sm font-extrabold">{interPercentage}%</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Board Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={data.inter_board}
                                                onChange={(e) => setData('inter_board', e.target.value)}
                                                placeholder="e.g. BISE Lahore / FBISE"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Roll Number <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={data.inter_roll_no}
                                                onChange={(e) => setData('inter_roll_no', e.target.value)}
                                                placeholder="e.g. 589211"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Registration Number <span className="text-slate-400 font-normal">(Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.inter_reg_no}
                                                onChange={(e) => setData('inter_reg_no', e.target.value)}
                                                placeholder="e.g. 2024-HSC-782"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                HSSC Group <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                value={data.inter_group}
                                                onChange={(e) => setData('inter_group', e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                            >
                                                <option value="Pre-Engineering">Pre-Engineering (FSc)</option>
                                                <option value="Pre-Medical">Pre-Medical (FSc)</option>
                                                <option value="ICS">ICS (Computer Science)</option>
                                                <option value="General Science">General Science</option>
                                                <option value="Arts / Humanities">Arts / Humanities (FA)</option>
                                                <option value="I.Com">I.Com (Commerce)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Passing Year <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="2012"
                                                max="2026"
                                                required
                                                value={data.inter_passing_year}
                                                onChange={(e) => setData('inter_passing_year', e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Total Marks <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={data.inter_total_marks}
                                                onChange={(e) => setData('inter_total_marks', e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Obtained Marks <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={data.inter_total_marks || 1100}
                                                required
                                                value={data.inter_obtained_marks}
                                                onChange={(e) => setData('inter_obtained_marks', e.target.value)}
                                                placeholder="e.g. 980"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                Status <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                value={data.inter_status}
                                                onChange={(e) => setData('inter_status', e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                            >
                                                <option value="Pass">Pass</option>
                                                <option value="Awaiting">Awaiting (Result Awaiting)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 4: QUOTA SELECTION ================= */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">4</span>
                                        Quota Selection & Academic Programme
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Select the quota category under which you want your merit to be calculated. Quotas are mutually exclusive.
                                    </p>
                                </div>

                                {/* Programme Selector */}
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Choose Academic Programme to Apply For <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.programme_id}
                                        onChange={(e) => setData('programme_id', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                    >
                                        {programmes.map((p) => {
                                            const isAlreadyApplied = appliedProgrammeIds.includes(p.id);
                                            return (
                                                <option key={p.id} value={p.id} disabled={isAlreadyApplied}>
                                                    {p.code} — {p.name} ({p.faculty}) {isAlreadyApplied ? '— [Already Applied]' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {errors.programme_id && <p className="text-rose-500 text-xs mt-1">{errors.programme_id}</p>}
                                </div>

                                {/* Quota Single-Select Radio Cards */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Admission Quota Category <span className="text-rose-500">* (Select exactly one)</span>
                                    </label>

                                    <div className="grid grid-cols-1 gap-3">
                                        {quotas.map((q) => {
                                            const isSelected = data.quota === q.id;

                                            return (
                                                <div
                                                    key={q.id}
                                                    onClick={() => setData('quota', q.id)}
                                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                                                        isSelected
                                                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 ring-2 ring-indigo-500/20 shadow-xs'
                                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3.5">
                                                        {/* Radio Circle */}
                                                        <div
                                                            className={`w-5 h-5 rounded-full mt-0.5 border flex items-center justify-center shrink-0 transition ${
                                                                isSelected
                                                                    ? 'border-indigo-600 bg-indigo-600'
                                                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                                                            }`}
                                                        >
                                                            {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                                    {q.title}
                                                                </h4>
                                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                                                    {q.badge}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                                                {q.description}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-2">
                                                                <span>📋 Verification requirement:</span>
                                                                <span>{q.requirement}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 5: DECLARATION ================= */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">5</span>
                                        Declaration & Final Submission
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Carefully review your application particulars. Once submitted, your application number will be officially registered.
                                    </p>
                                </div>

                                {/* Review Summary Card */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                                        <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-2">
                                            Applicant Particulars
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Full Name:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{data.full_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Father's Name:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{data.father_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">CNIC/B-Form:</span>
                                            <span className="font-mono font-semibold text-slate-900 dark:text-white">{data.cnic_bform}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Domicile:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{data.domicile_district}, {data.domicile_province}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Mobile / Email:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{data.phone} • {data.email}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                                        <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-2">
                                            Academic & Quota Selection
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Matric / SSC:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {data.matric_obtained_marks}/{data.matric_total_marks} ({matricPercentage}%)
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Intermediate:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {data.inter_obtained_marks}/{data.inter_total_marks} ({interPercentage}%)
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">HSSC Group:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{data.inter_group}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Applied Quota:</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                                {quotas.find((q) => q.id === data.quota)?.title || data.quota}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">University:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{data.university_name}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Read-Only System Details: Application ID & Submission Date */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                            System Generated Application ID <span className="text-slate-400 font-normal">(Read-only)</span>
                                        </label>
                                        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                            {prospectiveAppId}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                            Submission Date <span className="text-slate-400 font-normal">(Auto-filled on submit, read-only)</span>
                                        </label>
                                        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-sm">
                                            {todayFormatted} (Today)
                                        </div>
                                    </div>
                                </div>

                                {/* Declaration Checkbox */}
                                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            required
                                            checked={data.declaration_accepted}
                                            onChange={(e) => setData('declaration_accepted', e.target.checked)}
                                            className="w-5 h-5 rounded border-amber-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                                        />
                                        <div className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                                            <span className="font-bold uppercase tracking-wider block text-amber-900 dark:text-amber-300 mb-1">
                                                Solemn Declaration & Undertaking:
                                            </span>
                                            I hereby solemnly declare and affirm that all the particulars, personal information, contact credentials, and academic records entered in this application form are true, complete, and correct to the best of my knowledge and belief. I understand that any false statement or forged document will render my admission immediately canceled at any stage without notice.
                                        </div>
                                    </label>
                                    {errors.declaration_accepted && (
                                        <p className="text-rose-500 text-xs mt-2">{errors.declaration_accepted}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ================= STEP CONTROLS (BACK & SAVE & CONTINUE) ================= */}
                        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                            {/* Back Button */}
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition flex items-center gap-2 ${
                                    currentStep === 1
                                        ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-xs'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Back</span>
                            </button>

                            {/* Step Indicator text */}
                            <div className="text-xs text-slate-400 font-medium hidden sm:block">
                                Step {currentStep} of 5
                            </div>

                            {/* Next / Submit Button */}
                            {currentStep < 5 ? (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-none flex items-center gap-2 transition cursor-pointer"
                                >
                                    <span>Save & Continue</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!data.declaration_accepted || processing}
                                    className={`px-7 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition ${
                                        data.declaration_accepted && !processing
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none cursor-pointer'
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    <span>Submit Application</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
