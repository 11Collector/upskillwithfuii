"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc, increment, limit, startAfter, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Quote, Loader2, Heart, Share2, CheckCircle, Download } from "lucide-react";
import Link from "next/link";
import { Kanit } from "next/font/google";
import { toPng } from "html-to-image";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

const moodCategories = [
  { id: "all", icon: "🌈", title: "ทั้งหมด" },
  { id: "happy", icon: "😊", title: "มีความสุข" },
  { id: "sad", icon: "😢", title: "เศร้าหมอง" },
  { id: "angry", icon: "😡", title: "โกรธมาก" },
  { id: "fear", icon: "😨", title: "หวาดกลัว" },
  { id: "love", icon: "❤️", title: "คลั่งรัก" },
  { id: "lonely", icon: "🍂", title: "โดดเดี่ยว" },
  { id: "hope", icon: "✨", title: "เปี่ยมหวัง" },
  { id: "confused", icon: "🌀", title: "สับสน" },
  { id: "apathetic", icon: "😐", title: "เฉยเมย" },
  { id: "exhausted", icon: "🫠", title: "เหนื่อยล้า" }
];

// ฟังก์ชันดึงสีตามอารมณ์ (สำหรับเอฟเฟกต์เรืองแสง)
const getMoodColor = (moodTitle: string) => {
  const map: Record<string, string> = {
    "มีความสุข": "#facc15", "เศร้าหมอง": "#60a5fa", "โกรธมาก": "#ef4444",
    "หวาดกลัว": "#a855f7", "คลั่งรัก": "#ec4899", "โดดเดี่ยว": "#78716c",
    "เปี่ยมหวัง": "#34d399", "สับสน": "#818cf8", "เฉยเมย": "#94a3b8", "เหนื่อยล้า": "#fb923c"
  };
  return map[moodTitle] || "#3b82f6";
};

interface QuoteData {
  id: string;
  mood: string;
  words: string[];
  quote: string;
  createdAt: any;
  likes?: number;
}

const FETCH_LIMIT = 15;

export default function GalleryPage() {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedQuotes, setLikedQuotes] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("ทั้งหมด");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchInitialQuotes = async () => {
    setLoading(true);
    try {
      let q;
      if (activeFilter === "ทั้งหมด") {
        q = query(collection(db, "quotes"), orderBy("createdAt", "desc"), limit(FETCH_LIMIT));
      } else {
        q = query(collection(db, "quotes"), where("mood", "==", activeFilter), orderBy("createdAt", "desc"), limit(FETCH_LIMIT));
      }

      const querySnapshot = await getDocs(q);
      const data: QuoteData[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data(), likes: document.data().likes || 0 } as QuoteData);
      });

      setQuotes(data);

      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === FETCH_LIMIT);
      } else {
        setLastDoc(null);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching initial quotes: ", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreQuotes = async () => {
    if (!lastDoc || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      let q;
      if (activeFilter === "ทั้งหมด") {
        q = query(collection(db, "quotes"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(FETCH_LIMIT));
      } else {
        q = query(collection(db, "quotes"), where("mood", "==", activeFilter), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(FETCH_LIMIT));
      }

      const querySnapshot = await getDocs(q);
      const data: QuoteData[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data(), likes: document.data().likes || 0 } as QuoteData);
      });

      setQuotes(prev => [...prev, ...data]);

      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === FETCH_LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more quotes: ", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // 💡 1. โหลดข้อมูลการไลค์จากเครื่องผู้ใช้ (ทำแค่ครั้งเดียวตอนเข้าหน้าเว็บ)
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem("khomsatsat_likes");
      if (savedLikes) {
        setLikedQuotes(JSON.parse(savedLikes));
      }
    } catch (error) {
      console.error("Failed to parse likes from local storage", error);
    }
  }, []); // <-- ปีกกาว่าง [] สำคัญมาก แปลว่าทำแค่ตอนเปิดหน้าเว็บครั้งแรก

  // 💡 2. ดึงข้อมูลคำคมจาก Firebase (ทำทุกครั้งที่เปลี่ยนหมวดหมู่)
  useEffect(() => {
    fetchInitialQuotes();
  }, [activeFilter]);

  // 💡 3. ปรับระบบกดไลค์
  const handleLike = async (quoteId: string) => {
    // 1) เช็คว่าเคยไลค์รูปนี้ไปหรือยังจาก State ปัจจุบัน
    const isLiked = likedQuotes.includes(quoteId);

    // 2) เตรียม Array ใหม่: ถ้าเคยไลค์ให้เอาออก (Unlike) ถ้ายังให้เพิ่มเข้าไป (Like)
    const newLikedQuotes = isLiked
      ? likedQuotes.filter((id) => id !== quoteId)
      : [...likedQuotes, quoteId];

    // 3) บันทึกลง State และ LocalStorage ให้เครื่องจำไว้ทันที
    setLikedQuotes(newLikedQuotes);
    localStorage.setItem("khomsatsat_likes", JSON.stringify(newLikedQuotes));

    // 4) อัปเดตตัวเลขไลค์บนหน้าจอทันที (ไม่ต้องรอโหลด Firebase)
    setQuotes((prevQuotes) =>
      prevQuotes.map((q) => {
        if (q.id === quoteId) {
          return {
            ...q,
            likes: Math.max(0, (q.likes || 0) + (isLiked ? -1 : 1)),
          };
        }
        return q;
      })
    );

    // 5) ส่งข้อมูลไปอัปเดตยอดไลค์รวมที่ Firebase (ทำงานเบื้องหลัง)
    try {
      const quoteRef = doc(db, "quotes", quoteId);
      await updateDoc(quoteRef, {
        likes: isLiked ? increment(-1) : increment(1)
      });
    } catch (error) {
      console.error("Error updating like in Firebase:", error);
    }
  };

  const handleShare = async (item: QuoteData) => {
    const textToShare = `"${item.quote.replace(/\\n/g, '\n')}"\n\nอารมณ์: ${item.mood}\n#${item.words.join(" #")}\n\nสร้างคำคมของคุณได้ที่: ${window.location.origin}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'คมสัดสัด x Upskill with Fuii', text: textToShare }); } catch (error) { }
    } else {
      navigator.clipboard.writeText(textToShare);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // 💡 ระบบ Download แบบปรับจูนให้เข้ากับ Dark Mode (เซฟแล้วสีทึบเป๊ะ)
  const handleDownloadImage = async (quoteId: string) => {
    const element = document.getElementById(`quote-card-${quoteId}`);
    if (!element) return;

    try {
      setDownloadingId(quoteId);

      const computedStyle = window.getComputedStyle(element);
      const actualBgColor = computedStyle.backgroundColor;

      const originalStyles = {
        height: element.style.height,
        minHeight: element.style.minHeight,
        transition: element.style.transition,
        transform: element.style.transform,
      };

      element.style.height = 'auto';
      element.style.minHeight = '0';
      element.style.transition = 'none';
      element.style.transform = 'none';
      element.classList.remove('hover:scale-[1.02]');

      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 3,
        // 💡 บังคับให้พื้นหลังเป็นสี slate-900 (สีทึบ) เสมอเวลาแบคกราวด์อ่านค่าเป็นใส
        backgroundColor: actualBgColor === 'rgba(0, 0, 0, 0)' ? '#0f172a' : actualBgColor,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          margin: '0',
          borderRadius: '2.5rem',
        },
        filter: (node) => {
          if (node instanceof HTMLElement && node.getAttribute('data-html2canvas-ignore') === 'true') {
            return false;
          }
          return true;
        },
      });

      element.style.height = originalStyles.height;
      element.style.minHeight = originalStyles.minHeight;
      element.style.transition = originalStyles.transition;
      element.style.transform = originalStyles.transform;
      element.classList.add('hover:scale-[1.02]');

      const link = document.createElement('a');
      link.download = `khomsatsat-${quoteId}.png`;
      link.href = dataUrl;
      link.click();

    } catch (error) {
      console.error("Error saving image:", error);
      element.classList.add('hover:scale-[1.02]');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    // 💡 1. ปรับ Theme หลักเป็น Dark Slate (bg-slate-950)
    <div className={`min-h-[100dvh] bg-slate-950 text-slate-100 ${kanit.className} overflow-x-hidden relative flex flex-col`}>

      {/* 💡 2. ลายจุด Polkadot โทนดาร์ก */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none"></div>

      {/* 💡 3. Header กระจกดำใส (Dark Glassmorphism) */}
      <header className="pt-12 pb-4 flex flex-col items-center relative z-20 bg-slate-900/60 backdrop-blur-xl sticky top-0 border-b border-slate-800 shadow-sm">
        <div className="px-6 w-full flex items-center justify-center relative mb-4">

          {/* 💡 แก้ไข: เพิ่ม top-0 และขยับลงมานิดนึงด้วย mt-1 เพื่อให้ขอบปุ่มพอดีกับคำว่า "แกลเลอรี" */}
          <Link href="/" className="absolute left-6 top-0 mt-1 p-2.5 bg-slate-800 rounded-full hover:bg-slate-700 shadow-sm transition-colors border border-slate-700">
            <ChevronLeft size={20} className="text-slate-300" />
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-sm">แกลเลอรี<span className="text-blue-500">ทัชใจ</span></h1>
            <p className="text-[12px] text-slate-400 mt-0.5 font-bold tracking-wide">รวมคำคม ความรู้สึกที่ถูกกลั่นกรอง</p>
          </div>
        </div>

        {/* 💡 4. ปุ่ม Filter โทนดาร์ก */}
        <div className="w-full overflow-x-auto pb-4 pt-2 hide-scrollbar">
          <div className="flex px-6 gap-2.5 w-max mx-auto">
            {moodCategories.map((cat) => {
              const isActive = activeFilter === cat.title;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.title)}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-bold transition-all active:scale-95 shadow-sm border-[2px] ${isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_15px_-3px_rgba(37,99,235,0.4)]'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                    }`}
                >
                  <span className="text-[14px]">{cat.icon}</span>
                  {cat.title}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full flex flex-col items-center relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 w-full">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-6 shadow-sm"></div>
            <p className="text-sm font-black tracking-widest uppercase text-slate-500">Loading...</p>
          </div>
        ) : quotes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center w-full">
            <span className="text-6xl mb-6 drop-shadow-sm opacity-80">🍃</span>
            <p className="text-slate-400 font-bold text-lg mb-2">ยังไม่มีคำคมในหมวดหมู่นี้</p>
            <Link href="/" className="mt-2 px-6 py-2.5 bg-blue-600 text-white text-[13px] rounded-full font-bold shadow-lg shadow-blue-900/50 hover:bg-blue-500 transition-colors">
              ไปสร้างคำคมแรกกันเลย!
            </Link>
          </motion.div>
        ) : (
          <div className="w-full flex flex-col items-center">

            {/* 💡 5. Grid การ์ด (Dark Glass Card) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              <AnimatePresence mode="popLayout">
                {quotes.map((item, index) => {
                  const hasLiked = likedQuotes.includes(item.id);
                  const isCopied = copiedId === item.id;
                  const moodColor = getMoodColor(item.mood);

                  return (
                    <motion.div
                      layout
                      id={`quote-card-${item.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      transition={{ delay: (index % FETCH_LIMIT) * 0.05 }}
                      key={item.id}
                      // 💡 ใช้ bg-slate-900 และกำหนดสีกำกับไว้เพื่อให้ toPng เซฟได้ทึบแสง
                      className="bg-slate-900 border-[2px] border-slate-700/50 rounded-[2.5rem] p-8 sm:p-10 relative flex flex-col shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] hover:scale-[1.02] transition-all duration-300 group overflow-hidden"
                      style={{ backgroundColor: '#0f172a' }} // slate-900
                    >
                      {/* แสง Glow หลังการ์ดจางๆ ตามสีอารมณ์ */}
                      <div
                        className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-500 group-hover:opacity-25 blur-[60px]"
                        style={{ background: `radial-gradient(circle at top left, ${moodColor} 0%, transparent 60%)` }}
                      ></div>

                      {/* ไอคอน Quote โทนดาร์ก */}
                      <div className="absolute top-6 left-6 bg-slate-800 p-3 rounded-full shadow-sm border-[2px] border-slate-700/50 rotate-[-10deg] z-10">
                        <Quote size={20} className="text-blue-400" />
                      </div>

                      {/* 💡 ป้ายกำกับอารมณ์ (บนขวา) */}
                      <div className="flex justify-end mb-6 relative z-10" data-html2canvas-ignore="true">
                        <span className="text-[11px] font-black tracking-wide bg-slate-800 px-4 py-1.5 rounded-full text-slate-300 shadow-sm border border-slate-700 flex items-center gap-1.5">
                          {moodCategories.find(m => m.title === item.mood)?.icon} {item.mood || "ไม่ระบุ"}
                        </span>
                      </div>

                      {/* 💡 ตัวคำคม (ปรับให้ใหญ่ขึ้นตาม Ver เดิม) */}
                      <p className={`font-black leading-relaxed text-white whitespace-pre-line my-4 grow relative z-10 text-center tracking-wide break-words px-2 drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)] ${item.quote.length > 80 ? "text-[18px] sm:text-[20px]" : "text-[22px] sm:text-[26px]"
                        }`}>
                        {item.quote.replace(/\\n/g, '\n')}
                      </p>

                      <div className="flex flex-col gap-6 mt-6 relative z-10">
                        {/* 💡 แท็กคำศัพท์ โทนดาร์กทึบ */}
                        <div className="flex flex-wrap justify-center gap-2">
                          {item.words?.map((word, wIdx) => (
                            <span
                              key={wIdx}
                              className="text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-sm whitespace-nowrap bg-slate-800"
                              style={{ color: moodColor, borderColor: `${moodColor}50`, backgroundColor: 'rgba(30,41,59,0.9)' }}
                            >
                              #{word}
                            </span>
                          ))}
                        </div>

                        {/* 💡 ลายน้ำแบรนด์ (Dark theme ทึบ) */}
                        <div className="flex flex-col items-center gap-1 mt-2 pb-2">
                          <div
                            className="text-[8px] font-black tracking-[0.3em] text-slate-300 uppercase px-3 py-1 rounded-full border border-slate-700/80 whitespace-nowrap"
                            style={{ backgroundColor: '#1e293b' }} // slate-800 ทึบ
                          >
                            CREATED BY <span className="text-blue-500 mx-1">×</span> อัพสกิลกับฟุ้ย
                          </div>
                        </div>

                        {/* 💡 ปุ่ม Action (ปุ่มกดด้านล่างแบบดาร์ก) */}
                        <div className="flex items-center justify-between pt-5 border-t border-slate-800/80" data-html2canvas-ignore="true">
                          <button
                            onClick={() => handleLike(item.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all active:scale-90 font-bold text-[13px] shadow-sm border ${hasLiked ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30'}`}
                          >
                            <Heart size={16} className={hasLiked ? "fill-current" : ""} />
                            <span>{item.likes || 0}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownloadImage(item.id)}
                              disabled={downloadingId === item.id}
                              className="p-2.5 rounded-full transition-all bg-slate-800 border border-slate-700 text-slate-400 shadow-sm hover:text-white hover:bg-slate-700 active:scale-90 disabled:opacity-50"
                            >
                              {downloadingId === item.id ? <Loader2 size={16} className="animate-spin text-blue-400" /> : <Download size={16} />}
                            </button>
                            <button
                              onClick={() => handleShare(item)}
                              className={`p-2.5 rounded-full transition-all shadow-sm active:scale-90 border ${isCopied ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/30'}`}
                            >
                              {isCopied ? <CheckCircle size={16} /> : <Share2 size={16} />}
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {hasMore && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={loadMoreQuotes}
                disabled={loadingMore}
                className="mt-14 px-8 py-3.5 bg-blue-600 shadow-[0_8px_20px_-5px_rgba(37,99,235,0.4)] text-white font-bold rounded-full text-[14px] hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 border border-blue-500"
              >
                {loadingMore ? (
                  <><Loader2 size={18} className="animate-spin text-white/70" /> กำลังโหลดเพิ่ม...</>
                ) : (
                  "โหลดคำคมเพิ่มเติม"
                )}
              </motion.button>
            )}

          </div>
        )}
      </main>

      {/* 💡 6. Footer โทนดาร์ก */}
      <footer className="w-full py-10 mt-auto flex flex-col items-center justify-center relative z-10 bg-slate-900/40 backdrop-blur-md border-t border-slate-800">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] drop-shadow-sm">
          Created By <span className="text-blue-500 mx-1">×</span> อัพสกิลกับฟุ้ย
        </p>
        <p className="text-[10px] text-slate-600 font-medium tracking-wider mt-2">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </footer>
    </div>
  );
}