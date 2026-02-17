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
    TrendingUp,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    User as UserIcon,
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
    const [viewApplicationsIPO, setViewApplicationsIPO] = useState<IPO | null>(null);

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

    const statusConfig: Record<string, {bg: string, text: string, border: string, dot: string}> = {
        open:     { bg: 'rgba(16,185,129,0.1)',  text: '#10b981', border: 'rgba(16,185,129,0.25)',  dot: '#10b981' },
        upcoming: { bg: 'rgba(6,182,212,0.1)',   text: '#06b6d4', border: 'rgba(6,182,212,0.25)',   dot: '#06b6d4' },
        closed:   { bg: 'rgba(100,116,139,0.1)', text: '#94a3b8', border: 'rgba(100,116,139,0.25)', dot: '#94a3b8' },
        allotted: { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa', border: 'rgba(167,139,250,0.25)', dot: '#a78bfa' },
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
                .form-input:focus { border-color: rgba(167,139,250,0.5); background: rgba(167,139,250,0.05); box-shadow: 0 0 0 3px rgba(167,139,250,0.1); }
                .form-input::placeholder { color: rgba(148,163,184,0.5); }
                .form-input option { background: #1a1f2e; color: white; }
            `}</style>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-5 bg-violet-400 rounded-full" />
                        <span className="mono text-xs text-violet-400/70 tracking-widest uppercase">Management</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">IPO Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and monitor all IPO offerings</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 hover:border-violet-500/50 text-violet-300 rounded-xl transition-all duration-200 text-sm font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    Add IPO
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
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0d1420] border border-white/[0.07] hover:border-white/[0.12] focus:border-violet-500/40 focus:bg-violet-500/[0.03] rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-[#0d1420] border border-white/[0.07] hover:border-white/[0.12] focus:border-violet-500/40 rounded-xl text-sm text-slate-400 outline-none transition-all appearance-none"
                        style={{minWidth: '140px'}}
                    >
                        <option value="">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="allotted">Allotted</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                        </div>
                        <p className="text-sm text-slate-600">Loading IPOs...</p>
                    </div>
                ) : filteredIPOs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="w-6 h-6 text-slate-700" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No IPOs found</p>
                        <p className="text-xs text-slate-700 mt-1">Get started by adding your first IPO</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    {['Symbol', 'Company', 'Status', 'Issue Price', 'Shares Available', 'Open Date', 'Applications', 'Actions'].map(h => (
                                        <th key={h} className={`px-5 py-3 text-[10px] mono font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap ${h === 'Issue Price' || h === 'Shares Available' || h === 'Actions' ? 'text-right' : h === 'Applications' ? 'text-center' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {filteredIPOs.map((ipo) => {
                                    const sc = statusConfig[ipo.status] || statusConfig.closed;
                                    return (
                                        <tr key={ipo._id} className="table-row transition-colors">
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/10 border border-violet-500/20">
                                                        <span className="mono text-xs font-bold text-violet-400">{ipo.symbol.charAt(0)}</span>
                                                    </div>
                                                    <span className="mono text-sm font-bold text-white">{ipo.symbol}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="text-sm font-semibold text-slate-200">{ipo.name}</div>
                                                <div className="text-xs text-slate-600 mt-0.5">{ipo.company}</div>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mono text-[10px] font-bold uppercase tracking-wider" style={{background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`}}>
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{background: sc.dot}} />
                                                    {ipo.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                                <span className="mono text-sm font-bold text-white">₹{ipo.issuePrice}</span>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                                <div className="mono text-sm font-bold text-slate-200">{ipo.sharesAvailable.toLocaleString()}</div>
                                                <div className="text-[11px] text-slate-600">of {ipo.shares.toLocaleString()}</div>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Calendar className="w-3.5 h-3.5 text-violet-500/60" />
                                                    <span className="text-sm">{new Date(ipo.openDate).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => setViewApplicationsIPO(ipo)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${ipo.applications?.length > 0 ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20' : 'bg-white/[0.03] text-slate-600 border border-white/[0.06]'}`}
                                                >
                                                    <Users className="w-3.5 h-3.5" />
                                                    {ipo.applications?.length || 0}
                                                </button>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(ipo)}
                                                        className="p-2 text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    {deleteConfirm === ipo.symbol ? (
                                                        <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1">
                                                            <button onClick={() => handleDelete(ipo.symbol)} className="text-[11px] mono font-bold text-red-400 hover:text-red-300 px-1">Yes</button>
                                                            <button onClick={() => setDeleteConfirm(null)} className="p-0.5 text-slate-600 hover:text-slate-400"><X className="w-3 h-3" /></button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(ipo.symbol)}
                                                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <p className="text-xs text-slate-600 px-1">Showing <span className="text-slate-400 font-semibold">{filteredIPOs.length}</span> IPOs</p>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f1520] border border-white/[0.1] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                            <div>
                                <h2 className="text-lg font-bold text-white">{editingIPO ? 'Edit IPO' : 'Add New IPO'}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{editingIPO ? 'Update IPO information' : 'Enter IPO details to add to the market'}</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] rounded-lg transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Symbol *</label>
                                    <input type="text" required value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })} disabled={!!editingIPO} className="form-input disabled:opacity-40" placeholder="e.g., NABIL" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="form-input">
                                        <option value="upcoming">Upcoming</option>
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                        <option value="allotted">Allotted</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Company Name *</label>
                                    <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="form-input" placeholder="e.g., NMB Bank Ltd" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">IPO Name *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input" placeholder="e.g., NMB Bank IPO" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Issue Price *</label>
                                    <input type="number" step="0.01" min="0" required value={formData.issuePrice} onChange={(e) => setFormData({ ...formData, issuePrice: parseFloat(e.target.value) })} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Total Shares *</label>
                                    <input type="number" min="0" required value={formData.shares} onChange={(e) => setFormData({ ...formData, shares: parseInt(e.target.value) })} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Available Shares *</label>
                                    <input type="number" min="0" required value={formData.sharesAvailable} onChange={(e) => setFormData({ ...formData, sharesAvailable: parseInt(e.target.value) })} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Min Application</label>
                                    <input type="number" min="1" value={formData.minApplication} onChange={(e) => setFormData({ ...formData, minApplication: parseInt(e.target.value) })} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Max Application</label>
                                    <input type="number" min="1" value={formData.maxApplication} onChange={(e) => setFormData({ ...formData, maxApplication: parseInt(e.target.value) })} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Open Date *</label>
                                    <input type="date" required value={formData.openDate} onChange={(e) => setFormData({ ...formData, openDate: e.target.value })} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Close Date *</label>
                                    <input type="date" required value={formData.closeDate} onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })} className="form-input" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="form-input resize-none" placeholder="Brief description of the IPO..." />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.07]">
                                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2 border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/[0.2] rounded-xl text-sm font-semibold transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 hover:border-violet-500/50 text-violet-300 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span> : editingIPO ? 'Update IPO' : 'Add IPO'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Applications Modal */}
            {viewApplicationsIPO && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f1520] border border-white/[0.1] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                            <div>
                                <h2 className="text-lg font-bold text-white">Applications — <span className="text-violet-400 mono">{viewApplicationsIPO.symbol}</span></h2>
                                <p className="text-xs text-slate-500 mt-0.5">{viewApplicationsIPO.company} · {viewApplicationsIPO.applications?.length || 0} applications</p>
                            </div>
                            <button onClick={() => setViewApplicationsIPO(null)} className="p-2 text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] rounded-lg transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            {viewApplicationsIPO.applications && viewApplicationsIPO.applications.length > 0 ? (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Total Applied', value: viewApplicationsIPO.applications.length, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
                                            { label: 'Allotted', value: viewApplicationsIPO.applications.filter(a => a.status === 'allotted').length, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
                                            { label: 'Not Allotted', value: viewApplicationsIPO.applications.filter(a => a.status === 'not_allotted').length, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
                                        ].map(s => (
                                            <div key={s.label} className="p-4 rounded-xl text-center" style={{background: s.bg, border: `1px solid ${s.border}`}}>
                                                <div className="mono text-2xl font-bold" style={{color: s.color}}>{s.value}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/[0.06]">
                                                    {['User', 'Shares Applied', 'Amount', 'Applied Date', 'Status'].map(h => (
                                                        <th key={h} className={`px-4 py-2.5 text-[10px] mono font-bold text-slate-600 uppercase tracking-wider ${h === 'Shares Applied' || h === 'Amount' ? 'text-right' : h === 'Status' ? 'text-center' : 'text-left'}`}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.04]">
                                                {viewApplicationsIPO.applications.map((app, index) => (
                                                    <tr key={index} className="hover:bg-white/[0.02]">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                                                    <UserIcon className="w-3.5 h-3.5 text-violet-400" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-slate-200">{app.userId?.name || 'Unknown'}</div>
                                                                    <div className="text-xs text-slate-600">{app.userId?.email || ''}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right mono text-sm font-semibold text-slate-200">{app.sharesApplied.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right mono text-sm text-slate-400">₹{(app.sharesApplied * viewApplicationsIPO.issuePrice).toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-500">{new Date(app.appliedDate).toLocaleDateString()}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            {app.status === 'pending' && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs mono"><Clock className="w-3 h-3" />Pending</span>}
                                                            {app.status === 'allotted' && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs mono"><CheckCircle className="w-3 h-3" />Allotted</span>}
                                                            {app.status === 'not_allotted' && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs mono"><XCircle className="w-3 h-3" />Rejected</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                                        <Users className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <p className="text-sm text-slate-500">No applications yet for this IPO</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}