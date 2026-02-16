'use client';

import Link from 'next/link';
import { TrendingUp, BarChart3, Bell, Shield, ArrowRight, Globe, LineChart } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';

export default function Home() {
    const { user, isLoading } = useAuth();

    // Show navigation for authenticated users
    if (!isLoading && user) {
        return (
            <>
                <Navigation />
                <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
                    {/* Hero Section for Logged In Users */}
                    <section className="py-20 px-4">
                        <div className="max-w-7xl mx-auto text-center">
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                                Welcome back, <span className="text-primary-600">{user.name}</span>!
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                                Ready to explore the Nepal Stock Exchange? Check out the latest market data and manage your portfolio.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/portfolio"
                                    className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium"
                                >
                                    My Portfolio <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/market"
                                    className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors text-lg font-medium"
                                >
                                    View Market
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Features Grid */}
                    <section className="py-20 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                                Quick Access
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <Link href="/market" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                                        <BarChart3 className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Overview</h3>
                                    <p className="text-gray-600">
                                        Live stock prices and market data from NEPSE.
                                    </p>
                                </Link>
                                <Link href="/portfolio" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                        <LineChart className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">My Portfolio</h3>
                                    <p className="text-gray-600">
                                        Track your investments and performance.
                                    </p>
                                </Link>
                                <Link href="/stocks" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                        <Bell className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">All Stocks</h3>
                                    <p className="text-gray-600">
                                        Browse and analyze all available stocks.
                                    </p>
                                </Link>
                                <Link href="/ipos" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                        <Globe className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">IPO Applications</h3>
                                    <p className="text-gray-600">
                                        View and apply for upcoming IPOs.
                                    </p>
                                </Link>
                                <Link href="/news" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                        <Shield className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Market News</h3>
                                    <p className="text-gray-600">
                                        Stay updated with the latest market news.
                                    </p>
                                </Link>
                                <Link href="/watchlist" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                        <TrendingUp className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">My Watchlist</h3>
                                    <p className="text-gray-600">
                                        Monitor your favorite stocks.
                                    </p>
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </>
        );
    }

    // Show landing page for guests
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Hero Section */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Nepali Stock Market</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <Link href="/market" className="text-gray-600 hover:text-primary-600 transition-colors">
                                Market
                            </Link>
                            <Link href="/stocks" className="text-gray-600 hover:text-primary-600 transition-colors">
                                Stocks
                            </Link>
                            <Link href="/ipos" className="text-gray-600 hover:text-primary-600 transition-colors">
                                IPOs
                            </Link>
                            <Link href="/news" className="text-gray-600 hover:text-primary-600 transition-colors">
                                News
                            </Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Content */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Trade Stocks with <span className="text-primary-600">Confidence</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Your gateway to the Nepal Stock Exchange. Real-time data, instant trading, and powerful analytics all in one platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium"
                        >
                            Get Started <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/market"
                            className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors text-lg font-medium"
                        >
                            View Market
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Everything You Need to Trade
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                                <BarChart3 className="w-6 h-6 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Data</h3>
                            <p className="text-gray-600">
                                Live stock prices and market data from NEPSE with instant updates.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <LineChart className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Charts</h3>
                            <p className="text-gray-600">
                                Powerful charting tools with technical indicators and analysis.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                <Bell className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Price Alerts</h3>
                            <p className="text-gray-600">
                                Set alerts for your favorite stocks and never miss an opportunity.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <Globe className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">IPO Tracking</h3>
                            <p className="text-gray-600">
                                Stay updated on upcoming IPOs and apply directly through the platform.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Trading</h3>
                            <p className="text-gray-600">
                                Bank-grade security with two-factor authentication.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Management</h3>
                            <p className="text-gray-600">
                                Track your investments and analyze your portfolio performance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold">Nepali Stock</span>
                            </div>
                            <p className="text-gray-400">
                                Your trusted platform for Nepal Stock Exchange trading.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/market" className="hover:text-white">Market</Link></li>
                                <li><Link href="/stocks" className="hover:text-white">Stocks</Link></li>
                                <li><Link href="/ipos" className="hover:text-white">IPOs</Link></li>
                                <li><Link href="/news" className="hover:text-white">News</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Account</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                                <li><Link href="/signup" className="hover:text-white">Sign Up</Link></li>
                                <li><Link href="/forgot-password" className="hover:text-white">Forgot Password</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>support@nepalistock.com</li>
                                <li>+977-1-XXXXXXX</li>
                                <li>Kathmandu, Nepal</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Nepali Stock Market. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
