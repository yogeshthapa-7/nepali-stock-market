'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Users,
    LineChart,
    Newspaper,
    Briefcase,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { stocksAPI, usersAPI, iposAPI, newsAPI } from '@/lib/api';
import { Stock as StockType, User, IPO, News } from '@/lib/api';

interface DashboardStats {
    totalStocks: number;
    totalUsers: number;
    totalIPOs: number;
    totalNews: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalStocks: 0,
        totalUsers: 0,
        totalIPOs: 0,
        totalNews: 0,
    });
    const [recentStocks, setRecentStocks] = useState<StockType[]>([]);
    const [recentIPOs, setRecentIPOs] = useState<IPO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stocksData, usersData, iposData, newsData] = await Promise.all([
                    stocksAPI.getAll(),
                    usersAPI.getAll(),
                    iposAPI.getAll(),
                    newsAPI.getAll({ limit: 5 }),
                ]);

                setStats({
                    totalStocks: stocksData.count,
                    totalUsers: usersData.length,
                    totalIPOs: iposData.count,
                    totalNews: newsData.total,
                });

                setRecentStocks(stocksData.stocks.slice(0, 5));
                setRecentIPOs(iposData.ipos.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        {
            title: 'Total Stocks',
            value: stats.totalStocks,
            icon: LineChart,
            gradient: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            href: '/stocks',
        },
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            gradient: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            href: '/users',
        },
        {
            title: 'Active IPOs',
            value: stats.totalIPOs,
            icon: Briefcase,
            gradient: 'from-violet-500 to-violet-600',
            bgColor: 'bg-violet-50',
            iconColor: 'text-violet-600',
            href: '/ipos',
        },
        {
            title: 'News Articles',
            value: stats.totalNews,
            icon: Newspaper,
            gradient: 'from-amber-500 to-amber-600',
            bgColor: 'bg-amber-50',
            iconColor: 'text-amber-600',
            href: '/news',
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-600 mt-1">Welcome back to your admin portal</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
                        <Activity className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-slate-700">Live Market</span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={card.title}
                                href={card.href}
                                className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`${card.bgColor} p-3 rounded-xl`}>
                                            <Icon className={`w-6 h-6 ${card.iconColor}`} />
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                                    <p className="text-3xl font-bold text-slate-900">{card.value.toLocaleString()}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Stocks */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <BarChart3 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Top Performing Stocks</h2>
                                </div>
                                <Link href="/stocks" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    View All
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentStocks.length === 0 ? (
                                    <div className="text-center py-8">
                                        <LineChart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 text-sm">No stocks available</p>
                                    </div>
                                ) : (
                                    recentStocks.map((stock, index) => (
                                        <div key={stock._id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 font-bold text-slate-600 text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{stock.symbol}</p>
                                                    <p className="text-sm text-slate-500">{stock.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900 text-lg">₹{stock.price.toFixed(2)}</p>
                                                <div className={`flex items-center justify-end gap-1 text-sm font-semibold ${stock.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {stock.changePercent >= 0 ? (
                                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <ArrowDownRight className="w-3.5 h-3.5" />
                                                    )}
                                                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent IPOs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-violet-100 p-2 rounded-lg">
                                        <Briefcase className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Recent IPOs</h2>
                                </div>
                                <Link href="/ipos" className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                                    View All
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentIPOs.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 text-sm">No IPOs available</p>
                                    </div>
                                ) : (
                                    recentIPOs.map((ipo) => (
                                        <div key={ipo._id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 font-bold text-violet-600 text-sm">
                                                    {ipo.symbol.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">{ipo.symbol}</p>
                                                    <p className="text-sm text-slate-500">{ipo.company}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                    ipo.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                                                    ipo.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                                    ipo.status === 'closed' ? 'bg-slate-100 text-slate-700' :
                                                    'bg-violet-100 text-violet-700'
                                                }`}>
                                                    {ipo.status.toUpperCase()}
                                                </span>
                                                <p className="text-sm text-slate-500 mt-2 font-semibold">₹{ipo.issuePrice}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
                        <p className="text-sm text-slate-600 mt-1">Manage your platform content</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link
                                href="/stocks/new"
                                className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                            >
                                <div className="bg-blue-100 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                                    <LineChart className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">Add Stock</span>
                            </Link>
                            <Link
                                href="/users/new"
                                className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200"
                            >
                                <div className="bg-emerald-100 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6 text-emerald-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600">Add User</span>
                            </Link>
                            <Link
                                href="/ipos/new"
                                className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-all duration-200"
                            >
                                <div className="bg-violet-100 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                                    <Briefcase className="w-6 h-6 text-violet-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-violet-600">Add IPO</span>
                            </Link>
                            <Link
                                href="/news/new"
                                className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all duration-200"
                            >
                                <div className="bg-amber-100 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                                    <Newspaper className="w-6 h-6 text-amber-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-amber-600">Add News</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}