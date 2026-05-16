'use client';

import Link from "next/link";
import { PieChart, Users, Wallet, Brain } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogin = () => signInWithPopup(auth, googleProvider).catch((e) => {
    if (e?.code !== 'auth/popup-closed-by-user') console.error(e);
  });

  const isAssessmentPage = pathname.startsWith("/tools/");
  // แสดงบน mobile เฉพาะหน้าแรกที่ยังไม่ login (user===null = ยืนยันแล้วว่าไม่ login)
  const showOnMobile = pathname === "/" && user === null;

  return (
    <nav className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-[100] h-[72px] ${isAssessmentPage ? "hidden" : showOnMobile ? "flex" : "hidden md:flex"}`}>
      <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-center md:justify-between gap-8 w-full">

        <Link href="/" className="shrink-0 hover:opacity-80 transition-opacity">
          <img src="/logo-upskill.png" alt="Upskill Everyday" className="h-14 md:h-16 object-contain" fetchPriority="high" decoding="async" />
        </Link>

        {/* เมนู Desktop */}
        <div className="hidden md:flex items-center gap-1">
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
            <button
              onClick={handleLogin}
              className="ml-3 flex items-center gap-2 bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-red-700 active:scale-95 transition-all whitespace-nowrap"
            >
              <svg width="13" height="13" viewBox="0 0 48 48" className="shrink-0">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.486,35.33,44,30.075,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
