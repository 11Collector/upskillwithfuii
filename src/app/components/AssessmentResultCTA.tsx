'use client';

import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { LayoutDashboard, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  currentUser: any;
  /** แสดง +50 XP modal ก่อน login — false สำหรับ Khomsatsat ที่ไม่ให้ XP */
  showXpModal?: boolean;
}

const GoogleSVG = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className="shrink-0">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.486,35.33,44,30.075,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

export default function AssessmentResultCTA({ currentUser, showXpModal = true }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const doSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setShowModal(false);
      // onAuthStateChanged ใน parent จะ update currentUser เอง — ไม่ redirect
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user') console.error(e);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLoginClick = () => {
    if (showXpModal) {
      setShowModal(true);
    } else {
      doSignIn();
    }
  };

  return (
    <>
      {/* XP Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center gap-5"
            >
              <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                <Sparkles className="text-violet-500" size={26} />
              </div>

              <div className="text-center">
                <p className="text-[11px] font-black text-violet-400 uppercase tracking-[0.25em] mb-2">บันทึกผลลัพธ์</p>
                <h3 className="text-slate-900 font-black text-xl mb-3 leading-tight">
                  รับ <span className="text-violet-600">+50 XP</span> ทันที
                </h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">
                  เข้าสู่ระบบเพื่อบันทึกผลการประเมินและติดตาม<br />ความก้าวหน้าของตัวเองใน Dashboard
                </p>
              </div>

              <button
                onClick={doSignIn}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white font-black text-[14px] rounded-2xl hover:bg-black active:scale-95 transition-all disabled:opacity-50 shadow-lg"
              >
                {isSigningIn ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <GoogleSVG />
                    เข้าสู่ระบบด้วย Google
                  </>
                )}
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-[11px] font-bold uppercase tracking-widest transition-colors"
              >
                ไว้ทีหลัง
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Buttons */}
      <div className="flex flex-col items-center gap-3 w-full mt-2">

        {/* Primary: Login หรือ Dashboard */}
        {currentUser ? (
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-[15px] hover:bg-black active:scale-95 transition-all shadow-lg"
          >
            <LayoutDashboard size={18} />
            ไปที่ Dashboard
          </Link>
        ) : (
          <button
            onClick={handleLoginClick}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-[15px] hover:bg-black active:scale-95 transition-all shadow-lg"
          >
            <GoogleSVG />
            บันทึกผลลัพธ์ด้วย Google
            {showXpModal && (
              <span className="ml-auto bg-violet-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                +50 XP
              </span>
            )}
          </button>
        )}

        {/* Secondary: Line OA */}
        <a
          href="https://lin.ee/rQawKUM"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-[#00B900] text-white rounded-2xl font-bold text-[14px] hover:bg-[#00a000] active:scale-95 transition-all shadow-md"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.03 2 11c0 3.13 1.68 5.9 4.28 7.65L5.5 22l3.58-1.87C10.17 20.67 11.07 21 12 21c5.52 0 10-4.03 10-9S17.52 2 12 2z"/>
          </svg>
          ติดตามเคล็ดลับจากฟุ้ย
        </a>

        {/* Tertiary: กลับหน้าแรก */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-400 text-[12px] font-bold hover:text-slate-600 transition-colors mt-1"
        >
          <ArrowLeft size={13} /> กลับหน้าแรก
        </Link>

      </div>
    </>
  );
}
