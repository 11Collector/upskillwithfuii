'use client';
import { usePathname } from 'next/navigation';

export default function ClientMainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTools = pathname.startsWith('/tools/');
  return (
    <main
      id="main-scroll-container"
      className={`w-full relative min-h-screen flex flex-col pb-[4.5rem] md:pb-0 ${isTools ? 'pt-0' : 'pt-0 md:pt-16'}`}
    >
      {children}
    </main>
  );
}
