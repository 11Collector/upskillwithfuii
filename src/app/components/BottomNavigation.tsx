"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, PieChart, Users, Wallet, BookOpen, LayoutDashboard } from "lucide-react";
import { Suspense } from "react";

export default function BottomNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'home';

  // Context Detection: Dashboard/Tools vs Landing
  // ✅ ปรับ Logic การแสดงผล Footer
  // - แสดง Dashboard Footer: เมื่ออยู่ในหน้า Dashboard, Library, Soul Guide หรือ Report
  // - แสดง Standard Footer: เมื่ออยู่หน้า Landing หรือ Tools อื่นๆ
  const isDashboardFlow = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/library') || 
    pathname === '/tools/soul-guide' ||
    pathname === '/tools/deep-work' ||
    pathname === '/report-review';

  if (isDashboardFlow) {
    // 🏠 Dashboard/App Context Navigation (Using the exact Emojis and Logic from the original Dashboard)
    const navItems = [
      { id: 'home', label: 'หน้าหลัก', icon: <LayoutDashboard size={24} />, path: '/dashboard' },
      { id: 'overview', label: 'อวาตาร์', icon: "👤", path: '/dashboard?tab=overview' },
      { id: 'quests', label: 'ภารกิจ', icon: "🎯", path: '/dashboard?tab=quests' },
      { id: 'identity', label: 'ตัวตน', icon: "🧬", path: '/dashboard?tab=identity' },
      { id: 'resources', label: 'อัพสกิล', icon: "🧠", path: '/dashboard?tab=resources' },
    ];

    return (
      <div className="bottom-nav fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 flex justify-around items-center h-[5.5rem] pb-safe px-3 z-[10000] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          // Identify active state. In the Chat context (/tools/soul-guide), NO buttons should be active as requested.
          const isChatPage = pathname === '/tools/soul-guide';
          const isActive = !isChatPage && (
                           (item.id === 'home' && (pathname === '/dashboard' || pathname === '/dashboard/') && (!searchParams.get('tab') || searchParams.get('tab') === 'home')) || 
                           (item.id === 'overview' && pathname === '/dashboard' && searchParams.get('tab') === 'overview') ||
                           (item.id === 'quests' && pathname === '/dashboard' && currentTab === 'quests') ||
                           (item.id === 'identity' && currentTab === 'identity') ||
                           (item.id === 'resources' && currentTab === 'resources')
          );
          
          return (
            <Link key={item.id} href={item.path} className={`relative flex flex-col items-center justify-center flex-1 py-2.5 px-2 rounded-2xl transition-all duration-300 active:scale-95 ${isActive ? 'bg-slate-900 text-white shadow-lg -translate-y-1' : 'text-slate-400'}`}>
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

  // 🌐 Standard Navigation for Landing Page
  const standardItems = [
    { id: 'home', label: 'หน้าหลัก', icon: Home, path: '/', color: 'text-red-800' },
    { id: 'life', label: 'ชีวิต', icon: PieChart, path: '/tools/wheel-of-life', color: 'text-red-600' },
    { id: 'work', label: 'ทำงาน', icon: Users, path: '/tools/disc', color: 'text-blue-600' },
    { id: 'money', label: 'การเงิน', icon: Wallet, path: '/tools/money-avatar', color: 'text-amber-600' },
    { id: 'identity', label: 'ตัวตน', icon: BookOpen, path: '/tools/library-of-souls', color: 'text-emerald-600' },
  ];

  return (
    <div className="bottom-nav fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 flex justify-around items-center h-[4.5rem] pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-[100]">
      {standardItems.map((item) => {
        const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
        return (
          <Link key={item.id} href={item.path} className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-95 ${isActive ? item.color : "text-slate-400"}`}>
            <item.icon size={22} />
            <span className="text-[10px] mt-1 font-bold">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
