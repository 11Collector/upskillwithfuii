'use client';
import { usePathname } from 'next/navigation';

export default function ClientMainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTools = pathname.startsWith('/tools/');
  const isDashboard = pathname.startsWith('/dashboard');
  const noMobileHeader = isDashboard || pathname.startsWith('/library') || pathname.startsWith('/gallery') || pathname.startsWith('/shop');

  // tools: ไม่มี header เลย
  // dashboard/library/gallery: ไม่มี mobile header
  // homepage + อื่นๆ: mobile มี thin header 52px
  const ptClass = isTools
    ? 'pt-0'
    : noMobileHeader
      ? 'pt-0 md:pt-[72px]'
      : 'pt-[52px] md:pt-[72px]';

  return (
    <main
      id="main-scroll-container"
      suppressHydrationWarning
      className={`w-full relative min-h-screen flex flex-col ${isDashboard ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))]' : 'pb-[calc(4.5rem+env(safe-area-inset-bottom))]'} md:pb-0 ${ptClass}`}
    >
      {children}
    </main>
  );
}
