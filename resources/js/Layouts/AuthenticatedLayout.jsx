import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const switchRole = (role) => {
        router.post(route('dev.switch-role', role));
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admissions_officer':
                return { label: 'Admissions Officer', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700' };
            case 'programme_coordinator':
                return { label: 'Programme Coordinator', bg: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700' };
            case 'applicant':
            default:
                return { label: 'Applicant', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700' };
        }
    };

    const roleBadge = getRoleBadge(user?.role);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
            <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-xs sticky top-0 z-40 transition-colors duration-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center space-x-8">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2.5 group">
                                    <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-900/50">
                                        CM
                                    </div>
                                    <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                        Campus<span className="text-indigo-600 dark:text-indigo-400">Sync</span>
                                    </span>
                                </Link>
                            </div>

                            {/* Desktop Role-Based Navigation */}
                            <div className="hidden space-x-6 sm:-my-px sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>

                                {user?.role === 'applicant' && (
                                    <>
                                        <NavLink
                                            href={route('student.profile.edit')}
                                            active={route().current('student.profile.edit')}
                                        >
                                            Student Profile
                                        </NavLink>
                                        <NavLink
                                            href={route('applications.index')}
                                            active={route().current('applications.*') && !route().current('applications.create')}
                                        >
                                            My Applications
                                        </NavLink>
                                        <NavLink
                                            href={route('applications.create')}
                                            active={route().current('applications.create')}
                                        >
                                            Apply for Programme
                                        </NavLink>
                                    </>
                                )}

                                {user?.role === 'admissions_officer' && (
                                    <>
                                        <NavLink
                                            href={route('admissions.dashboard')}
                                            active={route().current('admissions.dashboard')}
                                        >
                                            Admissions Queue
                                        </NavLink>
                                        <NavLink
                                            href={route('applications.index')}
                                            active={route().current('applications.index')}
                                        >
                                            All Applications
                                        </NavLink>
                                        <NavLink
                                            href={route('merit-list.index')}
                                            active={route().current('merit-list.index')}
                                        >
                                            Merit Lists
                                        </NavLink>
                                    </>
                                )}

                                {user?.role === 'programme_coordinator' && (
                                    <>
                                        <NavLink
                                            href={route('merit-list.index')}
                                            active={route().current('merit-list.index')}
                                        >
                                            Merit Lists & Rankings
                                        </NavLink>
                                        <NavLink
                                            href={route('applications.index')}
                                            active={route().current('applications.index')}
                                        >
                                            Programme Applications
                                        </NavLink>
                                        <NavLink
                                            href={route('admissions.dashboard')}
                                            active={route().current('admissions.dashboard')}
                                        >
                                            Admissions Overview
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right side: Theme Toggle + Role switcher + User dropdown */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-3">
                            {/* Dark/Light Mode Toggle */}
                            <ThemeToggle />

                            {/* Persona Switcher widget */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border shadow-xs transition hover:opacity-90 cursor-pointer ${roleBadge.bg}`}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                                            Role: {roleBadge.label}
                                            <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content width="56">
                                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                            Switch Test Persona:
                                        </div>
                                        <button
                                            onClick={() => switchRole('applicant')}
                                            className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between ${user?.role === 'applicant' ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                        >
                                            <span>🎓 Applicant (Ahmed Khan)</span>
                                            {user?.role === 'applicant' && <span>✓</span>}
                                        </button>
                                        <button
                                            onClick={() => switchRole('admissions_officer')}
                                            className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between ${user?.role === 'admissions_officer' ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                        >
                                            <span>📋 Admissions Officer (Fatima Noor)</span>
                                            {user?.role === 'admissions_officer' && <span>✓</span>}
                                        </button>
                                        <button
                                            onClick={() => switchRole('programme_coordinator')}
                                            className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between ${user?.role === 'programme_coordinator' ? 'font-bold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                        >
                                            <span>🏛️ Coordinator (Dr. Usman)</span>
                                            {user?.role === 'programme_coordinator' && <span>✓</span>}
                                        </button>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* User Menu */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-colors duration-200"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 flex items-center justify-center font-semibold text-xs mr-2">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        {user?.name}
                                        <svg
                                            className="-me-0.5 ms-2 h-4 w-4 text-slate-400 dark:text-slate-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Account Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile: Theme Toggle + Menu Button */}
                        <div className="-me-2 flex items-center gap-2 sm:hidden">
                            <ThemeToggle />
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-500 dark:hover:text-slate-300 focus:outline-none transition-colors duration-200"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Responsive Navigation */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-slate-200 dark:border-slate-800 transition-colors duration-200'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>

                        {user?.role === 'applicant' && (
                            <>
                                <ResponsiveNavLink href={route('student.profile.edit')} active={route().current('student.profile.edit')}>
                                    Student Profile
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('applications.index')} active={route().current('applications.index')}>
                                    My Applications
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('applications.create')} active={route().current('applications.create')}>
                                    Apply for Programme
                                </ResponsiveNavLink>
                            </>
                        )}

                        {user?.role === 'admissions_officer' && (
                            <>
                                <ResponsiveNavLink href={route('admissions.dashboard')} active={route().current('admissions.dashboard')}>
                                    Admissions Queue
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('applications.index')} active={route().current('applications.index')}>
                                    All Applications
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('merit-list.index')} active={route().current('merit-list.index')}>
                                    Merit Lists
                                </ResponsiveNavLink>
                            </>
                        )}

                        {user?.role === 'programme_coordinator' && (
                            <>
                                <ResponsiveNavLink href={route('merit-list.index')} active={route().current('merit-list.index')}>
                                    Merit Lists
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('applications.index')} active={route().current('applications.index')}>
                                    Applications
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 pb-3 pt-4 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{user?.email}</div>
                        <div className="flex gap-2 mb-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge.bg}`}>
                                {roleBadge.label}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Account Settings</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Global Flash Alerts */}
            {flash?.status && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs transition-colors duration-200">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">{flash.status}</span>
                        </div>
                    </div>
                </div>
            )}

            {flash?.error && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center justify-between shadow-xs transition-colors duration-200">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">{flash.error}</span>
                        </div>
                    </div>
                </div>
            )}

            {header && (
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
