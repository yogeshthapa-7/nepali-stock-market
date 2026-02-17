'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    X,
    Star,
    StarOff,
    Filter,
    Newspaper
} from 'lucide-react';
import { newsAPI, News as NewsType } from '@/lib/api';

export default function AdminNewsPage() {
    const [news, setNews] = useState<NewsType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<NewsType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        content: '',
        category: 'market',
        featured: false,
        image: '',
    });

    useEffect(() => {
        fetchNews();
    }, [categoryFilter]);

    const fetchNews = async () => {
        try {
            const data = await newsAPI.getAll({ category: categoryFilter || undefined, limit: 100 });
            setNews(data.news);
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingNews) {
                await newsAPI.update(editingNews._id, formData);
            } else {
                await newsAPI.create(formData);
            }
            setIsModalOpen(false);
            resetForm();
            fetchNews();
        } catch (error) {
            console.error('Failed to save news:', error);
            alert('Failed to save news. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (item: NewsType) => {
        setEditingNews(item);
        setFormData({
            title: item.title,
            summary: item.summary,
            content: item.content,
            category: item.category,
            featured: item.featured,
            image: item.image || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await newsAPI.delete(id);
            setDeleteConfirm(null);
            fetchNews();
        } catch (error) {
            console.error('Failed to delete news:', error);
            alert('Failed to delete news. Please try again.');
        }
    };

    const resetForm = () => {
        setEditingNews(null);
        setFormData({ title: '', summary: '', content: '', category: 'market', featured: false, image: '' });
    };

    const openNewModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const categoryConfig: Record<string, {bg: string, text: string, border: string}> = {
        market:    { bg: 'rgba(6,182,212,0.1)',   text: '#06b6d4', border: 'rgba(6,182,212,0.2)' },
        ipo:       { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
        corporate: { bg: 'rgba(16,185,129,0.1)',  text: '#10b981', border: 'rgba(16,185,129,0.2)' },
        economy:   { bg: 'rgba(245,158,11,0.1)',  text: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
        analysis:  { bg: 'rgba(20,184,166,0.1)',  text: '#14b8a6', border: 'rgba(20,184,166,0.2)' },
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
                .form-input:focus { border-color: rgba(245,158,11,0.5); background: rgba(245,158,11,0.04); box-shadow: 0 0 0 3px rgba(245,158,11,0.08); }
                .form-input::placeholder { color: rgba(148,163,184,0.5); }
                .form-input option { background: #1a1f2e; color: white; }
            `}</style>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-5 bg-amber-400 rounded-full" />
                        <span className="mono text-xs text-amber-400/70 tracking-widest uppercase">Management</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">News Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and publish market news articles</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/45 text-amber-300 rounded-xl transition-all duration-200 text-sm font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    Add News
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                        type="text"
                        placeholder="Search news articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0d1420] border border-white/[0.07] hover:border-white/[0.12] focus:border-amber-500/40 focus:bg-amber-500/[0.03] rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-[#0d1420] border border-white/[0.07] hover:border-white/[0.12] focus:border-amber-500/40 rounded-xl text-sm text-slate-400 outline-none transition-all appearance-none"
                        style={{minWidth: '160px'}}
                    >
                        <option value="">All Categories</option>
                        <option value="market">Market</option>
                        <option value="ipo">IPO</option>
                        <option value="corporate">Corporate</option>
                        <option value="economy">Economy</option>
                        <option value="analysis">Analysis</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                        </div>
                        <p className="text-sm text-slate-600">Loading news...</p>
                    </div>
                ) : filteredNews.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                            <Newspaper className="w-6 h-6 text-slate-700" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No articles found</p>
                        <p className="text-xs text-slate-700 mt-1">Get started by adding your first article</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    {['Title', 'Category', 'Featured', 'Published', 'Actions'].map(h => (
                                        <th key={h} className={`px-5 py-3 text-[10px] mono font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap ${h === 'Actions' ? 'text-right' : h === 'Featured' ? 'text-center' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {filteredNews.map((item) => {
                                    const cc = categoryConfig[item.category] || categoryConfig.market;
                                    return (
                                        <tr key={item._id} className="table-row transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="max-w-xs">
                                                    <div className="text-sm font-semibold text-slate-200 line-clamp-1">{item.title}</div>
                                                    <div className="text-xs text-slate-600 line-clamp-1 mt-0.5">{item.summary}</div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <span className="inline-flex px-2.5 py-1 rounded-lg mono text-[10px] font-bold uppercase tracking-wider" style={{background: cc.bg, color: cc.text, border: `1px solid ${cc.border}`}}>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                                {item.featured ? (
                                                    <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center justify-center w-8 h-8 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                                                        <StarOff className="w-4 h-4 text-slate-700" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleEdit(item)} className="p-2 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    {deleteConfirm === item._id ? (
                                                        <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1">
                                                            <button onClick={() => handleDelete(item._id)} className="text-[11px] mono font-bold text-red-400 hover:text-red-300 px-1">Yes</button>
                                                            <button onClick={() => setDeleteConfirm(null)} className="p-0.5 text-slate-600 hover:text-slate-400"><X className="w-3 h-3" /></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setDeleteConfirm(item._id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
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
            <p className="text-xs text-slate-600 px-1">Showing <span className="text-slate-400 font-semibold">{filteredNews.length}</span> articles</p>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f1520] border border-white/[0.1] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                            <div>
                                <h2 className="text-lg font-bold text-white">{editingNews ? 'Edit Article' : 'New Article'}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{editingNews ? 'Update news article' : 'Create a new news article'}</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] rounded-lg transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Title *</label>
                                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="form-input" placeholder="Enter news headline" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Summary *</label>
                                <textarea required value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} rows={2} className="form-input resize-none" placeholder="Brief summary..." />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Content *</label>
                                <textarea required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} className="form-input resize-none" placeholder="Full news content..." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="form-input">
                                        <option value="market">Market</option>
                                        <option value="ipo">IPO</option>
                                        <option value="corporate">Corporate</option>
                                        <option value="economy">Economy</option>
                                        <option value="analysis">Analysis</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Image URL</label>
                                    <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="form-input" placeholder="https://..." />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3.5 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl">
                                <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 accent-amber-400" />
                                <label htmlFor="featured" className="text-sm font-semibold text-slate-400 cursor-pointer flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-400" />
                                    Mark as Featured Article
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.07]">
                                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2 border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/[0.2] rounded-xl text-sm font-semibold transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/45 text-amber-300 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span> : editingNews ? 'Update Article' : 'Publish Article'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}