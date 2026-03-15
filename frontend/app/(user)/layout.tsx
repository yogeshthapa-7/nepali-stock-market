'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { TrendingUp } from 'lucide-react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && user.role === 'admin') {
      router.push('/dashboard');
    } else if (!isLoading && user && user.role === 'user') {
      if (window.location.pathname === '/') {
        router.push('/user-dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 bg-emerald-400/15 rounded-2xl blur-sm animate-pulse" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14]">
      <div className="grid-bg min-h-screen" style={{
        backgroundImage: 'linear-gradient(rgba(6,182,212,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.035) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}>
        {children}
      </div>
    </div>
  );
}
