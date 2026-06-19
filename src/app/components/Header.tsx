'use client';

import Link from "next/link";
import { PieChart, Users, Wallet, Brain } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { onAuthStateChanged, signInWithPopup, User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const dashboardTabs = [
  { id: 'home',     label: 'หน้าหลัก',           path: '/dashboard?tab=home' },
  { id: 'overview', label: 'อวาตาร์ & รายสัปดาห์', path: '/dashboard?tab=overview' },
  { id: 'quests',   label: 'ภารกิจประจำวัน',       path: '/dashboard?tab=quests' },
  { id: 'identity', label: 'สำรวจตัวตน',           path: '/dashboard?tab=identity' },
  { id: 'resources',label: 'คลังเพิ่มเติม',         path: '/dashboard?tab=resources' },
];

const GoogleSVG = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className="shrink-0">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.486,35.33,44,30.075,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

function HeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsInAppBrowser(/FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|BytedanceWebview|musical_ly|Twitter/i.test(ua));
  }, []);

  const handleLogin = () => {
    if (isInAppBrowser) return;
    signInWithPopup(auth, googleProvider).catch((e) => {
      if (e?.code !== 'auth/popup-closed-by-user') console.error(e);
    });
  };

  const isAssessmentPage = pathname.startsWith("/tools/");
  const isDashboard = pathname.startsWith("/dashboard");
  const isAppPage = isDashboard || pathname.startsWith("/library") || pathname.startsWith("/gallery") || pathname === "/report-review";

  // tool pages: ซ่อนทุก size
  if (isAssessmentPage) return null;

  // mobile thin header — แสดงบน homepage และ non-dashboard pages
  // ซ่อนบน dashboard (bottom nav จัดการ) และ desktop (desktop nav จัดการ)
  // library มี dark theme เอง + bottom nav จัดการ nav ครบแล้ว
  const showMobileHeader = isMobile && !isDashboard && !pathname.startsWith('/library') && !pathname.startsWith('/gallery');

  return (
    <>
      {/* ── Mobile Thin Header ── */}
      {showMobileHeader && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-[52px] bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4">
          <Link href="/" className="shrink-0">
            <img src="/logo-upskill.png" alt="Upskill Everyday" className="h-9 object-contain" fetchPriority="high" decoding="async" />
          </Link>

          {!user ? (
            /* ยังไม่ login: ปุ่ม Login */
            isInAppBrowser ? (
              <span className="text-[10px] font-black text-amber-500 px-2">⚠️ เปิดใน Chrome/Safari</span>
            ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-1.5 bg-slate-900 text-white text-[11px] font-black px-3 py-2 rounded-xl hover:bg-red-700 active:scale-95 transition-all"
            >
              <GoogleSVG size={12} />
              เข้าสู่ระบบ
            </button>
            )
          ) : isAppPage ? (
            /* login แล้ว อยู่ app pages (library ฯลฯ): ปุ่มกลับ Dashboard */
            <Link href="/dashboard" className="text-[11px] font-black text-slate-500 hover:text-slate-900 transition-colors px-2 py-2">
              ← Dashboard
            </Link>
          ) : null /* login แล้ว อยู่หน้าแรก: card หลักมีปุ่ม Dashboard อยู่แล้ว */}
        </div>
      )}

      {/* ── Desktop Nav — render เฉพาะ desktop (isMobile ควบคุมแทน CSS) ── */}
      {!isMobile && (
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-[100] h-[72px] flex">
          <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between gap-8 w-full">

            <Link href="/" className="shrink-0 hover:opacity-80 transition-opacity">
              <img src="/logo-upskill.png" alt="Upskill Everyday" className="h-14 md:h-16 object-contain" fetchPriority="high" decoding="async" />
            </Link>

            <div className="flex items-center gap-1">
              {user && isAppPage ? (
                dashboardTabs.map(({ id, label, path }) => {
                  const tabParam = searchParams.get('tab');
                  const isActive =
                  (isDashboard && (tabParam === id || (!tabParam && id === 'home'))) ||
                  (pathname.startsWith('/library') && id === 'resources');
                  return (
                    <Link key={id} href={path} className={`px-4 py-2 rounded-full text-sm font-black transition-all whitespace-nowrap ${isActive ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                      {label}
                    </Link>
                  );
                })
              ) : (
                <>
                  {[
                    { href: "/tools/wheel-of-life", label: "สมดุลชีวิต", icon: <PieChart size={17} />, activeColor: "text-red-600 bg-red-50" },
                    { href: "/tools/disc", label: "DISC", icon: <Users size={17} />, activeColor: "text-blue-600 bg-blue-50" },
                    { href: "/tools/money-avatar", label: "สไตล์การเงิน", icon: <Wallet size={17} />, activeColor: "text-amber-600 bg-amber-50" },
                    { href: "/library", label: "คลังสมอง", icon: <Brain size={17} />, activeColor: "text-amber-500 bg-amber-50" },
                  ].map(({ href, label, icon, activeColor }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                      <Link key={href} href={href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${isActive ? activeColor : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                        {icon} {label}
                      </Link>
                    );
                  })}
                  {!user && (
                    isInAppBrowser ? (
                      <span className="ml-3 text-[11px] font-black text-amber-500">⚠️ เปิดใน Chrome/Safari เพื่อ Login</span>
                    ) : (
                    <button onClick={handleLogin} className="ml-3 flex items-center gap-2 bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-red-700 active:scale-95 transition-all whitespace-nowrap">
                      <GoogleSVG /> เข้าสู่ระบบ
                    </button>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}

export default function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderInner />
    </Suspense>
  );
}
