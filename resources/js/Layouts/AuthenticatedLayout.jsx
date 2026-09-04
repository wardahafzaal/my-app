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

    const [sidebarOpen, setSidebarOpen] = useState(false);


    // Sidebar navigation items required:
    // Dashboard, Student Profile, Profile Builder, Universities, Applications, Documents, Settings
    const navigationItems = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Student Profile',
            href: route('student.profile.edit'),
            active: route().current('student.profile.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            name: 'Profile Builder',
            href: route('profile.builder'),
            active: route().current('profile.builder*'),
            badge: '5-Step',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
        },
        {
            name: 'Universities',
            href: route('universities.index'),
            active: route().current('universities.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
        {
            name: 'Applications',
            href: route('applications.index'),
            active: route().current('applications.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            name: 'Documents',
            href: route('documents.index'),
            active: route().current('documents.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            name: 'Settings',
            href: route('profile.edit'),
            active: route().current('profile.edit'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col md:flex-row">
            {/* ================= DESKTOP SIDEBAR ================= */}
            <aside className="hidden md:flex md:w-64 md:flex-col shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen z-30 transition-colors duration-200">
                {/* Brand Header */}
                <div className="h-16 px-5 flex items-center border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50">
                            CM
                        </div>
                        <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            Campus<span className="text-indigo-600 dark:text-indigo-400">Sync</span>
                        </span>
                    </Link>
                </div>

                {/* Sidebar Navigation Links */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Main Navigation
                    </div>

                    {navigationItems.map((item) => {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                                    item.active
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={item.active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                                        {item.icon}
                                    </span>
                                    <span>{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Staff Views for Officer & Coordinator */}
                    {(user?.role === 'admissions_officer' || user?.role === 'programme_coordinator') && (
                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
                            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Staff Management
                            </div>
                            <Link
                                href={route('admissions.dashboard')}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                                    route().current('admissions.dashboard')
                                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span>📋</span>
                                <span>Admissions Queue</span>
                            </Link>
                            <Link
                                href={route('merit-list.index')}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                                    route().current('merit-list.index')
                                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span>🏛️</span>
                                <span>Merit Lists</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sidebar Footer User Info */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ================= MAIN CONTENT AREA ================= */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header Bar */}
                <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-xs sticky top-0 z-30 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between items-center">
                            {/* Mobile Hamburger + Title */}
                            <div className="flex items-center gap-3 md:hidden">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <Link href="/" className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                                        CM
                                    </div>
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">CampusSync</span>
                                </Link>
                            </div>

                            {/* Breadcrumb / Section Label for Desktop */}
                            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <span>Portal</span>
                                <span>/</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    Student Admission Management
                                </span>
                            </div>

                            {/* Right Actions: Theme Toggle + Role Switcher + User Dropdown */}
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                {/* Theme Toggle */}
                                <ThemeToggle />


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
                                            <span className="hidden sm:inline">{user?.name}</span>
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
                        </div>
                    </div>

                    {/* Mobile Navigation Drawer */}
                    {sidebarOpen && (
                        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                                        item.active
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span>{item.name}</span>
                                    {item.badge && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </nav>

                {/* Global Flash Alerts */}
                {flash?.status && (
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
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
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
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

                {/* Page Header (if passed) */}
                {header && (
                    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
                        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
