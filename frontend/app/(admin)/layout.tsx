'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import {
  TrendingUp,
  LayoutDashboard,
  Users,
  LineChart,
  Newspaper,
  Briefcase,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && user.role !== 'admin') {
      router.push('/user-dashboard');
    }
    if (typeof window !== 'undefined') {
      setActiveLink(window.location.pathname);
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const adminLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/stocks', label: 'Stocks', icon: LineChart },
    { href: '/news', label: 'News', icon: Newspaper },
    { href: '/ipos', label: 'IPOs', icon: Briefcase },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-teal-500/10 border border-cyan-500/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{animationDelay: `${i * 0.15}s`}} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
        .sidebar-link-active {
          background: linear-gradient(90deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.05) 100%);
          border-left: 2px solid #06b6d4;
          color: #06b6d4;
        }
        .sidebar-link:hover {
          background: linear-gradient(90deg, rgba(6,182,212,0.08) 0%, transparent 100%);
        }
        .glass-header {
          background: rgba(8, 12, 20, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glass-sidebar {
          background: rgba(8, 12, 20, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .grid-bg {
          background-image: linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Top Navigation */}
      <header className="glass-header border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[60px]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg md:hidden transition-colors"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative w-9 h-9">
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-xl blur-sm group-hover:bg-cyan-400/30 transition-colors" />
                  <div className="relative w-9 h-9 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4.5 h-4.5 text-white" style={{width:'18px',height:'18px'}} />
                  </div>
                </div>
                <div>
                  <span className="mono text-sm font-bold text-white tracking-wider">ADMIN</span>
                  <div className="text-[10px] text-cyan-400/70 tracking-[0.2em] uppercase">Control Panel</div>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 mr-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">LIVE</span>
              </div>
              <Link href="/user-dashboard" className="px-3 py-1.5 text-xs text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all border border-transparent hover:border-cyan-500/20">
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-40 w-64 glass-sidebar border-r border-white/[0.06] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <nav className="p-3 pt-20 md:pt-5">
            <div className="mb-4 px-3">
              <span className="text-[10px] font-semibold text-slate-600 tracking-[0.2em] uppercase">Navigation</span>
            </div>
            <ul className="space-y-0.5">
              {adminLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = activeLink === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => { setIsOpen(false); setActiveLink(link.href); }}
                      className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive ? 'sidebar-link-active' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-cyan-500/15' : 'bg-white/[0.03] group-hover:bg-white/[0.06]'}`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      </div>
                      <span className="text-sm font-medium">{link.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>

            {/* User Badge */}
            <div className="mt-4 mx-1 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/30 to-teal-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-cyan-400">A</span>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Administrator</div>
                  <div className="text-[10px] text-slate-500">Full Access</div>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 grid-bg min-h-[calc(100vh-60px)] p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}