'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LayoutDashboard, Pill, Users, ShoppingCart, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/inventory', label: 'Medicine Stock', icon: Pill }, // Renamed for clarity
        { href: '/suppliers', label: 'Suppliers', icon: Users },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    return (
        <aside className="w-72 h-[calc(100vh-2rem)] m-4 flex flex-col sticky top-4">
            <div className="glass-panel h-full flex flex-col overflow-hidden">
                <div className="p-8 border-b border-gray-100/50 flex flex-col items-center">
                    <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600 mb-3 shadow-sm">
                        <Pill size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                        MediStock
                    </h2>
                    <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">Inventory Manager</p>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    'flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group',
                                    isActive
                                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-200'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                )}
                            >
                                <Icon size={20} className={clsx(isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600')} />
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl w-full transition-all duration-200 group"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
