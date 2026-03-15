'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    TrendingUp, 
    TrendingDown, 
    BarChart3, 
    Bell, 
    Shield, 
    ArrowRight, 
    Globe, 
    LineChart, 
    Activity, 
    Calendar, 
    ChevronRight, 
    Unlock, 
    Lock,
    Zap,
    Users,
    Newspaper,
    Briefcase
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import { indicesAPI, iposAPI, newsAPI, Stock, MarketIndex, News, IPO } from '@/lib/api';

export default function Home() {
    const { user, isLoading: authLoading } = useAuth();
    
    const [indices, setIndices] = useState<MarketIndex[]>([]);
    const [topMovers, setTopMovers] = useState<{ gainers: Stock[], losers: Stock[] }>({ gainers: [], losers: [] });
    const [activeIPOs, setActiveIPOs] = useState<IPO[]>([]);
    const [latestNews, setLatestNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [indicesRes, moversRes, iposRes, newsRes] = await Promise.all([
                    indicesAPI.getAll(),
                    indicesAPI.getTopMovers(5),
                    iposAPI.getAll(),
                    newsAPI.getAll({ limit: 4 })
                ]);

                setIndices(indicesRes.indices || []);
                setTopMovers({
                    gainers: moversRes.gainers || [],
                    losers: moversRes.losers || []
                });
                setActiveIPOs(iposRes.ipos.filter(i => i.status === 'open' || i.status === 'upcoming').slice(0, 3));
                setLatestNews(newsRes.news || []);
            } catch (error) {
                console.error('Landing page data fetch failed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Helper for large numbers
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            minimumFractionDigits: 2
        }).format(price).replace('NPR', 'Rs.');
    };

    const formatIndexValue = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2
        }).format(val);
    };

    if (authLoading) return null;

    // Logged In View
    if (user) {
        return (
            <div className="min-h-screen bg-[#f8fafc]">
                <Navigation />
                <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                    {/* Welcome Header */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 px-2 rounded bg-primary-100 text-primary-700 text-[10px] font-bold uppercase tracking-wider">Investor Portal</div>
                                <span className="text-gray-400 text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 leading-tight">
                                Namaste, <span className="text-primary-600">{user.name.split(' ')[0]}</span>!
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Your investment control center is ready.</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/user-dashboard" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Go to Dashboard
                            </Link>
                        </div>
                    </header>

                    {/* Market Ticker Card (Lite) */}
                    <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center overflow-x-auto whitespace-nowrap gap-8 scrollbar-hide">
                        {indices.map(idx => (
                            <div key={idx._id} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{idx.displayName}</span>
                                <span className="text-sm font-black text-gray-900">{formatIndexValue(idx.value)}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${idx.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {idx.change >= 0 ? '+' : ''}{idx.changePercent}%
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-12 gap-8 mt-8">
                        {/* Quick Actions & Stats */}
                        <div className="md:col-span-8 space-y-8">
                            {/* Feature Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { name: 'My Portfolio', icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50', link: '/portfolio' },
                                    { name: 'Live Market', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/market' },
                                    { name: 'IPOs', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50', link: '/ipos' },
                                    { name: 'News Feed', icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50', link: '/news' },
                                ].map((item, i) => (
                                    <Link key={i} href={item.link} className="p-4 bg-white border rounded-2xl hover:border-primary-300 transition-all group shadow-sm">
                                        <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-800">{item.name}</h3>
                                    </Link>
                                ))}
                            </div>

                            {/* News Section */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        <Newspaper className="w-5 h-5 text-primary-600" /> Latest Financial News
                                    </h2>
                                    <Link href="/news" className="text-xs font-bold text-primary-600 hover:underline">View All News</Link>
                                </div>
                                <div className="grid gap-4">
                                    {latestNews.map(item => (
                                        <Link key={item._id} href={`/news/${item._id}`} className="flex gap-4 p-4 bg-white border rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
                                            <div className="hidden sm:block w-32 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                                {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Newspaper className="w-8 h-8" /></div>}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{item.category}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold">• {new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{item.title}</h3>
                                                <p className="text-xs text-gray-500 line-clamp-1">{item.summary}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right Sidebar */}
                        <aside className="md:col-span-4 space-y-8">
                            {/* Market Movers */}
                            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-4 py-3 bg-gray-900 flex items-center justify-between">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-yellow-400" /> Top Movers
                                    </h3>
                                    <Link href="/market" className="text-[10px] text-gray-400 hover:text-white transition-colors">Market Details</Link>
                                </div>
                                <div className="p-1">
                                    <div className="grid grid-cols-2 bg-gray-50/50 p-1 rounded-lg mb-1">
                                        <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-md bg-white shadow-sm text-green-600">Gainers</button>
                                        <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-md text-gray-500">Losers</button>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {topMovers.gainers.slice(0, 5).map(stock => (
                                            <div key={stock._id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div>
                                                    <div className="text-xs font-black text-gray-900 uppercase">{stock.symbol}</div>
                                                    <div className="text-[10px] text-gray-400 line-clamp-1 truncate max-w-[100px]">{stock.name}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-gray-900">{formatPrice(stock.price)}</div>
                                                    <div className="text-[10px] font-bold text-green-600">+{stock.changePercent.toFixed(2)}%</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* IPO Alerts */}
                            <div className="bg-primary-600 rounded-2xl p-5 text-white shadow-xl shadow-primary-500/30 relative overflow-hidden group">
                                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                        <Bell className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-black text-lg mb-1">IPO Notifications</h3>
                                    <p className="text-white/80 text-xs mb-4">Never miss an investment opportunity. Track upcoming IPOs in real-time.</p>
                                    <Link href="/ipos" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg font-black text-[11px] uppercase tracking-wider hover:bg-gray-100 transition-colors">
                                        Check IPOs <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        );
    }

    // GUEST (Landing Page) View
    return (
        <div className="min-h-screen bg-[#f8fafc] text-gray-900 selection:bg-primary-100">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Inter:wght@400;600;800;900&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .heading { font-family: 'Inter', sans-serif; font-weight: 900; }
            `}</style>
            
            {/* Professional Ticker */}
            <div className="bg-gray-900 text-white overflow-hidden py-2 text-[11px] font-bold relative">
                <div className="flex animate-marquee whitespace-nowrap">
                    {[...indices, ...indices].map((idx, i) => (
                        <div key={i} className="flex items-center gap-6 px-4 border-r border-gray-800">
                            <span className="text-gray-400 uppercase tracking-widest">{idx.displayName}</span>
                            <span className="text-white">{formatIndexValue(idx.value)}</span>
                            <span className={idx.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {idx.change >= 0 ? '▲' : '▼'} {idx.changePercent}%
                            </span>
                        </div>
                    ))}
                </div>
                <div className="absolute left-0 top-0 bottom-0 px-4 bg-gray-900 z-10 flex items-center border-r border-gray-800">
                    <span className="text-primary-500 uppercase tracking-tighter font-black">LIVE • NEPSE</span>
                </div>
            </div>

            {/* Navigation (Transparent) */}
            <nav className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">Nepali<span className="text-primary-600">Stock</span></span>
                </div>
                <div className="hidden lg:flex items-center gap-10">
                    {['Market', 'Stocks', 'IPOs', 'News'].map(link => (
                        <Link key={link} href={`/${link.toLowerCase()}`} className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-primary-600 transition-colors">{link}</Link>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-black text-gray-900 hover:text-primary-600 transition-colors uppercase tracking-widest underline decoration-2 underline-offset-4">Sign In</Link>
                    <Link href="/signup" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section (MeroShare inspired Split) */}
            <section className="max-w-7xl mx-auto px-4 py-12 md:py-24 grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <Zap className="w-3 h-3" /> The Next Generation Trading Experience
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
                        Nepal's Most <span className="text-primary-600">Advanced</span> Trading Portal.
                    </h1>
                    <p className="text-lg text-gray-500 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
                        Experience institutional-grade analysis, real-time market insights, and seamless portfolio management in one unified platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-600 flex items-center justify-center text-[10px] text-white font-bold">+5k</div>
                        </div>
                        <div className="text-sm text-gray-500 font-bold flex flex-col justify-center">
                            <span>Trusted by 5,000+ active investors</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => <TrendingUp key={i} className="w-3 h-3 text-green-500" />)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secure Access Card (MeroShare Aesthetic) */}
                <div className="relative mx-auto w-full max-w-md">
                    <div className="absolute inset-0 bg-primary-600 rounded-3xl blur-3xl opacity-10 -rotate-6 scale-110" />
                    <div className="relative bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-gray-200/50">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                                <Lock className="w-8 h-8 text-primary-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">Secure Access</h2>
                            <p className="text-gray-400 text-xs mt-1 font-bold uppercase tracking-widest">Nepali Stock Portal</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl flex items-center gap-4 group hover:bg-white hover:border-primary-100 hover:shadow-lg hover:shadow-primary-500/5 transition-all outline-none cursor-pointer">
                                <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                                    <Users className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Account Type</label>
                                    <span className="text-sm font-bold text-gray-900">Personal Investor</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600" />
                            </div>

                            <Link href="/login" className="w-full flex items-center justify-center gap-3 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-500/30 hover:bg-primary-700 active:scale-[0.98] transition-all">
                                Login to Portal <Unlock className="w-4 h-4" />
                            </Link>
                            
                            <div className="flex items-center justify-between px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <Link href="/forgot-password" title="Recover account Access" className="hover:text-primary-600 transition-colors">Forgot Password?</Link>
                                <Link href="/signup" title="Create your Investment Account" className="text-primary-600 hover:underline">Register Now</Link>
                            </div>
                        </div>

                        {/* Market Snapshot in card */}
                        <div className="mt-10 pt-8 border-t border-gray-50 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Indices</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black text-green-600 uppercase">Live</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {indices.slice(0, 2).map((idx, i) => (
                                    <div key={i} className={`p-3 rounded-xl border ${idx.change >= 0 ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                                        <div className="text-[9px] font-black text-gray-500 uppercase truncate mb-1">{idx.displayName}</div>
                                        <div className="text-sm font-black text-gray-900">{formatIndexValue(idx.value)}</div>
                                        <div className={`text-[9px] font-black ${idx.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {idx.change >= 0 ? '+' : ''}{idx.changePercent}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sharesansar style Data Section */}
            <section className="bg-white py-24 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div className="max-w-xl space-y-4">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
                                Market Insights <br />& Opportunities.
                            </h2>
                            <p className="text-gray-500 font-medium">Real-time indicators and critical market activity at a glance.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/market" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg">View Market Summary</Link>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Market Leaders */}
                        <div className="lg:col-span-8 space-y-10">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Top Gainers */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-500" /> Market Gainers
                                    </h3>
                                    <div className="bg-gray-50/50 border border-gray-100 rounded-3xl overflow-hidden p-2">
                                        <div className="divide-y divide-gray-100/50">
                                            {topMovers.gainers.map((stock, i) => (
                                                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-white hover:shadow-sm transition-all rounded-2xl cursor-pointer">
                                                    <div>
                                                        <div className="text-[11px] font-black text-gray-900 uppercase">{stock.symbol}</div>
                                                        <div className="text-[9px] text-gray-400 font-bold uppercase truncate max-w-[120px]">{stock.name}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[11px] font-black text-gray-900">{formatPrice(stock.price)}</div>
                                                        <div className="text-[10px] font-black text-green-600">+{stock.changePercent.toFixed(2)}%</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Current IPOs */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-primary-500" /> Open Opportunities
                                    </h3>
                                    <div className="bg-primary-50/30 border border-primary-100 rounded-3xl p-6 relative overflow-hidden h-full flex flex-col justify-between">
                                        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-primary-600/5 rounded-full blur-2xl" />
                                        <div className="relative z-10 space-y-6">
                                            {activeIPOs.length > 0 ? (
                                                activeIPOs.map((ipo, i) => (
                                                    <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-primary-100/50">
                                                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-black text-xs uppercase">{ipo.symbol.charAt(0)}</div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="text-[10px] font-black text-gray-900 uppercase truncate">{ipo.name || ipo.company}</div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black text-primary-600 uppercase">IPO</span>
                                                                <span className="text-[9px] text-gray-400 font-bold">• {new Date(ipo.openDate).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <Link href="/ipos" className="p-2 bg-gray-50 hover:bg-primary-100 rounded-lg transition-colors group">
                                                            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-600" />
                                                        </Link>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                                        <Calendar className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                    <p className="text-[11px] font-black text-gray-500 uppercase">No active IPOs</p>
                                                </div>
                                            )}
                                        </div>
                                        <Link href="/ipos" className="mt-8 relative z-10 w-full flex items-center justify-center gap-2 py-3 bg-white border border-primary-200 text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-50 transition-colors">Apply for Shares <ArrowRight className="w-3 h-3" /></Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent News Grid */}
                        <div className="lg:col-span-4 space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Newspaper className="w-4 h-4 text-blue-500" /> Financial Bulletin
                            </h3>
                            <div className="space-y-4">
                                {latestNews.map((news, i) => (
                                    <Link key={i} href={`/news/${news._id}`} className="block group">
                                        <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-5 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter px-1.5 py-0.5 bg-blue-50 rounded">{news.category}</span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">• {new Date(news.createdAt).getHours()}h ago</span>
                                            </div>
                                            <h4 className="text-sm font-black text-gray-900 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">{news.title}</h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Link href="/news" className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 transition-all">View All News Feed <ArrowRight className="w-3 h-3" /></Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Powerful Features Grid */}
            <section className="max-w-7xl mx-auto px-4 py-32 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: 'Real-Time Data', desc: 'Instant access to live stock prices and trade volumes directly from the source.', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                  { title: 'Portfolio Pro', desc: 'Track holdings, P/L, and historical performance with professional analysis tools.', icon: LineChart, color: 'text-primary-600', bg: 'bg-primary-50' },
                  { title: 'Smart Alerts', desc: 'Customizable notifications for price targets, news, and IPO allotment results.', icon: Bell, color: 'text-red-500', bg: 'bg-red-50' },
                  { title: 'Market Leaders', desc: 'Instant visibility into top gainers, losers, and most active stocks every session.', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { title: 'Secure Trading', desc: 'Bank-grade security protocols insuring your data and investment privacy.', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { title: 'Upcoming IPOs', desc: 'Comprehensive calendar and application portal for all primary market issues.', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((f, i) => (
                    <div key={i} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2 transition-all group">
                        <div className={`w-14 h-14 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                            <f.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-3">{f.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">{f.desc}</p>
                    </div>
                ))}
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-20 text-white rounded-t-[3rem]">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tighter uppercase">Nepali<span className="text-primary-600">Stock</span></span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed font-medium">Your definitive gateway to the Nepal Stock Exchange. Empowering thousands of investors with professional financial instruments.</p>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" />)}
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8">Navigation</h4>
                        <ul className="space-y-4">
                            {['Market', 'Stocks', 'IPOs', 'Global Market', 'News'].map(l => (
                                <li key={l}><Link href={`/${l.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-gray-300 hover:text-primary-400 transition-colors">{l}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8">Account</h4>
                        <ul className="space-y-4">
                            {['Login to Portal', 'Create Account', 'Forgot Password', 'Terms of Service', 'Privacy Policy'].map(l => (
                                <li key={l}><Link href="/" className="text-sm font-bold text-gray-300 hover:text-primary-400 transition-colors">{l}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Newsletter</h4>
                            <div className="relative">
                                <input type="email" placeholder="Your email address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-primary-500" />
                                <button className="absolute right-2 top-2 bottom-2 px-4 bg-primary-600 text-white rounded-lg text-[10px] font-black uppercase tracking-tighter">Sign Up</button>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">&copy; {new Date().getFullYear()} Nepali Stock Market Portal. <br />Licensed by Nepal Securities Board.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
