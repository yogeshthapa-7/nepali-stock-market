'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    TrendingUp,
    TrendingDown,
    LineChart,
    BarChart2,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    RefreshCw,
    Home,
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { indicesAPI, Stock, MarketIndex } from '@/lib/api';

export default function MarketPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    const [indices, setIndices] = useState<MarketIndex[]>([]);
    const [gainers, setGainers] = useState<Stock[]>([]);
    const [losers, setLosers] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'gainers' | 'losers'>('overview');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchMarketData();
        }
    }, [user]);

    const fetchMarketData = async () => {
        try {
            setLoading(true);
            const [indicesRes, gainersRes, losersRes] = await Promise.all([
                indicesAPI.getAll(),
                indicesAPI.getGainers(10),
                indicesAPI.getLosers(10),
            ]);

            setIndices(indicesRes.indices || []);
            setGainers(gainersRes.stocks || []);
            setLosers(losersRes.stocks || []);
        } catch (error) {
            console.error('Failed to fetch market data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChangeColor = (change: number) => {
        if (change > 0) return 'text-green-500';
        if (change < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
        }).format(num);
    };

    if (loading && !indices.length) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/user-dashboard" className="flex items-center text-gray-600 hover:text-blue-600">
                            <Home className="w-5 h-5 mr-1" />
                            Home
                        </Link>
                        <span className="text-gray-300">|</span>
                        <h1 className="text-xl font-bold text-gray-800">Market Overview</h1>
                    </div>
                    <button
                        onClick={fetchMarketData}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Market Indices */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <LineChart className="w-5 h-5 mr-2" />
                        Market Indices
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {indices.map((index) => (
                            <div
                                key={index._id}
                                className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
                            >
                                <div className="text-sm text-gray-600 mb-1">{index.displayName}</div>
                                <div className="text-xl font-bold text-gray-900">
                                    {formatNumber(index.value)}
                                </div>
                                <div className={`flex items-center text-sm ${getChangeColor(index.change)}`}>
                                    {index.change >= 0 ? (
                                        <ArrowUpRight className="w-4 h-4 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4 mr-1" />
                                    )}
                                    {index.change > 0 ? '+' : ''}{formatNumber(index.change)} ({index.changePercent}%)
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-3 font-medium ${activeTab === 'overview'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Market Summary
                        </button>
                        <button
                            onClick={() => setActiveTab('gainers')}
                            className={`px-6 py-3 font-medium flex items-center ${activeTab === 'gainers'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                            Top Gainers
                        </button>
                        <button
                            onClick={() => setActiveTab('losers')}
                            className={`px-6 py-3 font-medium flex items-center ${activeTab === 'losers'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
                            Top Losers
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                    <div className="flex items-center text-green-600 mb-2">
                                        <TrendingUp className="w-5 h-5 mr-2" />
                                        <span className="font-medium">Market Status</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-700">Open</div>
                                    <div className="text-sm text-green-600">Trading in progress</div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                    <div className="flex items-center text-blue-600 mb-2">
                                        <Activity className="w-5 h-5 mr-2" />
                                        <span className="font-medium">Total Trades</span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-700">
                                        {gainers.length + losers.length}
                                    </div>
                                    <div className="text-sm text-blue-600">Active stocks</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                    <div className="flex items-center text-purple-600 mb-2">
                                        <BarChart2 className="w-5 h-5 mr-2" />
                                        <span className="font-medium">Market Trend</span>
                                    </div>
                                    <div className="text-2xl font-bold text-purple-700">
                                        {gainers.length > losers.length ? 'Bullish' : 'Bearish'}
                                    </div>
                                    <div className="text-sm text-purple-600">
                                        {gainers.length} gainers, {losers.length} losers
                                    </div>
                                </div>

                                {/* Top Gainers Summary Table */}
                                <div className="md:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                            <h3 className="text-sm font-bold text-gray-800">Top Gainers</h3>
                                        </div>
                                        <button onClick={() => setActiveTab('gainers')} className="text-[10px] font-bold text-blue-600 uppercase tracking-tight hover:underline">View All</button>
                                    </div>
                                    <div className="flex-1">
                                        <table className="w-full text-xs">
                                            <tbody className="divide-y divide-gray-50">
                                                {gainers.slice(0, 5).map((stock) => (
                                                    <tr key={stock._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-4 py-2.5 font-bold text-gray-700">{stock.symbol}</td>
                                                        <td className="px-4 py-2.5 text-right font-medium text-gray-900">Rs. {stock.price?.toFixed(2)}</td>
                                                        <td className="px-4 py-2.5 text-right font-bold text-green-500">+{stock.changePercent?.toFixed(2)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Top Losers Summary Table */}
                                <div className="md:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                            <h3 className="text-sm font-bold text-gray-800">Top Losers</h3>
                                        </div>
                                        <button onClick={() => setActiveTab('losers')} className="text-[10px] font-bold text-blue-600 uppercase tracking-tight hover:underline">View All</button>
                                    </div>
                                    <div className="flex-1">
                                        <table className="w-full text-xs">
                                            <tbody className="divide-y divide-gray-50">
                                                {losers.slice(0, 5).map((stock) => (
                                                    <tr key={stock._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-4 py-2.5 font-bold text-gray-700">{stock.symbol}</td>
                                                        <td className="px-4 py-2.5 text-right font-medium text-gray-900">Rs. {stock.price?.toFixed(2)}</td>
                                                        <td className="px-4 py-2.5 text-right font-bold text-red-500">{stock.changePercent?.toFixed(2)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Gainers Tab */}
                        {activeTab === 'gainers' && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Symbol</th>
                                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
                                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Price</th>
                                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Change</th>
                                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Change %</th>
                                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Volume</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gainers.map((stock) => (
                                            <tr key={stock._id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium text-blue-600">{stock.symbol}</td>
                                                <td className="py-3 px-4 text-gray-800">{stock.name}</td>
                                                <td className="py-3 px-4 text-right">Rs. {stock.price?.toFixed(2)}</td>
                                                <td className="py-3 px-4 text-right text-green-500">
                                                    +{stock.change?.toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right text-green-500 font-medium">
                                                    +{stock.changePercent?.toFixed(2)}%
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-600">
                                                    {stock.volume?.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Losers Tab */}
                        {activeTab === 'losers' && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Symbol</th>
                                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
                                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Price</th>
                                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Change</th>
                                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Change %</th>
                                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Volume</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {losers.map((stock) => (
                                            <tr key={stock._id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium text-blue-600">{stock.symbol}</td>
                                                <td className="py-3 px-4 text-gray-800">{stock.name}</td>
                                                <td className="py-3 px-4 text-right">Rs. {stock.price?.toFixed(2)}</td>
                                                <td className="py-3 px-4 text-right text-red-500">
                                                    {stock.change?.toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right text-red-500 font-medium">
                                                    {stock.changePercent?.toFixed(2)}%
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-600">
                                                    {stock.volume?.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
