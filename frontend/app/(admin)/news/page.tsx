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

    // Form state
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
            const data = await newsAPI.getAll({
                category: categoryFilter || undefined,
                limit: 100
            });
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
        setFormData({
            title: '',
            summary: '',
            content: '',
            category: 'market',
            featured: false,
            image: '',
        });
    };

    const openNewModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'market':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ipo':
                return 'bg-violet-100 text-violet-700 border-violet-200';
            case 'corporate':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'economy':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'analysis':
                return 'bg-teal-100 text-teal-700 border-teal-200';
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
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">News Management</h1>
                        <p className="text-slate-600 mt-1">Manage and publish market news articles</p>
                    </div>
                    <button
                        onClick={openNewModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 shadow-lg shadow-amber-500/30 transition-all duration-200 font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add News
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white text-black rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search news articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white font-medium text-slate-700"
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
                </div>

                {/* News Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
                            <p className="mt-4 text-slate-600 font-medium">Loading news...</p>
                        </div>
                    ) : filteredNews.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Newspaper className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-900 font-semibold text-lg">No news found</p>
                            <p className="text-slate-500 text-sm mt-1">Get started by adding your first news article</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b-2 border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Featured
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Published
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {filteredNews.map((item) => (
                                        <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="max-w-md">
                                                    <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                                                    <p className="text-sm text-slate-600 line-clamp-2 mt-1">{item.summary}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getCategoryColor(item.category)}`}>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {item.featured ? (
                                                    <div className="inline-flex items-center justify-center w-9 h-9 bg-amber-100 rounded-lg">
                                                        <Star className="w-5 h-5 text-amber-600 fill-current" />
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center justify-center w-9 h-9 bg-slate-100 rounded-lg">
                                                        <StarOff className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                                                {new Date(item.publishedAt).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                        title="Edit news"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {deleteConfirm === item._id ? (
                                                        <div className="flex items-center gap-1 bg-red-50 rounded-lg px-2 py-1">
                                                            <button
                                                                onClick={() => handleDelete(item._id)}
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
                                                            onClick={() => setDeleteConfirm(item._id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete news"
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
                        Showing <span className="font-semibold text-slate-900">{filteredNews.length}</span> articles
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
                                    {editingNews ? 'Edit News' : 'Add New News'}
                                </h2>
                                <p className="text-sm text-slate-600 mt-1">
                                    {editingNews ? 'Update news article' : 'Create a new news article'}
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
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                    placeholder="Enter news headline"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Summary *
                                </label>
                                <textarea
                                    required
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Brief summary of the news..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Content *
                                </label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Full news content..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-medium"
                                    >
                                        <option value="market">Market</option>
                                        <option value="ipo">IPO</option>
                                        <option value="corporate">Corporate</option>
                                        <option value="economy">Economy</option>
                                        <option value="analysis">Analysis</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="w-5 h-5 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                                />
                                <label htmlFor="featured" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                    Mark as Featured News
                                </label>
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
                                    className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30 font-semibold"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        editingNews ? 'Update News' : 'Add News'
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