'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { TrendingUp, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState('');

    const handleSubmit = async () => {
        setDebugInfo('Form submitted...');
        console.log('=== LOGIN FORM SUBMITTED ===');
        console.log('Email:', email);
        console.log('Password length:', password.length);

        setIsLoading(true);
        setError('');

        try {
            setDebugInfo('Calling login API...');
            console.log('Starting login process...');

            await login(email, password);

            setDebugInfo('Login successful! Checking user role...');
            console.log('Login function completed successfully');

            // Wait a bit for localStorage to be updated
            setTimeout(() => {
                const userData = localStorage.getItem('user');
                console.log('User data from localStorage:', userData);
                setDebugInfo(`User data: ${userData ? 'Found' : 'Not found'}`);

                if (userData) {
                    const user = JSON.parse(userData);
                    console.log('Parsed user object:', user);
                    console.log('User role:', user.role);

                    setDebugInfo(`User role: ${user.role}. Redirecting...`);

                    // Redirect based on user role
                    if (user.role === 'admin') {
                        console.log('User is admin, redirecting to /dashboard');
                        router.push('/dashboard');
                    } else {
                        console.log('User is regular user, redirecting to /user-dashboard');
                        router.push('/user-dashboard');
                    }
                } else {
                    console.log('No user data found, redirecting to /');
                    setDebugInfo('No user data found. Redirecting to home...');
                    router.push('/');
                }
                setIsLoading(false);
            }, 500); // Increased timeout to 500ms
        } catch (err: any) {
            console.error('=== LOGIN ERROR ===');
            console.error('Error object:', err);
            console.error('Error message:', err.message);
            console.error('Error response:', err.response);

            const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
            setDebugInfo(`ERROR: ${errorMsg}`);
            setError(errorMsg);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-950">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Animated Background */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative text-center">
                        <Link href="/" className="inline-flex items-center gap-3 mb-8">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">MeroShare</span>
                        </Link>
                        <h2 className="text-3xl font-bold text-white">Welcome back</h2>
                        <p className="mt-2 text-slate-400">
                            Sign in to continue to your dashboard
                        </p>
                    </div>

                    <div className="mt-8 space-y-6 relative">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {debugInfo && (
                            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-xl text-sm font-mono">
                                {debugInfo}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSubmit();
                                            }
                                        }}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder-slate-500 transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSubmit();
                                            }
                                        }}
                                        className="block w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder-slate-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-300" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-slate-500 hover:text-slate-300" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500/50 text-emerald-500"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <Link href="/forgot-password" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30 font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>

                        <p className="text-center text-sm text-slate-400">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-violet-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                {/* Animated shapes */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="relative h-full flex flex-col justify-center items-center px-12 text-white">
                    <div className="w-28 h-28 bg-white/20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm">
                        <TrendingUp className="w-16 h-16" />
                    </div>
                    <h2 className="text-4xl font-bold text-center mb-4">
                        Trade Smarter
                    </h2>
                    <p className="text-xl text-center text-white/80 max-w-md">
                        Access real-time market data, manage your portfolio, and make informed investment decisions.
                    </p>
                </div>
            </div>
        </div>
    );
}
