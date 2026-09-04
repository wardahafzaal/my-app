import InputError from '@/Components/InputError';
import ThemeToggle from '@/Components/ThemeToggle';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Simple interactive security code / captcha
    const [captchaCode, setCaptchaCode] = useState('');
    const [userCaptcha, setUserCaptcha] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaCode(code);
        setUserCaptcha('');
        setCaptchaError('');
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const submit = (e) => {
        e.preventDefault();

        // Validate security code / captcha
        if (userCaptcha.trim().toUpperCase() !== captchaCode) {
            setCaptchaError('Security code does not match. Please try again.');
            generateCaptcha();
            return;
        }

        setCaptchaError('');
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-800 dark:text-slate-100 transition-colors duration-200">
            <Head title="Sign In — Student Admission Portal" />

            {/* University Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3.5 group">
                        {/* University Emblem / Logo */}
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-800 to-indigo-950 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-900/10 border border-blue-700/30 group-hover:scale-105 transition">
                            <span className="tracking-tighter">NU</span>
                        </div>
                        <div>
                            <div className="text-lg font-extrabold text-blue-950 dark:text-white tracking-tight leading-tight flex items-center gap-2">
                                <span>National University</span>
                                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                    Admissions 2026
                                </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Student Admission Management Portal (Module 1)
                            </div>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="flex items-center gap-4 text-xs font-semibold">
                            <Link
                                href="/"
                                className="hidden sm:flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 transition"
                            >
                                <span>University Home</span>
                            </Link>
                            <span className="hidden sm:inline-block text-slate-300 dark:text-slate-600">|</span>
                            <a
                                href="#help"
                                className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                            >
                                Helpdesk: (042) 111-864-864
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left/Center Column: The Sign In Card (7 cols on lg) */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 transition-colors duration-200">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Sign In to Your Account
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Access your standard student profile, programme applications, and verification status.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Email Address <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="applicant@campus.edu"
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 text-sm py-2.5 px-3.5 focus:border-blue-600 focus:ring-blue-600 shadow-xs"
                                        autoComplete="username"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Password <span className="text-rose-500">*</span>
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your account password"
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 text-sm py-2.5 px-3.5 pr-10 focus:border-blue-600 focus:ring-blue-600 shadow-xs"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            {/* Security Code / Captcha Field */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Security Code (Captcha) <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    {/* Stylized Captcha Display Box */}
                                    <div className="relative flex items-center justify-center px-4 py-2 bg-linear-to-r from-slate-100 to-blue-50 dark:from-slate-800 dark:to-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl select-none shrink-0">
                                        <span className="font-mono font-black tracking-widest text-lg text-blue-950 line-through decoration-blue-400 decoration-1 italic">
                                            {captchaCode}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={generateCaptcha}
                                            className="ml-2 text-slate-400 hover:text-blue-700 transition"
                                            title="Regenerate Security Code"
                                        >
                                            🔄
                                        </button>
                                    </div>

                                    {/* Captcha Input */}
                                    <input
                                        type="text"
                                        maxLength={5}
                                        value={userCaptcha}
                                        onChange={(e) => setUserCaptcha(e.target.value.toUpperCase())}
                                        placeholder="Enter code above"
                                        className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 text-sm py-2.5 px-3.5 uppercase font-mono tracking-wider focus:border-blue-600 focus:ring-blue-600 shadow-xs"
                                        required
                                    />
                                </div>
                                {captchaError && (
                                    <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">
                                        <span>⚠️</span> {captchaError}
                                    </p>
                                )}
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Enter the 5 characters shown above to verify you are a human applicant.
                                </p>
                            </div>

                            {/* Remember Me checkbox */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-blue-700 focus:ring-blue-600 shadow-xs w-4 h-4"
                                    />
                                    <span className="ms-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                        Keep me signed in on this device
                                    </span>
                                </label>
                            </div>

                            {/* Buttons Side by Side */}
                            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                <Link
                                    href={route('register')}
                                    className="w-full inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition text-center"
                                >
                                    Create new account
                                </Link>
                            </div>

                            {/* Forgot Password Link Below */}
                            {canResetPassword && (
                                <div className="pt-2 text-center">
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            )}
                        </form>

                    </div>

                    {/* Right Column: Helpful Information Panel (5 cols on lg) */}
                    <div id="help" className="lg:col-span-5 space-y-4">
                        {/* Panel 1: Undergraduate Programs */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors duration-200">
                            <div className="flex items-center gap-2.5 mb-3 text-blue-900 dark:text-blue-300">
                                <span className="text-lg">📚</span>
                                <h3 className="text-sm font-bold uppercase tracking-wider">
                                    Undergraduate Programs
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                                Applications are currently open for the Fall 2026 intake across the following faculties:
                            </p>
                            <ul className="space-y-2 text-xs">
                                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                    <span className="font-semibold">BS Computer Science (BSCS)</span>
                                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">4 Years</span>
                                </li>
                                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                    <span className="font-semibold">BS Software Engineering (BSSE)</span>
                                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">4 Years</span>
                                </li>
                                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                    <span className="font-semibold">BS Data Science (BSDS)</span>
                                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">4 Years</span>
                                </li>
                                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                    <span className="font-semibold">Bachelor of Business Admin (BBA)</span>
                                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">4 Years</span>
                                </li>
                                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                    <span className="font-semibold">BS Electrical Engineering (BSEE)</span>
                                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">4 Years</span>
                                </li>
                            </ul>
                        </div>

                        {/* Panel 2: Required Documents */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors duration-200">
                            <div className="flex items-center gap-2.5 mb-2 text-indigo-900 dark:text-indigo-300">
                                <span className="text-lg">📋</span>
                                <h3 className="text-sm font-bold uppercase tracking-wider">
                                    Required Documents Checklist
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                                Please ensure you have scanned copies in <strong>PDF, JPG, or PNG</strong> format:
                            </p>
                            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-500">✓</span>
                                    <span>Original CNIC or NADRA B-Form copy</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-500">✓</span>
                                    <span>Intermediate / Equivalent Marksheet</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-500">✓</span>
                                    <span>Matriculation Certificate / O-Level Equivalence</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-500">✓</span>
                                    <span>Paid Bank Fee Challan</span>
                                </div>
                            </div>
                        </div>

                        {/* Panel 3: Need Help? */}
                        <div className="bg-linear-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xs">
                            <div className="flex items-center gap-2.5 mb-2">
                                <span className="text-lg">💬</span>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-100">
                                    Need Help?
                                </h3>
                            </div>
                            <p className="text-xs text-blue-200/90 leading-relaxed mb-4">
                                Our Admissions Office is available Monday to Friday, 9:00 AM – 4:00 PM PST to assist you with queries.
                            </p>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-300">📞</span>
                                    <span>Helpline: +92 (42) 111-864-864</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-300">✉️</span>
                                    <span>admissions@nationalcampus.edu.pk</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-300">📍</span>
                                    <span>Admissions Directorate, Block A, Main Campus</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* University Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                        © 2026 National University. All rights reserved. • Campus Management System
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <a href="#help" className="hover:text-blue-700 dark:hover:text-blue-400">Admission Rules</a>
                        <span>•</span>
                        <a href="#help" className="hover:text-blue-700 dark:hover:text-blue-400">Eligibility Criteria</a>
                        <span>•</span>
                        <a href="#help" className="hover:text-blue-700 dark:hover:text-blue-400">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
