"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, MessageSquare, X, Zap } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function FloatingFAB() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSoulGuideUnlocked, setIsSoulGuideUnlocked] = useState(false);


  // 1. Listen to Auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Read isSoulGuideUnlocked from localStorage and sync it
  useEffect(() => {
    if (typeof window !== "undefined") {
      const unlocked = localStorage.getItem("isSoulGuideUnlocked") === "true";
      setIsSoulGuideUnlocked(unlocked);

      const handleStorageChange = () => {
        const currentUnlocked = localStorage.getItem("isSoulGuideUnlocked") === "true";
        setIsSoulGuideUnlocked(currentUnlocked);
      };
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("soulGuideUnlockStatusChange", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("soulGuideUnlockStatusChange", handleStorageChange);
      };
    }
  }, []);



  // Excluded paths (Focus Room, Deep Work, Soul Guide, Admin, etc.)
  const excludedPaths = [
    "/",
    "/tools/soul-guide",
    "/tools/ai-mentor",
    "/tools/focus-room",
    "/tools/deep-work",
    "/tools/disc",
    "/tools/money-avatar",
    "/tools/wheel-of-life",
    "/tools/library-of-souls",
    "/tools/khomsatsat",
    "/admin",
    "/privacy",
    "/report-review"
  ];

  if (!user) return null;
  if (pathname === "/" || pathname.startsWith("/tools") || pathname.startsWith("/personalityzero") || pathname.startsWith("/admin") || pathname === "/privacy" || pathname === "/report-review") return null;

  // 4. Custom behavior for Second Brain page
  if (pathname === "/second-brain") {
    // If chat is locked, hide the FAB entirely (since "Create Note" is already on the page)
    if (!isSoulGuideUnlocked) return null;

    // If chat is unlocked, show ONLY a single direct chat button to consult with P'Fuii
    const handleFABClick = (e: React.MouseEvent) => {
      e.preventDefault();
      router.push("/tools/soul-guide");
    };

    return (
      <div className="fixed bottom-[7.5rem] md:bottom-12 right-6 z-[150] select-none">
        <button onClick={handleFABClick}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-300 hover:border-indigo-500 transition-all duration-300 relative group"
          >
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl group-hover:opacity-30 transition-opacity rounded-full" />
            <MessageSquare size={26} className="text-indigo-600" />
            
            {/* Tooltip on Hover */}
            <div className="absolute right-full mr-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
              <div className="bg-white/95 backdrop-blur-xl text-slate-900 text-[11px] font-bold tracking-wider px-5 py-3 rounded-[1.8rem] border-2 border-slate-100 shadow-2xl whitespace-nowrap">
                คุยกับพี่ฟุ้ย 💬
              </div>
            </div>
          </motion.div>
        </button>
      </div>
    );
  }



  const containerClass = "fixed bottom-[7.5rem] md:bottom-12 right-6 z-[150] flex flex-col items-end gap-3 select-none";

  return (
    <>
      {isFabOpen && (
        <div 
          className="fixed inset-0 z-[140] bg-transparent" 
          onClick={() => setIsFabOpen(false)}
        />
      )}

      {isSoulGuideUnlocked ? (
        <div className={containerClass}>
          <AnimatePresence>
            {isFabOpen && (
              <>
                {/* 1. Quick note button */}
                <Link href="/second-brain?newNote=true" onClick={() => setIsFabOpen(false)}>
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="flex items-center gap-3 group"
                  >
                    <span className="bg-white text-slate-800 text-[11px] font-black tracking-wider px-4 py-2 rounded-2xl border border-slate-200 shadow-md">
                      จดบันทึก 🧠
                    </span>
                    <div className="w-12 h-12 bg-white border border-slate-300 hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] rounded-full flex items-center justify-center shadow-lg transition-colors">
                      <Pencil size={20} className="text-indigo-600" />
                    </div>
                  </motion.div>
                </Link>

                {/* 2. Chat with P'Fuii button (dynamic link) */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsFabOpen(false);
                    let activeTitle = "";
                    if (typeof document !== "undefined" && pathname.startsWith("/library/") && pathname !== "/library") {
                      activeTitle = document.querySelector("h1")?.innerText || "";
                    }
                    const destination = activeTitle
                      ? `/tools/soul-guide?articleTitle=${encodeURIComponent(activeTitle)}`
                      : "/tools/soul-guide";
                    router.push(destination);
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.05 }}
                    className="flex items-center gap-3 group text-left"
                  >
                    <span className="bg-white text-slate-800 text-[11px] font-black tracking-wider px-4 py-2 rounded-2xl border border-slate-200 shadow-md">
                      คุยกับพี่ฟุ้ย 💬
                    </span>
                    <div className="w-12 h-12 bg-white border border-slate-300 hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] rounded-full flex items-center justify-center shadow-lg transition-colors">
                      <MessageSquare size={20} className="text-indigo-600" />
                    </div>
                  </motion.div>
                </button>
              </>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-300 focus:outline-none transition-all duration-300 hover:border-indigo-500 hover:scale-105 active:scale-95 relative group"
          >
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl group-hover:opacity-30 transition-opacity rounded-full" />
            
            <AnimatePresence mode="wait">
              {isFabOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={26} className="text-slate-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="relative flex items-center justify-center"
                >
                  <MessageSquare size={26} className="text-indigo-600" />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 shadow-sm">
                    <Zap size={10} className="text-indigo-500 fill-indigo-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      ) : (
        <div className={containerClass}>
          <Link href="/second-brain?newNote=true">
            <motion.div
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-indigo-500/10 blur-2xl group-hover:opacity-30 transition-opacity rounded-full" />
              <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-300 overflow-hidden hover:border-indigo-500 transition-all duration-500">
                <Pencil size={26} className="text-indigo-600" />
              </div>
              <div className="absolute right-full mr-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <div className="bg-white/95 backdrop-blur-xl text-slate-900 text-[11px] font-bold tracking-wider px-5 py-3 rounded-[1.8rem] border-2 border-slate-100 shadow-2xl whitespace-nowrap">
                  จดบันทึก 🧠
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      )}
    </>
  );
}
