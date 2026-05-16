'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ClientMainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTools = pathname.startsWith('/tools/');
  const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/library') || pathname.startsWith('/gallery') || pathname === '/report-review';
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  // header โชว์บน mobile เฉพาะหน้าแรกที่ยังไม่ login
  const hasHeaderOnMobile = pathname === '/' && user === null;

  return (
    <main
      id="main-scroll-container"
      suppressHydrationWarning
      className={`w-full relative min-h-screen flex flex-col pb-[4.5rem] md:pb-0 ${
        isTools || isAppPage
          ? 'pt-0'             // tools + app pages: ไม่มี header บน mobile
          : hasHeaderOnMobile
            ? 'pt-16'          // homepage ไม่ login: header โชว์ทุก size
            : 'pt-0 md:pt-16' // หน้าอื่น: header โชว์แค่ desktop
      }`}
    >
      {children}
    </main>
  );
}
