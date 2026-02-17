'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    X,
    CheckCircle,
    XCircle,
    Shield,
    User
} from 'lucide-react';
import { usersAPI, User as UserType } from '@/lib/api';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        isVerified: false,
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await usersAPI.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingUser) {
                const updateData = { name: formData.name, email: formData.email, role: formData.role, isVerified: formData.isVerified };
                await usersAPI.update(editingUser._id, updateData);
            } else {
                await usersAPI.create({ name: formData.name, email: formData.email, password: formData.password, role: formData.role });
            }
            setIsModalOpen(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Failed to save user:', error);
            alert('Failed to save user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (user: UserType) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, password: '', role: user.role, isVerified: user.isVerified });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await usersAPI.delete(id);
            setDeleteConfirm(null);
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user. Please try again.');
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'user', isVerified: false });
    };

    const openNewModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    // Generate a consistent avatar color based on name
    const getAvatarColors = (name: string) => {
        const colors = [
            { bg: 'rgba(6,182,212,0.15)', text: '#06b6d4', border: 'rgba(6,182,212,0.25)' },
            { bg: 'rgba(16,185,129,0.15)', text: '#10b981', border: 'rgba(16,185,129,0.25)' },
            { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
            { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
            { bg: 'rgba(248,113,113,0.15)', text: '#f87171', border: 'rgba(248,113,113,0.25)' },
        ];
        return colors[name.charCodeAt(0) % colors.length];
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
                .form-input:focus { border-color: rgba(16,185,129,0.5); background: rgba(16,185,129,0.03); box-shadow: 0 0 0 3px rgba(16,185,129,0.08); }
                .form-input::placeholder { color: rgba(148,163,184,0.5); }
                .form-input option { background: #1a1f2e; color: white; }
            `}</style>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-5 bg-emerald-400 rounded-full" />
                        <span className="mono text-xs text-emerald-400/70 tracking-widest uppercase">Management</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage user accounts and permissions</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/45 text-emerald-300 rounded-xl transition-all duration-200 text-sm font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0d1420] border border-white/[0.07] hover:border-white/[0.12] focus:border-emerald-500/40 focus:bg-emerald-500/[0.03] rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-[#0d1420] border border-white/[0.07] rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                        </div>
                        <p className="text-sm text-slate-600">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                            <User className="w-6 h-6 text-slate-700" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No users found</p>
                        <p className="text-xs text-slate-700 mt-1">Get started by adding your first user</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    {['Name', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                                        <th key={h} className={`px-5 py-3 text-[10px] mono font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap ${h === 'Actions' ? 'text-right' : h === 'Verified' ? 'text-center' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {filteredUsers.map((user) => {
                                    const avatarColor = getAvatarColors(user.name);
                                    return (
                                        <tr key={user._id} className="table-row transition-colors">
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background: avatarColor.bg, border: `1px solid ${avatarColor.border}`}}>
                                                        <span className="mono text-xs font-bold" style={{color: avatarColor.text}}>{user.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500">{user.email}</td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {user.role === 'admin' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mono text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                                        <Shield className="w-3 h-3" />
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mono text-[10px] font-bold uppercase tracking-wider bg-white/[0.04] text-slate-500 border border-white/[0.07]">
                                                        <User className="w-3 h-3" />
                                                        User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                                {user.isVerified ? (
                                                    <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center justify-center w-8 h-8 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                                                        <XCircle className="w-4 h-4 text-slate-700" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleEdit(user)} className="p-2 text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    {deleteConfirm === user._id ? (
                                                        <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1">
                                                            <button onClick={() => handleDelete(user._id)} className="text-[11px] mono font-bold text-red-400 hover:text-red-300 px-1">Yes</button>
                                                            <button onClick={() => setDeleteConfirm(null)} className="p-0.5 text-slate-600 hover:text-slate-400"><X className="w-3 h-3" /></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setDeleteConfirm(user._id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
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
            <p className="text-xs text-slate-600 px-1">Showing <span className="text-slate-400 font-semibold">{filteredUsers.length}</span> users</p>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f1520] border border-white/[0.1] rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                            <div>
                                <h2 className="text-lg font-bold text-white">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{editingUser ? 'Update user information' : 'Create a new user account'}</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] rounded-lg transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Name *</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email *</label>
                                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="form-input" placeholder="email@example.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                                    {editingUser ? 'New Password (leave blank to keep)' : 'Password *'}
                                </label>
                                <input type="password" required={!editingUser} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="form-input" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Role</label>
                                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="form-input">
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {editingUser && (
                                <div className="flex items-center gap-3 p-3.5 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl">
                                    <input type="checkbox" id="isVerified" checked={formData.isVerified} onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })} className="w-4 h-4 accent-emerald-400" />
                                    <label htmlFor="isVerified" className="text-sm font-semibold text-slate-400 cursor-pointer flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        Verified Account
                                    </label>
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.07]">
                                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2 border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/[0.2] rounded-xl text-sm font-semibold transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/45 text-emerald-300 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span> : editingUser ? 'Update User' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}