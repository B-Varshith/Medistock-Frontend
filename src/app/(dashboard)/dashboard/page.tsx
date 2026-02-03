'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { TrendingUp, AlertTriangle, Package, DollarSign } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalMedicines: 0,
        lowStock: 0,
        expiringSoon: 0,
        totalSales: 0,
    });

    useEffect(() => {
        // In a real app, I'd fetch these from a dedicated stats endpoint.
        // For now, I'll simulate or fetch basic lists to count.
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/medicines');
                if (data.success) {
                    const meds = data.data;
                    const lowStock = meds.filter((m: any) => m.quantity < 10).length;
                    // Expiry logic logic would happen here or backend
                    setStats(prev => ({ ...prev, totalMedicines: meds.length, lowStock }));
                }
            } catch (error) {
                console.error('Failed to fetch stats');
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 mt-2 text-lg">Your pharmacy inventory at a glance</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Medicines"
                    value={stats.totalMedicines}
                    icon={Package}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    trend="+12% from last month"
                />
                <StatCard
                    title="Low Stock Alert"
                    value={stats.lowStock}
                    icon={TrendingUp}
                    color="bg-gradient-to-br from-amber-500 to-amber-600"
                    trend="Requires attention"
                    alert={stats.lowStock > 0}
                />
                <StatCard
                    title="Expiring Soon"
                    value={stats.expiringSoon}
                    icon={AlertTriangle}
                    color="bg-gradient-to-br from-red-500 to-red-600"
                    trend="Action needed"
                    alert={stats.expiringSoon > 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 glass-panel p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Recent Inventory Movements</h3>
                        <button className="text-sm text-sky-600 font-medium hover:text-sky-700">View All</button>
                    </div>

                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                        <Package size={48} className="mb-4 opacity-20" />
                        <p>No recent stock movements recorded</p>
                    </div>
                </div>

                <div className="glass-panel p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h3>
                    <div className="space-y-4">
                        <Link href="/inventory" className="w-full group p-4 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50 transition-all duration-200 flex items-center gap-4 text-left">
                            <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                <Package size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 group-hover:text-sky-700">Add Stock</h4>
                                <p className="text-xs text-slate-500">Register new medicine batches</p>
                            </div>
                        </Link>

                        <Link href="/inventory" className="w-full group p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all duration-200 flex items-center gap-4 text-left">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 group-hover:text-amber-700">Check Expiry</h4>
                                <p className="text-xs text-slate-500">Review expiring medicines</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, trend, alert }: any) {
    return (
        <div className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <Icon size={80} />
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl text-white ${color} shadow-lg`}>
                    <Icon size={24} />
                </div>
                <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">{title}</h3>
            </div>

            <div className="mt-2">
                <p className="text-4xl font-bold text-slate-800">{value}</p>
                <p className={`text-sm mt-2 font-medium flex items-center gap-1 ${alert ? 'text-red-500' : 'text-emerald-600'}`}>
                    {trend}
                </p>
            </div>
        </div>
    );
}
