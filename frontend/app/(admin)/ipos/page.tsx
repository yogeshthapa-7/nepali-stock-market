'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    X,
    Calendar,
    Users,
    Filter,
    TrendingUp
} from 'lucide-react';
import { iposAPI, IPO } from '@/lib/api';

export default function AdminIPOsPage() {
    const [ipos, setIpos] = useState<IPO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIPO, setEditingIPO] = useState<IPO | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<{
        symbol: string;
        name: string;
        company: string;
        status: 'upcoming' | 'open' | 'closed' | 'allotted';
        issuePrice: number;
        shares: number;
        sharesAvailable: number;
        minApplication: number;
        maxApplication: number;
        openDate: string;
        closeDate: string;
        description: string;
    }>({
        symbol: '',
        name: '',
        company: '',
        status: 'upcoming',
        issuePrice: 0,
        shares: 0,
        sharesAvailable: 0,
        minApplication: 10,
        maxApplication: 1000,
        openDate: '',
        closeDate: '',
        description: '',
    });

    useEffect(() => {
        fetchIPOs();
    }, [statusFilter]);

    const fetchIPOs = async () => {
        try {
            const data = await iposAPI.getAll({ status: statusFilter || undefined });
            setIpos(data.ipos);
        } catch (error) {
            console.error('Failed to fetch IPOs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredIPOs = ipos.filter(ipo =>
        ipo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ipo.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ipo.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingIPO) {
                await iposAPI.update(editingIPO.symbol, formData);
            } else {
                await iposAPI.create(formData);
            }

            setIsModalOpen(false);
            resetForm();
            fetchIPOs();
        } catch (error) {
            console.error('Failed to save IPO:', error);
            alert('Failed to save IPO. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (ipo: IPO) => {
        setEditingIPO(ipo);
        setFormData({
            symbol: ipo.symbol,
            name: ipo.name,
            company: ipo.company,
            status: ipo.status,
            issuePrice: ipo.issuePrice,
            shares: ipo.shares,
            sharesAvailable: ipo.sharesAvailable,
            minApplication: ipo.minApplication,
            maxApplication: ipo.maxApplication,
            openDate: ipo.openDate.split('T')[0],
            closeDate: ipo.closeDate.split('T')[0],
            description: ipo.description,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (symbol: string) => {
        try {
            await iposAPI.delete(symbol);
            setDeleteConfirm(null);
            fetchIPOs();
        } catch (error) {
            console.error('Failed to delete IPO:', error);
            alert('Failed to delete IPO. Please try again.');
        }
    };

    const resetForm = () => {
        setEditingIPO(null);
        setFormData({
            symbol: '',
            name: '',
            company: '',
            status: 'upcoming',
            issuePrice: 0,
            shares: 0,
            sharesAvailable: 0,
            minApplication: 10,
            maxApplication: 1000,
            openDate: '',
            closeDate: '',
            description: '',
        });
    };

    const openNewModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'upcoming':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'closed':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'allotted':
                return 'bg-violet-100 text-violet-700 border-violet-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">IPO Management</h1>
                        <p className="text-slate-600 mt-1">Manage and monitor all IPO offerings</p>
                    </div>
                    <button
                        onClick={openNewModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl hover:from-violet-700 hover:to-violet-800 shadow-lg shadow-violet-500/30 transition-all duration-200 font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add IPO
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white text-black  rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search IPOs by symbol, name or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none bg-white font-medium text-slate-700"
                            >
                                <option value="">All Status</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                                <option value="allotted">Allotted</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* IPOs Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
                            <p className="mt-4 text-slate-600 font-medium">Loading IPOs...</p>
                        </div>
                    ) : filteredIPOs.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-900 font-semibold text-lg">No IPOs found</p>
                            <p className="text-slate-500 text-sm mt-1">Get started by adding your first IPO</p>
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
                                            Company
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Issue Price
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Shares Available
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Open Date
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {filteredIPOs.map((ipo) => (
                                        <tr key={ipo._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white font-bold text-sm shadow-md">
                                                        {ipo.symbol.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{ipo.symbol}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-slate-900">{ipo.name}</p>
                                                    <p className="text-sm text-slate-600">{ipo.company}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getStatusColor(ipo.status)}`}>
                                                    {ipo.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="font-bold text-slate-900 text-lg">₹{ipo.issuePrice}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-slate-900">{ipo.sharesAvailable.toLocaleString()}</p>
                                                    <p className="text-xs text-slate-500">of {ipo.shares.toLocaleString()}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Calendar className="w-4 h-4 text-violet-500" />
                                                    <span className="font-medium">{new Date(ipo.openDate).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(ipo)}
                                                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                                                        title="Edit IPO"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {deleteConfirm === ipo.symbol ? (
                                                        <div className="flex items-center gap-1 bg-red-50 rounded-lg px-2 py-1">
                                                            <button
                                                                onClick={() => handleDelete(ipo.symbol)}
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
                                                            onClick={() => setDeleteConfirm(ipo.symbol)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete IPO"
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
                        Showing <span className="font-semibold text-slate-900">{filteredIPOs.length}</span> IPOs
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
                                    {editingIPO ? 'Edit IPO' : 'Add New IPO'}
                                </h2>
                                <p className="text-sm text-slate-600 mt-1">
                                    {editingIPO ? 'Update IPO information' : 'Enter IPO details to add to the market'}
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
                                        disabled={!!editingIPO}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500 transition-all font-medium"
                                        placeholder="e.g., NABIL"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'upcoming' | 'open' | 'closed' | 'allotted' })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all font-medium"
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                        <option value="allotted">Allotted</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                        placeholder="e.g., NMB Bank Ltd"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        IPO Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                        placeholder="e.g., NMB Bank IPO"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Issue Price *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.issuePrice}
                                        onChange={(e) => setFormData({ ...formData, issuePrice: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Total Shares *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.shares}
                                        onChange={(e) => setFormData({ ...formData, shares: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Available Shares *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.sharesAvailable}
                                        onChange={(e) => setFormData({ ...formData, sharesAvailable: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Min Application
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.minApplication}
                                        onChange={(e) => setFormData({ ...formData, minApplication: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Max Application
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxApplication}
                                        onChange={(e) => setFormData({ ...formData, maxApplication: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Open Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.openDate}
                                        onChange={(e) => setFormData({ ...formData, openDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Close Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.closeDate}
                                        onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Brief description of the IPO..."
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
                                    className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl hover:from-violet-700 hover:to-violet-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30 font-semibold"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        editingIPO ? 'Update IPO' : 'Add IPO'
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