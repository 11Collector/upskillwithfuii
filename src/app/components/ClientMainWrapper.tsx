'use client';
import { usePathname } from 'next/navigation';

export default function ClientMainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTools = pathname.startsWith('/tools/');
  const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/library') || pathname.startsWith('/gallery') || pathname === '/report-review';

  // pt-0: tools/app pages บน mobile ไม่มี header
  // md:pt-[72px]: desktop มี header 72px (ยกเว้น tools)
  const ptClass = isTools ? 'pt-0' : isAppPage ? 'pt-0 md:pt-[72px]' : 'pt-0 md:pt-[72px]';

  return (
    <main
      id="main-scroll-container"
      suppressHydrationWarning
      className={`w-full relative min-h-screen flex flex-col pb-[4.5rem] md:pb-0 ${ptClass}`}
    >
      {children}
    </main>
  );
}
