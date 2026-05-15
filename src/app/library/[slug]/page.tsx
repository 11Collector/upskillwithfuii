"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft, Share2, Calendar, Clock, ArrowLeft,
  User, Sparkles, Crown, Target, CheckCircle2, Loader2,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";

// 💡 นำเข้าข้อมูลบทความจากไฟล์ที่เราแยกไว้
import { mockArticles } from "@/constants/article";

import { db, auth, googleProvider } from "@/lib/firebase";
import { doc, getDoc, setDoc, increment, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup, User as FirebaseUser } from "firebase/auth";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 🎨 Theme กลางสำหรับคุมสี Badge และ Glow ตามหมวดหมู่
const CATEGORY_THEMES: Record<string, { color: string; bgColor: string; borderColor: string; glow: string }> = {
  "หนังสือ": { color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20", glow: "bg-emerald-500/5" },
  "พัฒนาตัวเอง": { color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", glow: "bg-amber-500/5" },
  "การเงิน & ลงทุน": { color: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/20", glow: "bg-rose-500/5" },
  "ธุรกิจ": { color: "text-indigo-400", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20", glow: "bg-indigo-500/5" },
  "ทั้งหมด": { color: "text-slate-400", bgColor: "bg-white/5", borderColor: "border-white/10", glow: "bg-white/5" }
};

export default function ArticleDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const articleSlug = Array.isArray(slug) ? decodeURIComponent(slug[0]) : decodeURIComponent(slug || "");

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimedSuccess, setIsClaimedSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ดึงข้อมูลบทความจาก Firestore
  useEffect(() => {
    if (!isMounted) return;
    const fetchArticle = async () => {
      try {
        const { collection, query, where, getDocs, limit } = await import("firebase/firestore");
        const articlesRef = collection(db, "articles");
        const q = query(articlesRef, where("slug", "==", articleSlug), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setArticle(querySnapshot.docs[0].data());
        } else {
          const mockMatch = mockArticles.find((a) => a.slug === articleSlug);
          if (mockMatch) setArticle(mockMatch);
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        const mockMatch = mockArticles.find((a) => a.slug === articleSlug);
        if (mockMatch) setArticle(mockMatch);
      } finally {
        setLoading(false);
      }
    };

    if (articleSlug) fetchArticle();
  }, [articleSlug, isMounted]);

  // ดึง Theme ตามหมวดหมู่ของบทความนั้น ๆ
  const theme = CATEGORY_THEMES[article?.category || ""] || CATEGORY_THEMES["ทั้งหมด"];

  // ตรวจสอบสถานะ Login และประวัติการอ่าน
  useEffect(() => {
    if (!isMounted) return;

    // 1. ตรวจสอบจากสถานะปัจจุบันทันที (เผื่อโหลดเสร็จแล้ว)
    if (auth.currentUser) {
      setUser(auth.currentUser);
      checkReadStatus(auth.currentUser.uid, articleSlug);
    }

    // 2. ติดตามการเปลี่ยนแปลงสถานะ (Standard Way)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkReadStatus(currentUser.uid, articleSlug);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [isMounted, articleSlug]);

  // แยกฟังก์ชันเช็คประวัติการอ่านออกมาให้เรียกใช้ง่ายขึ้น
  const checkReadStatus = async (uid: string, slug: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.readArticles?.includes(slug)) {
          setXpClaimed(true);
        }
      }
    } catch (error) {
      console.error("Error checking read status:", error);
    }
  };

  const handleClaimXP = async () => {
    // Force Sync User State
    let activeUser = user;
    if (!activeUser && auth.currentUser) {
      activeUser = auth.currentUser;
      setUser(auth.currentUser);
    }

    if (xpClaimed || isClaiming) return;

    if (!activeUser) {
      setShowLoginPopup(true);
      return;
    }

    setIsClaiming(true);

    try {
      const userRef = doc(db, "users", activeUser.uid);

      await setDoc(userRef, {
        totalXP: increment(5),
        readArticles: arrayUnion(articleSlug)
      }, { merge: true });

      setIsClaimedSuccess(true);
      setXpClaimed(true);

    } catch (error) {
      console.error("XP Claim Error:", error);
      alert("ไม่สามารถบันทึก XP ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <Loader2 className="animate-spin text-amber-500" size={40} />
    </div>
  );

  if (!article) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#0A0A0A] text-white">
      <h2 className="text-2xl font-black mb-4">ไม่พบเนื้อหานี้ในคลังสมอง 😅</h2>
      <Link href="/library" className="flex items-center gap-2 text-amber-400 font-bold hover:underline">
        <ArrowLeft size={18} /> กลับไปหน้าคลังหนังสือ
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20 font-sans text-slate-200 selection:bg-amber-500/30">

      {/* Login Popup */}
      {showLoginPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-6 sm:pb-0"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLoginPopup(false); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-[#141414] rounded-[2.5rem] border border-white/10 p-8 flex flex-col items-center gap-6"
          >
            <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="text-amber-400" size={26} />
            </div>
            <div className="text-center">
              <h3 className="text-white font-black text-xl mb-2">สะสม XP กันเถอะ</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                เข้าสู่ระบบเพื่อรับ <span className="text-amber-400 font-bold">+5 XP</span> จากบทความนี้<br />และติดตามความก้าวหน้าของตัวเอง
              </p>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-black text-sm rounded-2xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-wider shadow-xl"
            >
              {isSigningIn ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  เข้าสู่ระบบด้วย Google
                </>
              )}
            </button>
            <button
              onClick={() => setShowLoginPopup(false)}
              className="text-slate-600 hover:text-slate-400 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              ไว้ทีหลัง
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* 🎇 Dynamic Glows ตามหมวดหมู่ */}
      <div className={`fixed top-[-10%] right-[-10%] w-[40%] h-[40%] ${theme.glow} blur-[120px] rounded-full pointer-events-none transition-colors duration-1000`} />
      <div className="fixed bottom-[10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* 🧭 Nav */}
      <nav className="sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-xl z-50 border-b border-white/5 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[9px] font-black border border-amber-500/20 uppercase tracking-[0.2em]">
            <Crown size={12} /> Exclusive Insight
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full text-slate-400">
            <Share2 size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-16 relative z-10">

        {/* Header */}
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
          <div className="inline-block mb-8">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.2em] shadow-sm ${theme.bgColor} ${theme.color} ${theme.borderColor}`}>
              {article.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.3] mb-10 tracking-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-8 text-slate-500 text-[11px] font-black uppercase tracking-widest border-y border-white/5 py-6">
            <div className="flex items-center gap-2.5">
              <Calendar size={14} className="text-amber-500/40" /> <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={14} className="text-amber-500/40" /> <span>{article.readTime}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <User size={14} className="text-amber-500/40" /> <span>By Fuii</span>
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="min-h-[400px]">
          <article className="prose prose-invert prose-slate max-w-none 
            prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
            prose-h3:text-2xl prose-h3:text-amber-400 prose-h3:mt-14 prose-h3:mb-6
            prose-p:text-slate-300 prose-p:leading-[2.1] prose-p:text-lg prose-p:font-light prose-p:mb-8
            prose-strong:text-amber-400 prose-strong:font-bold
            prose-blockquote:border-l-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-3xl prose-blockquote:not-italic prose-blockquote:text-slate-200 prose-blockquote:my-10
            prose-li:text-slate-300 prose-li:marker:text-amber-500 prose-li:mb-2
            prose-code:text-amber-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">

            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>

          </article>
        </motion.section>

        {/* XP Section */}
        <div className="mt-20 pt-12 border-t border-white/5">
          {!showSummary ? (
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setShowSummary(true)} className="w-full py-10 rounded-[2.5rem] border border-dashed border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all flex flex-col items-center gap-4 group">
              <div className="p-4 bg-amber-500/20 rounded-full group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Sparkles className="text-amber-400" size={24} />
              </div>
              <div className="text-center">
                <span className="block text-amber-400 font-black text-lg tracking-wide">ตกผลึกความรู้</span>
                <span className="text-amber-500/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2 block">
                  {xpClaimed ? "XP CLAIMED" : "+5 XP Rewards"}
                </span>
              </div>
            </motion.button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-amber-500/10 via-transparent to-transparent p-8 md:p-12 rounded-[3rem] border border-white/10 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                  <Target size={14} /> The Elite Insight
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-[1.5] mb-10 italic pr-6 drop-shadow-sm">
                  "{article.summary}"
                </h3>
                {isClaimedSuccess ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4 py-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                      <CheckCircle2 size={32} className="text-white" />
                    </div>
                    <div className="text-center">
                      <span className="block text-emerald-400 font-black text-xl">ยินดีด้วย! รับ +5 XP สำเร็จ</span>
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 block">Your wisdom is growing</span>
                    </div>
                  </motion.div>
                ) : !xpClaimed ? (
                  <button
                    onClick={handleClaimXP}
                    disabled={isClaiming}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-amber-500 text-black text-sm font-black rounded-3xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-amber-500/20 uppercase tracking-[0.2em]"
                  >
                    {isClaiming ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Claim +5 XP Now
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-black bg-emerald-500/10 w-fit px-8 py-4 rounded-2xl border border-emerald-500/20 uppercase tracking-[0.2em]">
                      <CheckCircle2 size={18} /> <span>คุณอ่านบทความนี้แล้ว</span>
                    </div>
                    <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">XP already claimed</span>
                  </div>
                )}
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full" />
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-28 text-center pt-16 border-t border-white/5">
          <Link href={user ? "/dashboard" : "/"} className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-4 rounded-full font-black text-sm transition-all hover:bg-amber-400 hover:scale-105 shadow-xl uppercase tracking-widest">
            <LayoutGrid size={18} /> {user ? "กลับสู่ DASHBOARD" : "กลับหน้าแรก"}
          </Link>
          <div className="mt-12">
            <Link href="/library" className="text-slate-600 hover:text-slate-400 transition-colors text-[10px] font-black uppercase tracking-[0.3em] inline-flex items-center gap-2">
              <ArrowLeft size={14} /> Back to Library
            </Link>
          </div>
        </motion.footer>

      </main>
    </div>
  );
}