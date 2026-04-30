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

import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, increment, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

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
  const articleSlug = Array.isArray(slug) ? slug[0] : slug;

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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

  useEffect(() => {
    if (!isMounted) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.readArticles?.includes(articleSlug)) {
              setXpClaimed(true);
            }
          }
        } catch (error) { console.error("Error fetching user data:", error); }
      }
    });
    return () => unsubscribe();
  }, [articleSlug]);

  const handleClaimXP = async () => {
    if (!user || xpClaimed || isClaiming) return;
    setIsClaiming(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        totalXP: increment(5),
        readArticles: arrayUnion(articleSlug)
      }, { merge: true });
      setXpClaimed(true);
    } catch (error) { alert("เกิดข้อผิดพลาดในการรับ XP"); } 
    finally { setIsClaiming(false); }
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
                {!xpClaimed ? (
                  <button onClick={handleClaimXP} disabled={isClaiming || !user} className="flex items-center gap-3 px-8 py-3.5 bg-amber-500 text-black text-xs font-black rounded-2xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-500/20 uppercase tracking-widest">
                    {isClaiming ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={16} /> Claim +5 XP</>}
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-black bg-emerald-500/10 w-fit px-6 py-3 rounded-2xl border border-emerald-500/20 uppercase tracking-widest">
                    <CheckCircle2 size={18} /> <span>อ่านแล้ว (XP CLAIMED)</span>
                  </div>
                )}
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full" />
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-28 text-center pt-16 border-t border-white/5">
            <Link href="/dashboard" className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-4 rounded-full font-black text-sm transition-all hover:bg-amber-400 hover:scale-105 shadow-xl uppercase tracking-widest">
                <LayoutGrid size={18} /> กลับสู่ DASHBOARD
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