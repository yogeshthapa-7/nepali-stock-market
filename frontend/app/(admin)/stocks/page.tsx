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

    // Form state
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
            const data = await stocksAPI.getAll({
                search: searchTerm || undefined,
                sort: sortBy
            });
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
        setFormData({
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
    };

    const openNewModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Stock Management</h1>
                        <p className="text-slate-600 mt-1">Manage and monitor all listed stocks</p>
                    </div>
                    <button
                        onClick={openNewModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-200 font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add Stock
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-black">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by symbol, name or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white font-medium text-slate-700"
                                >
                                    <option value="updatedAt">Most Recent</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="change_asc">Change: Low to High</option>
                                    <option value="change_desc">Change: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stocks Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                            <p className="mt-4 text-slate-600 font-medium">Loading stocks...</p>
                        </div>
                    ) : stocks.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-900 font-semibold text-lg">No stocks found</p>
                            <p className="text-slate-500 text-sm mt-1">Get started by adding your first stock</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b-2 border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Symbol
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Change
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Volume
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {stocks.map((stock) => (
                                        <tr key={stock._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md">
                                                        {stock.symbol.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{stock.symbol}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 font-medium">
                                                {stock.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {stock.company}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="font-bold text-slate-900 text-lg">₹{stock.price.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm ${
                                                    stock.changePercent >= 0 
                                                        ? 'bg-emerald-100 text-emerald-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {stock.changePercent >= 0 ? (
                                                        <TrendingUp className="w-4 h-4" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4" />
                                                    )}
                                                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600 font-medium">
                                                {stock.volume.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(stock)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit stock"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {deleteConfirm === stock.symbol ? (
                                                        <div className="flex items-center gap-1 bg-red-50 rounded-lg px-2 py-1">
                                                            <button
                                                                onClick={() => handleDelete(stock.symbol)}
                                                                className="text-xs font-bold text-red-600 hover:text-red-700 px-2"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="p-1 text-slate-400 hover:text-slate-600"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(stock.symbol)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete stock"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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

                {/* Footer Info */}
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-slate-600">
                        Showing <span className="font-semibold text-slate-900">{stocks.length}</span> stocks
                    </p>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {editingStock ? 'Edit Stock' : 'Add New Stock'}
                                </h2>
                                <p className="text-sm text-slate-600 mt-1">
                                    {editingStock ? 'Update stock information' : 'Enter stock details to add to the market'}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Symbol *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.symbol}
                                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                        disabled={!!editingStock}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500 transition-all font-medium"
                                        placeholder="e.g., NABIL"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g., NABIL Bank Limited"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Company *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g., NMB Bank Ltd"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Previous Close *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.previousClose}
                                        onChange={(e) => setFormData({ ...formData, previousClose: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Market Cap
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.marketCap}
                                        onChange={(e) => setFormData({ ...formData, marketCap: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g., Rs. 100 Billion"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Volume
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.volume}
                                        onChange={(e) => setFormData({ ...formData, volume: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        P/E Ratio
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.peRatio}
                                        onChange={(e) => setFormData({ ...formData, peRatio: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        EPS
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.eps}
                                        onChange={(e) => setFormData({ ...formData, eps: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Dividend Yield (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.dividendYield}
                                        onChange={(e) => setFormData({ ...formData, dividendYield: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Brief description of the stock..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 font-semibold"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        editingStock ? 'Update Stock' : 'Add Stock'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}