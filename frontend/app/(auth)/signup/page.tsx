'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, Mail, Lock, Eye, EyeOff, Loader2, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user?.role === 'admin') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrength = () => {
        const p = formData.password;
        if (!p) return null;
        if (p.length < 6) return { label: 'Weak', color: '#f87171', width: '25%' };
        if (p.length < 8) return { label: 'Fair', color: '#f59e0b', width: '50%' };
        if (p.length < 12) return { label: 'Good', color: '#06b6d4', width: '75%' };
        return { label: 'Strong', color: '#10b981', width: '100%' };
    };
    const strength = passwordStrength();

    return (
        <div className="min-h-screen flex bg-[#080c14]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
                * { font-family: 'DM Sans', sans-serif; }
                .mono { font-family: 'Space Mono', monospace; }
                .grid-bg {
                    background-image: linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .form-input {
                    display: block; width: 100%; padding: 12px 14px 12px 44px;
                    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
                    border-radius: 12px; color: white; font-size: 14px; transition: all 0.2s; outline: none;
                }
                .form-input:focus {
                    border-color: rgba(16,185,129,0.5);
                    background: rgba(16,185,129,0.04);
                    box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
                }
                .form-input::placeholder { color: rgba(148,163,184,0.45); }
                .right-input { padding-right: 44px; }
            `}</style>

            {/* Left Panel – branding */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12">
                {/* Ambient gradients */}
                <div className="absolute inset-0 bg-[#080c14]" />
                <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
                <div className="absolute inset-0 grid-bg opacity-60" />
                <div className="absolute inset-0 border-r border-white/[0.06]" />

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="relative w-10 h-10">
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-xl blur-sm" />
                        <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <span className="mono text-sm font-bold text-white tracking-wider">MeroShare</span>
                        <div className="text-[10px] text-emerald-400/60 tracking-[0.2em] uppercase">Investor Portal</div>
                    </div>
                </div>

                {/* Center content */}
                <div className="relative space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-emerald-400 rounded-full" />
                            <span className="mono text-xs text-emerald-400/70 tracking-widest uppercase">Get Started</span>
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Join Nepal's<br />
                            <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(16,185,129,0.6)' }}>Investor</span>{' '}
                            Community
                        </h2>
                        <p className="text-slate-500 mt-4 leading-relaxed text-sm max-w-xs">
                            Create your free account and start investing in NEPSE with real-time data, IPO access, and portfolio tracking.
                        </p>
                    </div>

                    {/* Feature list */}
                    <div className="space-y-3">
                        {[
                            { icon: '📊', text: 'Real-time NEPSE market data' },
                            { icon: '🏦', text: 'Apply for IPOs instantly' },
                            { icon: '💼', text: 'Track your portfolio' },
                            { icon: '📰', text: 'Curated market news' },
                        ].map((f) => (
                            <div key={f.text} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-base flex-shrink-0">
                                    {f.icon}
                                </div>
                                <span className="text-sm text-slate-400">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom tagline */}
                <div className="relative">
                    <div className="flex items-center gap-2 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Your data is encrypted and secure. We never share your personal information with third parties.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel – form */}
            <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10 relative">
                {/* Subtle radial glow */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(16,185,129,0.05), transparent 60%)' }} />

                <div className="relative w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="relative w-9 h-9">
                            <div className="absolute inset-0 bg-emerald-400/20 rounded-xl blur-sm" />
                            <div className="relative w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
                            </div>
                        </div>
                        <span className="mono text-sm font-bold text-white tracking-wider">MeroShare</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-5 bg-emerald-400 rounded-full" />
                            <span className="mono text-[10px] text-emerald-400/70 tracking-widest uppercase">New Account</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Create your account</h1>
                        <p className="text-sm text-slate-500 mt-1">Start your investment journey today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-slate-600" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-600" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-slate-600" />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="+977-98XXXXXXXX"
                                    autoComplete="tel"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-600" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-input right-input"
                                    placeholder="Min 8 characters"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {/* Password strength bar */}
                            {strength && (
                                <div className="mt-2 space-y-1">
                                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, background: strength.color }} />
                                    </div>
                                    <div className="flex justify-end">
                                        <span className="mono text-[10px]" style={{ color: strength.color }}>{strength.label}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-600" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                />
                                {/* Match indicator */}
                                {formData.confirmPassword && (
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                        <div className={`w-2 h-2 rounded-full ${formData.password === formData.confirmPassword ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3 p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                required
                                className="w-4 h-4 mt-0.5 accent-emerald-400 flex-shrink-0"
                            />
                            <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer leading-relaxed">
                                I agree to the{' '}
                                <Link href="/terms" className="text-emerald-400 hover:text-emerald-300 transition-colors">Terms of Service</Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors">Privacy Policy</Link>
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/50 text-emerald-300 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}