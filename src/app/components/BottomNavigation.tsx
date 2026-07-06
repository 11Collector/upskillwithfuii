"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, PieChart, Users, Wallet, Brain, LayoutDashboard } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

function BottomNavigationInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [enteredDashboard, setEnteredDashboard] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // เมื่อเข้า dashboard ให้ mark session, กลับหน้าแรกค่อย clear
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (pathname.startsWith('/dashboard')) {
        sessionStorage.setItem('enteredDashboard', '1');
        setEnteredDashboard(true);
      } else if (pathname === '/') {
        sessionStorage.removeItem('enteredDashboard');
        setEnteredDashboard(false);
      } else {
        setEnteredDashboard(sessionStorage.getItem('enteredDashboard') === '1');
      }
    }
  }, [pathname]);

  // Dashboard flow only when logged in
  const isDashboardFlow =
    !!user && (
      pathname.startsWith('/dashboard') ||
      (pathname.startsWith('/library') && enteredDashboard) ||
      pathname === '/tools/deep-work' ||
      pathname === '/tools/focus-room' ||
      pathname === '/shop'
    );

  const isDark = false;

  const noNavPaths: string[] = [];

  if (noNavPaths.includes(pathname)) return null;

  if (isDashboardFlow) {
    const navItems = [
      { id: 'home', label: 'หน้าหลัก', icon: <LayoutDashboard size={24} />, path: '/dashboard?tab=home' },
      { id: 'overview', label: 'อวาตาร์', icon: "👤", path: '/dashboard?tab=overview' },
      { id: 'quests', label: 'ภารกิจ', icon: "🎯", path: '/dashboard?tab=quests' },
      { id: 'identity', label: 'ตัวตน', icon: "🧬", path: '/dashboard?tab=identity' },
      { id: 'resources', label: 'อัพสกิล', icon: "🧠", path: '/dashboard?tab=resources' },
    ];

    const containerClass = isDark
      ? "bottom-nav fixed bottom-0 left-0 right-0 md:hidden bg-[#0F0F10]/95 backdrop-blur-xl border-t border-white/5 flex justify-around items-center h-[5.5rem] pb-safe px-3 z-[10000] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
      : "bottom-nav fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 flex justify-around items-center h-[5.5rem] pb-safe px-3 z-[10000] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]";

    return (
      <div className={containerClass}>
        {navItems.map((item) => {
          const tabParam = searchParams.get('tab');
          const isHomeActive = item.id === 'home' && (!tabParam || tabParam === 'home');
          const isOtherActive = item.id !== 'home' && tabParam === item.id;
          const isActive = pathname.startsWith('/dashboard') && (isHomeActive || isOtherActive);

          const itemClass = isActive
            ? (isDark ? "bg-white/10 text-amber-400 border border-white/10 shadow-lg -translate-y-1" : "bg-slate-900 text-white shadow-lg -translate-y-1")
            : (isDark ? "text-slate-500" : "text-slate-400");

          return (
            <Link key={item.id} href={item.path} className={`relative flex flex-col items-center justify-center flex-1 py-2.5 px-2 rounded-2xl transition-all duration-300 active:scale-95 ${itemClass}`}>
              <div className="text-2xl mb-1 flex items-center justify-center">
                {item.icon}
              </div>
              <span className={`text-[10px] font-black tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  // Standard Navigation
  const standardItems = [
    { id: 'home', label: 'หน้าหลัก', icon: Home, path: user ? '/dashboard' : '/' },
    { id: 'life', label: 'ชีวิต', icon: PieChart, path: '/tools/wheel-of-life' },
    { id: 'work', label: 'ทำงาน', icon: Users, path: '/tools/disc' },
    { id: 'money', label: 'การเงิน', icon: Wallet, path: '/tools/money-avatar' },
    { id: 'library', label: 'คลังสมอง', icon: Brain, path: '/library' },
  ];

  const getActiveColor = (id: string) => {
    if (!isDark) {
      switch (id) {
        case 'home': return 'text-red-800';
        case 'life': return 'text-red-600';
        case 'work': return 'text-blue-600';
        case 'money': return 'text-amber-600';
        case 'library': return 'text-amber-500';
        default: return 'text-red-800';
      }
    } else {
      switch (id) {
        case 'home': return 'text-rose-400';
        case 'life': return 'text-rose-400';
        case 'work': return 'text-blue-400';
        case 'money': return 'text-amber-400';
        case 'library': return 'text-amber-400';
        default: return 'text-rose-400';
      }
    }
  };

  const containerClass = isDark
    ? "bottom-nav fixed bottom-0 left-0 right-0 md:hidden bg-[#0F0F10]/95 backdrop-blur-xl border-t border-white/5 flex justify-around items-center h-[4.5rem] pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.3)] z-[100]"
    : "bottom-nav fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 flex justify-around items-center h-[4.5rem] pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-[100]";

  return (
    <div className={containerClass}>
      {standardItems.map((item) => {
        const isActive = item.id === 'home'
          ? (pathname === '/' || pathname.startsWith('/dashboard'))
          : pathname.startsWith(item.path);
        const activeColor = getActiveColor(item.id);
        const inactiveColor = isDark ? "text-slate-500" : "text-slate-400";
        return (
          <Link key={item.id} href={item.path.startsWith('/tools') ? `${item.path}?from=home` : item.path} className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-95 ${isActive ? activeColor : inactiveColor}`}>
            <item.icon size={22} />
            <span className="text-[10px] mt-1 font-bold">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function BottomNavigation() {
  return (
    <Suspense fallback={null}>
      <BottomNavigationInner />
    </Suspense>
  );
}
