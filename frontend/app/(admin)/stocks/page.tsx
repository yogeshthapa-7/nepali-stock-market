'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    TrendingUp,
    TrendingDown,
    Loader2,
    X,
    Filter,
    Download
} from 'lucide-react';
import { stocksAPI, Stock } from '@/lib/api';

export default function AdminStocksPage() {
    const router = useRouter();
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('updatedAt');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStock, setEditingStock] = useState<Stock | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        symbol: '',
        name: '',
        company: '',
        price: 0,
        previousClose: 0,
        marketCap: '',
        volume: 0,
        peRatio: 0,
        eps: 0,
        dividendYield: 0,
        description: '',
    });

    useEffect(() => {
        fetchStocks();
    }, [searchTerm, sortBy]);

    const fetchStocks = async () => {
        try {
            const data = await stocksAPI.getAll({ search: searchTerm || undefined, sort: sortBy });
            setStocks(data.stocks);
        } catch (error) {
            console.error('Failed to fetch stocks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const stockData = {
                ...formData,
                change: formData.price - formData.previousClose,
                changePercent: formData.previousClose > 0
                    ? ((formData.price - formData.previousClose) / formData.previousClose) * 100
                    : 0,
            };
            if (editingStock) {
                await stocksAPI.update(editingStock.symbol, stockData);
            } else {
                await stocksAPI.create(stockData);
            }
            setIsModalOpen(false);
            resetForm();
            fetchStocks();
        } catch (error) {
            console.error('Failed to save stock:', error);
            alert('Failed to save stock. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (stock: Stock) => {
        setEditingStock(stock);
        setFormData({
            symbol: stock.symbol,
            name: stock.name,
            company: stock.company,
            price: stock.price,
            previousClose: stock.previousClose,
            marketCap: stock.marketCap,
            volume: stock.volume,
            peRatio: stock.peRatio,
            eps: stock.eps,
            dividendYield: stock.dividendYield,
            description: stock.description,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (symbol: string) => {
        try {
            await stocksAPI.delete(symbol);
            setDeleteConfirm(null);
            fetchStocks();
        } catch (error) {
            console.error('Failed to delete stock:', error);
            alert('Failed to delete stock. Please try again.');
        }
    };

    const resetForm = () => {
        setEditingStock(null);
        setFormData({ symbol: '', name: '', company: '', price: 0, previousClose: 0, marketCap: '', volume: 0, peRatio: 0, eps: 0, dividendYield: 0, description: '' });
    };

    const openNewModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-5">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
                * { font-family: 'DM Sans', sans-serif; }
                .mono { font-family: 'Space Mono', monospace; }
                .table-row:hover { background: rgba(255,255,255,0.025); }
                .form-input {
                    width: 100%;
                    padding: 10px 14px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    transition: all 0.2s;
                    outline: none;
                }
                .form-input:focus { border-color: rgba(6,182,212,0.5); background: rgba(6,182,212,0.03); box-shadow: 0 0 0 3px rgba(6,182,212,0.08); }
                .form-input::placeholder { color: rgba(148,163,184,0.5); }
                .form-input option { background: #1a1f2e; color: white; }
            `}</style>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-5 bg-cyan-400 rounded-full" />
                        <span className="mono text-xs text-cyan-400/70 tracking-widest uppercase">Management</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Stock Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and monitor all listed stocks</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-500/45 text-cyan-300 rounded-xl transition-all duration-200 text-sm font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    Add Stock
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                        type="text"
                        placeholder="Search by symbol, name or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0d1420] border border-white/[0.07] hover:border-white/[0.12] focus:border-cyan-500/40 focus:bg-cyan-500/[0.03] rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-[#0d1420] border border-white/[0.07] hover:border-white/[0.12] focus:border-cyan-500/40 rounded-xl text-sm text-slate-400 outline-none transition-all appearance-none"
                        style={{minWidth:'175px'}}
                    >
                        <option value="updatedAt">Most Recent</option>
                        <option value="price_asc">Price: Low → High</option>
                        <option value="price_desc">Price: High → Low</option>
                        <option value="change_asc">Change: Low → High</option>
                        <option value="change_desc">Change: High → Low</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                        </div>
                        <p className="text-sm text-slate-600">Loading stocks...</p>
                    </div>
                ) : stocks.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="w-6 h-6 text-slate-700" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No stocks found</p>
                        <p className="text-xs text-slate-700 mt-1">Get started by adding your first stock</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    {['Symbol', 'Name', 'Company', 'Price', 'Change', 'Volume', 'Actions'].map(h => (
                                        <th key={h} className={`px-5 py-3 text-[10px] mono font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap ${h === 'Price' || h === 'Change' || h === 'Volume' || h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {stocks.map((stock) => (
                                    <tr key={stock._id} className="table-row transition-colors">
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                                    <span className="mono text-xs font-bold text-cyan-400">{stock.symbol.charAt(0)}</span>
                                                </div>
                                                <span className="mono text-sm font-bold text-white">{stock.symbol}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-slate-300 font-medium">{stock.name}</td>
                                        <td className="px-5 py-3.5 text-sm text-slate-500">{stock.company}</td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                            <span className="mono text-sm font-bold text-white">₹{stock.price.toFixed(2)}</span>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg mono text-xs font-bold ${stock.changePercent >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                {stock.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right mono text-sm text-slate-500">
                                            {stock.volume.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleEdit(stock)} className="p-2 text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                {deleteConfirm === stock.symbol ? (
                                                    <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1">
                                                        <button onClick={() => handleDelete(stock.symbol)} className="text-[11px] mono font-bold text-red-400 hover:text-red-300 px-1">Yes</button>
                                                        <button onClick={() => setDeleteConfirm(null)} className="p-0.5 text-slate-600 hover:text-slate-400"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setDeleteConfirm(stock.symbol)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <p className="text-xs text-slate-600 px-1">Showing <span className="text-slate-400 font-semibold">{stocks.length}</span> stocks</p>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f1520] border border-white/[0.1] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                            <div>
                                <h2 className="text-lg font-bold text-white">{editingStock ? 'Edit Stock' : 'Add New Stock'}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{editingStock ? 'Update stock information' : 'Enter stock details to add to the market'}</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] rounded-lg transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Symbol *</label>
                                    <input type="text" required value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })} disabled={!!editingStock} className="form-input disabled:opacity-40" placeholder="e.g., NABIL" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Name *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input" placeholder="e.g., NABIL Bank Limited" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Company *</label>
                                    <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="form-input" placeholder="e.g., NMB Bank Ltd" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Price *</label>
                                    <input type="number" step="0.01" min="0" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Previous Close *</label>
                                    <input type="number" step="0.01" min="0" required value={formData.previousClose} onChange={(e) => setFormData({ ...formData, previousClose: parseFloat(e.target.value) })} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Market Cap</label>
                                    <input type="text" value={formData.marketCap} onChange={(e) => setFormData({ ...formData, marketCap: e.target.value })} className="form-input" placeholder="e.g., Rs. 100 Billion" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Volume</label>
                                    <input type="number" min="0" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: parseInt(e.target.value) })} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">P/E Ratio</label>
                                    <input type="number" step="0.01" value={formData.peRatio} onChange={(e) => setFormData({ ...formData, peRatio: parseFloat(e.target.value) })} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">EPS</label>
                                    <input type="number" step="0.01" value={formData.eps} onChange={(e) => setFormData({ ...formData, eps: parseFloat(e.target.value) })} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Dividend Yield (%)</label>
                                    <input type="number" step="0.01" value={formData.dividendYield} onChange={(e) => setFormData({ ...formData, dividendYield: parseFloat(e.target.value) })} className="form-input" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="form-input resize-none" placeholder="Brief description..." />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.07]">
                                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2 border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/[0.2] rounded-xl text-sm font-semibold transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-500/45 text-cyan-300 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span> : editingStock ? 'Update Stock' : 'Add Stock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}