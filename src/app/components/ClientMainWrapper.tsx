'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function ClientMainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTools = pathname.startsWith('/tools/');
  const isDashboard = pathname.startsWith('/dashboard');
  const noMobileHeader = isDashboard || pathname.startsWith('/library') || pathname.startsWith('/gallery') || pathname.startsWith('/shop');

  // 🛡️ Global Auth Sync: Ensures user profile (email, name) is always registered in Firestore
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          const data = userSnap.data();

          // Sync if document doesn't exist, or is missing email/displayName
          if (!userSnap.exists() || !data?.email || !data?.displayName) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || "ไม่ระบุชื่อ",
              photoURL: user.photoURL || "",
              subscription_tier: data?.subscription_tier || "free",
              createdAt: data?.createdAt || serverTimestamp(),
              lastLoginAt: serverTimestamp()
            }, { merge: true });
            console.log(`[AuthSync] Synced Firestore profile for UID: ${user.uid}`);
          }
        } catch (err) {
          console.error("[AuthSync] Error syncing profile to Firestore:", err);
        }
      }
    });

    return () => unsub();
  }, []);

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
