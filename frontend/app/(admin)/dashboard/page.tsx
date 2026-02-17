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
    ArrowDownRight,
    Plus,
    Settings,
    LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { stocksAPI, usersAPI, iposAPI, newsAPI } from '@/lib/api';
import { Stock as StockType, IPO } from '@/lib/api';

interface DashboardStats {
    totalStocks: number;
    totalUsers: number;
    totalIPOs: number;
    totalNews: number;
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
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
        if (!user || user.role !== 'admin') {
            router.push('/login');
            return;
        }

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
    }, [user, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const statCards = [
        {
            title: 'Total Stocks',
            value: stats.totalStocks,
            icon: LineChart,
            accent: '#06b6d4',
            accentBg: 'rgba(6,182,212,0.1)',
            accentBorder: 'rgba(6,182,212,0.2)',
            href: '/stocks',
            label: 'Listed Securities',
        },
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            accent: '#10b981',
            accentBg: 'rgba(16,185,129,0.1)',
            accentBorder: 'rgba(16,185,129,0.2)',
            href: '/users',
            label: 'Registered Accounts',
        },
        {
            title: 'Active IPOs',
            value: stats.totalIPOs,
            icon: Briefcase,
            accent: '#a78bfa',
            accentBg: 'rgba(167,139,250,0.1)',
            accentBorder: 'rgba(167,139,250,0.2)',
            href: '/ipos',
            label: 'Public Offerings',
        },
        {
            title: 'News Articles',
            value: stats.totalNews,
            icon: Newspaper,
            accent: '#f59e0b',
            accentBg: 'rgba(245,158,11,0.1)',
            accentBorder: 'rgba(245,158,11,0.2)',
            href: '/news',
            label: 'Published Articles',
        },
    ];

    const quickActions = [
        { href: '/stocks', icon: LineChart, label: 'Manage Stocks', accent: '#06b6d4', accentBg: 'rgba(6,182,212,0.1)', accentBorder: 'rgba(6,182,212,0.2)' },
        { href: '/users', icon: Users, label: 'Manage Users', accent: '#10b981', accentBg: 'rgba(16,185,129,0.1)', accentBorder: 'rgba(16,185,129,0.2)' },
        { href: '/ipos', icon: Briefcase, label: 'Manage IPOs', accent: '#a78bfa', accentBg: 'rgba(167,139,250,0.1)', accentBorder: 'rgba(167,139,250,0.2)' },
        { href: '/news', icon: Newspaper, label: 'Manage News', accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.1)', accentBorder: 'rgba(245,158,11,0.2)' },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-2xl bg-cyan-400/10 border border-cyan-500/20 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Activity className="w-7 h-7 text-cyan-400 animate-pulse" />
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        {[0,1,2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
                * { font-family: 'DM Sans', sans-serif; }
                .mono { font-family: 'Space Mono', monospace; }
                .stat-card:hover .stat-arrow { transform: translate(2px, -2px); }
                .stat-arrow { transition: transform 0.2s ease; }
                .shimmer-border { position: relative; }
                .shimmer-border::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    padding: 1px;
                    background: linear-gradient(135deg, rgba(6,182,212,0.3), transparent 50%, rgba(6,182,212,0.1));
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }
            `}</style>

            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-5 bg-cyan-400 rounded-full" />
                        <span className="mono text-xs text-cyan-400/70 tracking-widest uppercase">Overview</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Monitor your platform performance</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="mono text-xs text-emerald-400">LIVE SYSTEM</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="stat-card group relative bg-[#0d1420] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300 overflow-hidden shimmer-border"
                            style={{animationDelay:`${index*80}ms`}}
                        >
                            {/* Ambient glow */}
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" style={{background: card.accent, transform: 'translate(50%, -50%)'}} />
                            
                            <div className="relative">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: card.accentBg, border: `1px solid ${card.accentBorder}`}}>
                                        <Icon className="w-5 h-5" style={{color: card.accent}} />
                                    </div>
                                    <ArrowUpRight className="stat-arrow w-4 h-4 text-slate-700 group-hover:text-slate-500" />
                                </div>
                                <div className="mono text-3xl font-bold text-white mb-1">{card.value.toLocaleString()}</div>
                                <div className="text-sm font-medium text-slate-400">{card.title}</div>
                                <div className="text-xs text-slate-600 mt-0.5">{card.label}</div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Top Stocks */}
                <div className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Top Performing Stocks</div>
                                <div className="text-xs text-slate-600">Live market data</div>
                            </div>
                        </div>
                        <Link href="/stocks" className="flex items-center gap-1 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors group">
                            View all
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>
                    <div className="p-4 space-y-2">
                        {recentStocks.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                                    <LineChart className="w-6 h-6 text-slate-700" />
                                </div>
                                <p className="text-sm text-slate-600">No stocks available</p>
                            </div>
                        ) : (
                            recentStocks.map((stock, index) => (
                                <div key={stock._id} className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="mono w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-[10px] text-cyan-400 font-bold">{index + 1}</div>
                                        <div>
                                            <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{stock.symbol}</div>
                                            <div className="text-xs text-slate-600 truncate max-w-[120px]">{stock.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="mono text-sm font-bold text-white">₹{stock.price?.toFixed(2)}</div>
                                        <div className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {stock.changePercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent IPOs */}
                <div className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-violet-400" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Recent IPOs</div>
                                <div className="text-xs text-slate-600">Public offerings</div>
                            </div>
                        </div>
                        <Link href="/ipos" className="flex items-center gap-1 text-xs text-violet-400/70 hover:text-violet-400 transition-colors group">
                            View all
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>
                    <div className="p-4 space-y-2">
                        {recentIPOs.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                                    <Briefcase className="w-6 h-6 text-slate-700" />
                                </div>
                                <p className="text-sm text-slate-600">No IPOs available</p>
                            </div>
                        ) : (
                            recentIPOs.map((ipo) => {
                                const statusConfig: Record<string, {bg: string, text: string, border: string}> = {
                                    open: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.25)' },
                                    upcoming: { bg: 'rgba(6,182,212,0.1)', text: '#06b6d4', border: 'rgba(6,182,212,0.25)' },
                                    closed: { bg: 'rgba(100,116,139,0.1)', text: '#94a3b8', border: 'rgba(100,116,139,0.25)' },
                                    allotted: { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
                                };
                                const sc = statusConfig[ipo.status] || statusConfig.closed;
                                return (
                                    <div key={ipo._id} className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-violet-500/10 border border-violet-500/20">
                                                <span className="mono text-xs font-bold text-violet-400">{ipo.symbol.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors">{ipo.symbol}</div>
                                                <div className="text-xs text-slate-600 truncate max-w-[120px]">{ipo.company}</div>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] mono font-bold uppercase tracking-wider" style={{background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`}}>
                                                {ipo.status}
                                            </span>
                                            <div className="mono text-xs text-slate-500 font-medium">₹{ipo.issuePrice}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-cyan-400/60 rounded-full" />
                        <span className="text-sm font-semibold text-white">Quick Actions</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 ml-3">Manage your platform content</p>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="group relative flex flex-col items-center justify-center p-5 rounded-xl border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 overflow-hidden"
                                >
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: `radial-gradient(circle at 50% 0%, ${action.accentBg}, transparent 70%)`}} />
                                    <div className="relative w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 duration-200" style={{background: action.accentBg, border: `1px solid ${action.accentBorder}`}}>
                                        <Icon className="w-5 h-5" style={{color: action.accent}} />
                                    </div>
                                    <span className="relative text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors text-center">{action.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}