'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    TrendingUp,
    TrendingDown,
    BarChart2,
    Briefcase,
    Wallet,
    User,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Home,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Building2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    PieChart,
    LineChart,
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { stocksAPI, iposAPI, newsAPI, portfolioAPI, Stock, IPO, News, Portfolio } from '@/lib/api';

export default function UserDashboard() {
    const router = useRouter();
    const { user, logout, isLoading: authLoading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    const [stocks, setStocks] = useState<Stock[]>([]);
    const [ipos, setIpos] = useState<IPO[]>([]);
    const [news, setNews] = useState<News[]>([]);
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);

    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedIpo, setSelectedIpo] = useState<IPO | null>(null);
    const [sharesToApply, setSharesToApply] = useState(0);
    const [applying, setApplying] = useState(false);
    const [applyMessage, setApplyMessage] = useState('');

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        dpNumber: '',
        boid: '',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [stocksRes, iposRes, newsRes, portfolioRes] = await Promise.all([
                stocksAPI.getAll({ sort: 'name' }),
                iposAPI.getAll({}),
                newsAPI.getAll({ limit: 10 }),
                portfolioAPI.get().catch(() => ({ portfolio: null })),
            ]);

            setStocks(stocksRes.stocks || []);
            setIpos(iposRes.ipos || []);
            setNews(newsRes.news || []);
            setPortfolio(portfolioRes.portfolio);

            if (portfolioRes.portfolio) {
                setProfileData({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: '',
                    dpNumber: '',
                    boid: '',
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyIpo = async () => {
        if (!selectedIpo || sharesToApply < selectedIpo.minApplication) {
            setApplyMessage(`Minimum ${selectedIpo?.minApplication} shares required`);
            return;
        }
        if (sharesToApply > selectedIpo.maxApplication) {
            setApplyMessage(`Maximum ${selectedIpo.maxApplication} shares allowed`);
            return;
        }
        try {
            setApplying(true);
            setApplyMessage('');
            await iposAPI.apply(selectedIpo.symbol, sharesToApply);
            setApplyMessage('Application submitted successfully!');
            setShowApplyModal(false);
            fetchData();
        } catch (error: any) {
            setApplyMessage(error.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
        open:     { bg: 'rgba(16,185,129,0.1)',  text: '#10b981', border: 'rgba(16,185,129,0.25)',  dot: '#10b981' },
        upcoming: { bg: 'rgba(6,182,212,0.1)',   text: '#06b6d4', border: 'rgba(6,182,212,0.25)',   dot: '#06b6d4' },
        closed:   { bg: 'rgba(100,116,139,0.1)', text: '#94a3b8', border: 'rgba(100,116,139,0.25)', dot: '#94a3b8' },
        allotted: { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa', border: 'rgba(167,139,250,0.25)', dot: '#a78bfa' },
    };

    const getIpoStatusBadge = (status: string) => {
        const sc = statusConfig[status] || statusConfig.closed;
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mono text-[10px] font-bold uppercase tracking-wider" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                {status}
            </span>
        );
    };

    const getApplicationStatus = (ipoId: string) => {
        if (!portfolio) return null;
        const applied = portfolio.appliedIPOs.find(app => app.ipoId._id === ipoId);
        if (applied) return { status: 'applied', shares: applied.sharesApplied, date: applied.applicationDate };
        const allotted = portfolio.allottedIPOs.find(app => app.ipoId._id === ipoId);
        if (allotted) return { status: 'allotted', shares: allotted.sharesApplied, date: allotted.applicationDate };
        const notAllotted = portfolio.notAllottedIPOs.find(app => app.ipoId._id === ipoId);
        if (notAllotted) return { status: 'not_allotted', shares: notAllotted.sharesApplied, date: notAllotted.applicationDate };
        return null;
    };

    const marketStats = stocks.length > 0 ? {
        totalStocks: stocks.length,
        totalVolume: stocks.reduce((acc, s) => acc + (s.volume || 0), 0),
        avgChange: stocks.reduce((acc, s) => acc + (s.changePercent || 0), 0) / stocks.length,
        gainers: stocks.filter(s => s.change > 0).length,
        losers: stocks.filter(s => s.change < 0).length,
    } : { totalStocks: 0, totalVolume: 0, avgChange: 0, gainers: 0, losers: 0 };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'portfolio', label: 'Portfolio', icon: Wallet },
        { id: 'ipos', label: 'IPO', icon: Briefcase },
        { id: 'market', label: 'Market', icon: BarChart2 },
        { id: 'news', label: 'News', icon: FileText },
    ];

    const categoryColorMap: Record<string, { bg: string; text: string }> = {
        market:    { bg: 'rgba(6,182,212,0.1)',   text: '#06b6d4' },
        ipo:       { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa' },
        corporate: { bg: 'rgba(16,185,129,0.1)',  text: '#10b981' },
        economy:   { bg: 'rgba(245,158,11,0.1)',  text: '#f59e0b' },
        analysis:  { bg: 'rgba(20,184,166,0.1)',  text: '#14b8a6' },
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 bg-emerald-400/15 rounded-2xl blur-sm animate-pulse" />
                        <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080c14] text-slate-100">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
                * { font-family: 'DM Sans', sans-serif; }
                .mono { font-family: 'Space Mono', monospace; }
                .glass-header { background: rgba(8,12,20,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
                .glass-sidebar { background: rgba(8,12,20,0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
                .grid-bg {
                    background-image: linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .sidebar-link-active {
                    background: linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%);
                    border-left: 2px solid #10b981;
                    color: #10b981;
                }
                .sidebar-link:hover { background: linear-gradient(90deg, rgba(16,185,129,0.08) 0%, transparent 100%); }
                .table-row:hover { background: rgba(255,255,255,0.025); }
                .form-input {
                    width: 100%; padding: 10px 14px;
                    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px; color: white; font-size: 14px; transition: all 0.2s; outline: none;
                }
                .form-input:focus { border-color: rgba(16,185,129,0.5); background: rgba(16,185,129,0.04); box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
                .form-input::placeholder { color: rgba(148,163,184,0.5); }
                .card-glass { background: rgba(13,20,32,0.8); border: 1px solid rgba(255,255,255,0.07); }
                @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeSlideIn 0.35s ease forwards; }
            `}</style>

            {/* Top Header */}
            <header className="glass-header border-b border-white/[0.06] sticky top-0 z-50">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-[60px]">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg md:hidden transition-colors">
                                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                            <Link href="/user-dashboard" className="flex items-center gap-3 group">
                                <div className="relative w-9 h-9">
                                    <div className="absolute inset-0 bg-emerald-400/20 rounded-xl blur-sm group-hover:bg-emerald-400/30 transition-colors" />
                                    <div className="relative w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
                                    </div>
                                </div>
                                <div>
                                    <span className="mono text-sm font-bold text-white tracking-wider">MeroShare</span>
                                    <div className="text-[10px] text-emerald-400/70 tracking-[0.2em] uppercase">Investor Portal</div>
                                </div>
                            </Link>
                        </div>

                        <div className="hidden md:flex flex-1 max-w-sm mx-8">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    type="text"
                                    placeholder="Search stocks, IPOs..."
                                    className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.12] focus:border-emerald-500/40 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1.5 mr-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="mono text-[10px] text-emerald-400">LIVE</span>
                            </div>
                            <button className="relative p-2 text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] rounded-lg transition-colors">
                                <Bell className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            </button>
                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="flex items-center gap-2.5 hover:bg-white/[0.05] rounded-xl px-2.5 py-1.5 transition-all group"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400/30 to-teal-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                                    <span className="mono text-xs font-bold text-emerald-400">{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="hidden md:block text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">{user.name}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`fixed md:static inset-y-0 left-0 z-40 w-60 glass-sidebar border-r border-white/[0.06] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <nav className="p-3 pt-20 md:pt-5">
                        <div className="mb-4 px-3">
                            <span className="text-[10px] font-semibold text-slate-600 tracking-[0.2em] uppercase">Navigation</span>
                        </div>
                        <ul className="space-y-0.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                                            className={`sidebar-link w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive ? 'sidebar-link-active' : 'text-slate-500 hover:text-slate-200'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-500/15' : 'bg-white/[0.03] group-hover:bg-white/[0.06]'}`}>
                                                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                            </div>
                                            <span className="text-sm font-medium">{item.label}</span>
                                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                        </button>
                                    </li>
                                );
                            })}
                            <li className="pt-4 mt-2 border-t border-white/[0.06]">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                        <LogOut className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">Sign Out</span>
                                </button>
                            </li>
                        </ul>

                        {/* User badge */}
                        <div className="mt-4 mx-1 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400/30 to-teal-500/20 flex items-center justify-center">
                                    <span className="mono text-xs font-bold text-emerald-400">{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                                </div>
                                <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                            </div>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 grid-bg min-h-[calc(100vh-60px)] p-4 md:p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                                </div>
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ─── Dashboard Tab ─── */}
                            {activeTab === 'dashboard' && (
                                <div className="space-y-5 fade-in">
                                    {/* Welcome Banner */}
                                    <div className="relative overflow-hidden rounded-2xl p-6 bg-[#0d1420] border border-white/[0.07]">
                                        <div className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(16,185,129,0.12), transparent 60%)' }} />
                                        <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.06]" style={{ background: 'radial-gradient(circle, #10b981, transparent)', borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
                                        <div className="relative flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1 h-5 bg-emerald-400 rounded-full" />
                                                    <span className="mono text-[10px] text-emerald-400/70 tracking-widest uppercase">Welcome Back</span>
                                                </div>
                                                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Market is <span className={marketStats.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>{marketStats.avgChange >= 0 ? 'trending up' : 'trending down'}</span> today
                                                </p>
                                            </div>
                                            <div className="hidden sm:flex flex-col items-end gap-1">
                                                <div className="mono text-xs text-slate-600">AVG CHANGE</div>
                                                <div className={`mono text-2xl font-bold ${marketStats.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {marketStats.avgChange >= 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Market Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {[
                                            { label: 'Stocks', value: marketStats.totalStocks, accent: '#06b6d4', accentBg: 'rgba(6,182,212,0.1)', accentBorder: 'rgba(6,182,212,0.2)', icon: BarChart2 },
                                            { label: 'Gainers', value: marketStats.gainers, accent: '#10b981', accentBg: 'rgba(16,185,129,0.1)', accentBorder: 'rgba(16,185,129,0.2)', icon: TrendingUp },
                                            { label: 'Losers', value: marketStats.losers, accent: '#f87171', accentBg: 'rgba(248,113,113,0.1)', accentBorder: 'rgba(248,113,113,0.2)', icon: TrendingDown },
                                            { label: 'Avg Δ', value: `${marketStats.avgChange >= 0 ? '+' : ''}${marketStats.avgChange.toFixed(2)}%`, accent: marketStats.avgChange >= 0 ? '#10b981' : '#f87171', accentBg: marketStats.avgChange >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)', accentBorder: marketStats.avgChange >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(248,113,113,0.2)', icon: Activity },
                                            { label: 'Volume', value: `${(marketStats.totalVolume / 1000000).toFixed(1)}M`, accent: '#a78bfa', accentBg: 'rgba(167,139,250,0.1)', accentBorder: 'rgba(167,139,250,0.2)', icon: PieChart },
                                        ].map((stat) => {
                                            const Icon = stat.icon;
                                            return (
                                                <div key={stat.label} className="bg-[#0d1420] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.12] transition-all">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs text-slate-600 font-medium">{stat.label}</span>
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: stat.accentBg, border: `1px solid ${stat.accentBorder}` }}>
                                                            <Icon className="w-3.5 h-3.5" style={{ color: stat.accent }} />
                                                        </div>
                                                    </div>
                                                    <div className="mono text-xl font-bold text-white">{stat.value}</div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Gainers & Losers */}
                                    <div className="grid md:grid-cols-2 gap-5">
                                        {[
                                            { title: 'Top Gainers', icon: TrendingUp, accent: '#10b981', accentBg: 'rgba(16,185,129,0.1)', accentBorder: 'rgba(16,185,129,0.2)', data: stocks.filter(s => s.change > 0).slice(0, 5) },
                                            { title: 'Top Losers', icon: TrendingDown, accent: '#f87171', accentBg: 'rgba(248,113,113,0.1)', accentBorder: 'rgba(248,113,113,0.2)', data: stocks.filter(s => s.change < 0).slice(0, 5) },
                                        ].map((section) => {
                                            const Icon = section.icon;
                                            return (
                                                <div key={section.title} className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                                                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: section.accentBg, border: `1px solid ${section.accentBorder}` }}>
                                                                <Icon className="w-4 h-4" style={{ color: section.accent }} />
                                                            </div>
                                                            <span className="text-sm font-semibold text-white">{section.title}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 space-y-1.5">
                                                        {section.data.length > 0 ? section.data.map((stock) => (
                                                            <div key={stock._id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all cursor-default">
                                                                <div>
                                                                    <div className="mono text-sm font-bold text-white">{stock.symbol}</div>
                                                                    <div className="text-xs text-slate-600 truncate max-w-[130px]">{stock.name}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="mono text-sm font-bold text-white">₹{stock.price?.toFixed(2)}</div>
                                                                    <div className={`text-xs font-semibold ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                        {stock.change >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <p className="text-slate-600 text-center py-8 text-sm">No data available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Latest News */}
                                    <div className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-violet-400" />
                                                </div>
                                                <span className="text-sm font-semibold text-white">Latest News</span>
                                            </div>
                                            <button onClick={() => setActiveTab('news')} className="text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors">View all →</button>
                                        </div>
                                        <div className="p-4 grid md:grid-cols-2 gap-3">
                                            {news.slice(0, 4).map((item) => {
                                                const cc = categoryColorMap[item.category] || categoryColorMap.market;
                                                return (
                                                    <div key={item._id} className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-transparent hover:border-white/[0.07] transition-all cursor-pointer group">
                                                        <div className="flex items-center gap-2 mb-2.5">
                                                            <span className="px-2 py-0.5 rounded-md mono text-[10px] font-bold uppercase tracking-wider" style={{ background: cc.bg, color: cc.text }}>{item.category}</span>
                                                            <span className="text-xs text-slate-600">{new Date(item.publishedAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">{item.title}</h3>
                                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.summary}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ─── IPO Tab ─── */}
                            {activeTab === 'ipos' && (
                                <div className="space-y-5 fade-in">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1 h-5 bg-violet-400 rounded-full" />
                                            <span className="mono text-xs text-violet-400/70 tracking-widest uppercase">Applications</span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-white">IPO Management</h1>
                                        <p className="text-sm text-slate-500 mt-0.5">Apply for new IPOs and track your applications</p>
                                    </div>

                                    <div className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-white/[0.06]">
                                                        {['Symbol', 'Company', 'Price', 'Min / Max', 'Opening', 'Status', 'Action'].map(h => (
                                                            <th key={h} className={`px-5 py-3 text-[10px] mono font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap ${h === 'Price' ? 'text-right' : h === 'Action' || h === 'Status' ? 'text-center' : 'text-left'}`}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.04]">
                                                    {ipos.map((ipo) => {
                                                        const appStatus = getApplicationStatus(ipo._id);
                                                        return (
                                                            <tr key={ipo._id} className="table-row transition-colors">
                                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                                                            <span className="mono text-xs font-bold text-violet-400">{ipo.symbol.charAt(0)}</span>
                                                                        </div>
                                                                        <span className="mono text-sm font-bold text-white">{ipo.symbol}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-3.5 text-sm text-slate-500">{ipo.company}</td>
                                                                <td className="px-5 py-3.5 text-right"><span className="mono text-sm font-bold text-white">₹{ipo.issuePrice}</span></td>
                                                                <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{ipo.minApplication} / {ipo.maxApplication}</td>
                                                                <td className="px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap">{new Date(ipo.openDate).toLocaleDateString()}</td>
                                                                <td className="px-5 py-3.5 text-center">{getIpoStatusBadge(ipo.status)}</td>
                                                                <td className="px-5 py-3.5 text-center">
                                                                    {appStatus ? (
                                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mono text-[10px] font-bold uppercase tracking-wider
                                                                            ${appStatus.status === 'allotted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                            appStatus.status === 'applied' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                                                            'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                                            {appStatus.status === 'allotted' && <CheckCircle className="w-3 h-3" />}
                                                                            {appStatus.status === 'applied' && <Clock className="w-3 h-3" />}
                                                                            {appStatus.status === 'not_allotted' && <XCircle className="w-3 h-3" />}
                                                                            {appStatus.status === 'allotted' ? 'Allotted' : appStatus.status === 'applied' ? 'Applied' : 'Not Allotted'}
                                                                        </span>
                                                                    ) : ipo.status === 'open' ? (
                                                                        <button
                                                                            onClick={() => { setSelectedIpo(ipo); setSharesToApply(ipo.minApplication); setShowApplyModal(true); }}
                                                                            className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/45 text-emerald-300 rounded-lg mono text-xs font-bold uppercase tracking-wider transition-all"
                                                                        >
                                                                            Apply
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-slate-700">—</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            {ipos.length === 0 && (
                                                <div className="text-center py-14">
                                                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                                                        <Briefcase className="w-6 h-6 text-slate-700" />
                                                    </div>
                                                    <p className="text-sm text-slate-600">No IPOs available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ─── Portfolio Tab ─── */}
                            {activeTab === 'portfolio' && (
                                <div className="space-y-5 fade-in">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1 h-5 bg-cyan-400 rounded-full" />
                                            <span className="mono text-xs text-cyan-400/70 tracking-widest uppercase">Holdings</span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-white">My Portfolio</h1>
                                        <p className="text-sm text-slate-500 mt-0.5">Track your investments and IPO applications</p>
                                    </div>

                                    {/* Portfolio Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { label: 'Total Holdings', value: portfolio?.ownedStocks.length || 0, accent: '#06b6d4', accentBg: 'rgba(6,182,212,0.1)', accentBorder: 'rgba(6,182,212,0.2)', icon: Wallet, sub: 'Stocks owned' },
                                            { label: 'Applied IPOs', value: portfolio?.appliedIPOs.length || 0, accent: '#a78bfa', accentBg: 'rgba(167,139,250,0.1)', accentBorder: 'rgba(167,139,250,0.2)', icon: Briefcase, sub: 'Pending allotment' },
                                            { label: 'Allotted IPOs', value: portfolio?.allottedIPOs.length || 0, accent: '#10b981', accentBg: 'rgba(16,185,129,0.1)', accentBorder: 'rgba(16,185,129,0.2)', icon: CheckCircle, sub: 'Successfully allotted' },
                                        ].map(card => {
                                            const Icon = card.icon;
                                            return (
                                                <div key={card.label} className="bg-[#0d1420] border border-white/[0.07] rounded-2xl p-5">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.accentBg, border: `1px solid ${card.accentBorder}` }}>
                                                            <Icon className="w-5 h-5" style={{ color: card.accent }} />
                                                        </div>
                                                    </div>
                                                    <div className="mono text-3xl font-bold text-white mb-1">{card.value}</div>
                                                    <div className="text-sm font-medium text-slate-400">{card.label}</div>
                                                    <div className="text-xs text-slate-600 mt-0.5">{card.sub}</div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Holdings Table */}
                                    <div className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                                <Wallet className="w-4 h-4 text-cyan-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-white">Your Holdings</span>
                                        </div>
                                        {portfolio?.ownedStocks && portfolio.ownedStocks.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-white/[0.06]">
                                                            {['Stock', 'Qty', 'Avg Price', 'Current', 'Value', 'P/L'].map(h => (
                                                                <th key={h} className={`px-5 py-3 text-[10px] mono font-bold text-slate-600 uppercase tracking-wider ${h === 'Stock' ? 'text-left' : 'text-right'}`}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/[0.04]">
                                                        {portfolio.ownedStocks.map((holding) => {
                                                            const pl = (holding.stockId.price - holding.averagePrice) * holding.quantity;
                                                            const plPercent = ((holding.stockId.price - holding.averagePrice) / holding.averagePrice) * 100;
                                                            return (
                                                                <tr key={holding.stockId._id} className="table-row transition-colors">
                                                                    <td className="px-5 py-3.5">
                                                                        <div className="mono text-sm font-bold text-white">{holding.stockId.symbol}</div>
                                                                        <div className="text-xs text-slate-600">{holding.stockId.name}</div>
                                                                    </td>
                                                                    <td className="px-5 py-3.5 text-right mono text-sm text-slate-300">{holding.quantity}</td>
                                                                    <td className="px-5 py-3.5 text-right mono text-sm text-slate-400">₹{holding.averagePrice.toFixed(2)}</td>
                                                                    <td className="px-5 py-3.5 text-right mono text-sm text-slate-300">₹{holding.stockId.price?.toFixed(2)}</td>
                                                                    <td className="px-5 py-3.5 text-right mono text-sm font-bold text-white">₹{(holding.stockId.price * holding.quantity).toFixed(2)}</td>
                                                                    <td className={`px-5 py-3.5 text-right mono text-sm font-bold ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                        {pl >= 0 ? '+' : ''}₹{pl.toFixed(2)}<br />
                                                                        <span className="text-xs opacity-70">({plPercent.toFixed(2)}%)</span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-14">
                                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                                                    <Wallet className="w-6 h-6 text-slate-700" />
                                                </div>
                                                <p className="text-sm text-slate-500">No holdings yet</p>
                                                <p className="text-xs text-slate-700 mt-1">Start investing by browsing the market</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ─── Market Tab ─── */}
                            {activeTab === 'market' && (
                                <div className="space-y-5 fade-in">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1 h-5 bg-cyan-400 rounded-full" />
                                            <span className="mono text-xs text-cyan-400/70 tracking-widest uppercase">Overview</span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-white">Market</h1>
                                        <p className="text-sm text-slate-500 mt-0.5">Browse all available stocks on NEPSE</p>
                                    </div>

                                    <div className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-white/[0.06]">
                                                        {['Symbol', 'Name', 'Price', 'Change', 'Change %', 'Volume'].map(h => (
                                                            <th key={h} className={`px-5 py-3 text-[10px] mono font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap ${h === 'Symbol' || h === 'Name' ? 'text-left' : 'text-right'}`}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.04]">
                                                    {stocks.map((stock) => (
                                                        <tr key={stock._id} className="table-row transition-colors">
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                                                        <span className="mono text-[10px] font-bold text-cyan-400">{stock.symbol.charAt(0)}</span>
                                                                    </div>
                                                                    <span className="mono text-sm font-bold text-white">{stock.symbol}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5 text-sm text-slate-500">{stock.name}</td>
                                                            <td className="px-5 py-3.5 text-right"><span className="mono text-sm font-bold text-white">₹{stock.price?.toFixed(2)}</span></td>
                                                            <td className={`px-5 py-3.5 text-right mono text-sm font-semibold ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}
                                                            </td>
                                                            <td className={`px-5 py-3.5 text-right ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md mono text-xs font-bold ${stock.changePercent >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                                                    {stock.changePercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5 text-right mono text-sm text-slate-600">{stock.volume?.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ─── News Tab ─── */}
                            {activeTab === 'news' && (
                                <div className="space-y-5 fade-in">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1 h-5 bg-amber-400 rounded-full" />
                                            <span className="mono text-xs text-amber-400/70 tracking-widest uppercase">Updates</span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-white">Market News</h1>
                                        <p className="text-sm text-slate-500 mt-0.5">Stay updated with the latest market news</p>
                                    </div>

                                    <div className="space-y-3">
                                        {news.map((item, index) => {
                                            const cc = categoryColorMap[item.category] || categoryColorMap.market;
                                            return (
                                                <div key={item._id} className="bg-[#0d1420] border border-white/[0.07] hover:border-white/[0.12] rounded-2xl p-5 transition-all cursor-pointer group" style={{ animationDelay: `${index * 40}ms` }}>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="px-2.5 py-1 rounded-lg mono text-[10px] font-bold uppercase tracking-wider" style={{ background: cc.bg, color: cc.text }}>{item.category}</span>
                                                        <span className="text-xs text-slate-600">{new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                    <h3 className="text-base font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors mb-2">{item.title}</h3>
                                                    <p className="text-sm text-slate-600 leading-relaxed">{item.summary}</p>
                                                </div>
                                            );
                                        })}
                                        {news.length === 0 && (
                                            <div className="text-center py-14 bg-[#0d1420] border border-white/[0.07] rounded-2xl">
                                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                                                    <FileText className="w-6 h-6 text-slate-700" />
                                                </div>
                                                <p className="text-sm text-slate-600">No news available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Mobile overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsOpen(false)} />
            )}

            {/* ─── IPO Apply Modal ─── */}
            {showApplyModal && selectedIpo && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f1520] border border-white/[0.1] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                        <span className="mono text-xs font-bold text-violet-400">{selectedIpo.symbol.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">Apply — <span className="mono text-violet-400">{selectedIpo.symbol}</span></h3>
                                        <p className="text-xs text-slate-500">{selectedIpo.company}</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowApplyModal(false)} className="p-2 text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] rounded-lg transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Issue Price', value: `₹${selectedIpo.issuePrice}` },
                                    { label: 'Available', value: selectedIpo.sharesAvailable?.toLocaleString() },
                                    { label: 'Min Shares', value: `${selectedIpo.minApplication}` },
                                    { label: 'Max Shares', value: `${selectedIpo.maxApplication}` },
                                ].map(info => (
                                    <div key={info.label} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                                        <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{info.label}</div>
                                        <div className="mono text-sm font-bold text-white">{info.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Number of Shares</label>
                                <input
                                    type="number"
                                    value={sharesToApply}
                                    onChange={(e) => setSharesToApply(parseInt(e.target.value) || 0)}
                                    min={selectedIpo.minApplication}
                                    max={selectedIpo.maxApplication}
                                    className="form-input mono"
                                />
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-slate-600">Total Amount</span>
                                    <span className="mono text-sm font-bold text-emerald-400">₹{(sharesToApply * selectedIpo.issuePrice).toLocaleString()}</span>
                                </div>
                            </div>

                            {applyMessage && (
                                <div className={`p-3 rounded-xl text-sm ${applyMessage.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {applyMessage}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowApplyModal(false)} className="flex-1 px-4 py-2.5 border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/[0.2] rounded-xl text-sm font-semibold transition-all">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApplyIpo}
                                    disabled={applying}
                                    className="flex-1 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/45 text-emerald-300 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {applying ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                                            Submitting...
                                        </span>
                                    ) : 'Confirm Apply'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Profile Modal ─── */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f1520] border border-white/[0.1] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                            <h3 className="text-base font-bold text-white">My Profile</h3>
                            <button onClick={() => setShowProfileModal(false)} className="p-2 text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] rounded-lg transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Avatar */}
                            <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/30 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                    <span className="mono text-xl font-bold text-emerald-400">{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                    <div className="font-semibold text-white">{user.name}</div>
                                    <div className="text-sm text-slate-500">{user.email}</div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                        <span className="mono text-[10px] text-emerald-400">Verified Investor</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: 'Full Name', key: 'name', type: 'text' },
                                    { label: 'Email', key: 'email', type: 'email' },
                                    { label: 'Phone Number', key: 'phone', type: 'tel' },
                                    { label: 'DP Number', key: 'dpNumber', type: 'text' },
                                    { label: 'BOID', key: 'boid', type: 'text' },
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{field.label}</label>
                                        <input
                                            type={field.type}
                                            value={profileData[field.key as keyof typeof profileData]}
                                            onChange={(e) => setProfileData({ ...profileData, [field.key]: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowProfileModal(false)} className="flex-1 px-4 py-2.5 border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/[0.2] rounded-xl text-sm font-semibold transition-all">
                                    Close
                                </button>
                                <button className="flex-1 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/45 text-emerald-300 rounded-xl text-sm font-semibold transition-all">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}