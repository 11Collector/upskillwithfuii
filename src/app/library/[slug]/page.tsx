"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft,ChevronRight, Share2, Calendar, Clock, ArrowLeft, 
  User, BookMarked, Sparkles, Crown, Target, CheckCircle2, Loader2 
} from "lucide-react";
import Link from "next/link";

// 💡 เพิ่มการนำเข้า Firebase Firestore และ Auth
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, increment, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

const mockArticles = [
  {
    slug: "naval-almanack-summary",
    title: "สรุปแก่นคิด The Almanack of Naval Ravikant: สร้างความมั่งคั่งแบบไม่ต้องพึ่งโชค",
    summary: "ความมั่งคั่งที่ยั่งยืนเกิดจากการใช้ Leverage ในรูปแบบของ Code หรือ Media ที่ทำงานแทนเราได้ในขณะที่เราหลับ",
    content: `การสร้างความมั่งคั่งไม่ได้หมายถึงการทำงานหนักเพียงอย่างเดียว แต่คือการเข้าใจเรื่อง "Leverage" (คานผ่อนแรง) 

โดย Naval แบ่ง Leverage ออกเป็น 3 ประเภทหลัก:
1. แรงงาน (Labor): จ้างคนอื่นทำงาน (ขยายยากที่สุด)
2. เงินทุน (Capital): ใช้เงินทำงาน (ต้องมีเงินก่อน)
3. ผลิตภัณฑ์ที่ต้นทุนการผลิตซ้ำเป็นศูนย์ (Code & Media): เช่น การเขียนโปรแกรม, การอัดคลิป TikTok หรือการเขียนบทความ (ขยายง่ายที่สุดและแนะนำสำหรับยุคนี้)

หัวใจสำคัญคือการหา "Specific Knowledge" หรือทักษะเฉพาะตัวที่โลกต้องการ แต่ไม่ได้สอนในโรงเรียน...`,
    category: "หนังสือ",
    readTime: "3 นาที",
    date: "27 มี.ค. 2026",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  {
    slug: "let-them-theory",
    title: "Let Them Theory: ทฤษฎี 'ปล่อยเขา' เพื่อความสงบในใจ",
    summary: "ความสงบในใจเกิดขึ้นเมื่อเราหยุดพยายามควบคุมคนอื่น และอนุญาตให้เขาเป็นในสิ่งที่เขาเป็นเพื่อรักษาพลังงานมาโฟกัสตัวเอง",
    content: `ทฤษฎี Let Them คือการอนุญาตให้คนอื่นเป็นในสิ่งที่เขาเป็น โดยที่เราไม่ต้องเข้าไปแบกความคาดหวังหรือพยายามควบคุม

เมื่อเราปล่อยให้คนอื่น:
- เข้าใจเราผิด... ก็ปล่อยเขา (Let them)
- ทำตัวไม่น่ารัก... ก็ปล่อยเขา (Let them)
- ไม่เลือกเรา... ก็ปล่อยเขา (Let them)

หน้าที่เราไม่ใช่การไปแก้ความคิดใคร แต่คือการรักษา 'ความสงบในใจ' ของเราเอง เมื่อเราลดการควบคุม เราจะเหลือพลังงานมาโฟกัสที่การพัฒนาตัวเองมากขึ้นครับ`,
    category: "พัฒนาตัวเอง",
    readTime: "3 นาที",
    date: "28 มี.ค. 2026",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  },
  {
    slug: "10-years-experience",
    title: "คุณทำงานมา 10 ปี หรือแค่มีประสบการณ์ 1 ปีที่ทำซ้ำมา 9 รอบ",
    summary: "ประสบการณ์ที่มีค่าไม่ใช่จำนวนปีที่ทำมา แต่คือความสามารถในการ Unlearn ของเก่า และ Relearn ของใหม่ให้ทันโลก",
    category: "พัฒนาตัวเอง",
    readTime: "4 นาที",
    date: "31 มี.ค. 2026",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    content: `เรามักภูมิใจกับคำว่า "ประสบการณ์" แต่ในโลกยุคปี 2026 ที่ AI เขียน Code ได้... 
    
ถ้าวันนี้เรายังรู้สึกว่า "วิธีที่พี่ทำมา 5 ปีก่อนยังเวิร์กที่สุด ไม่ต้องเถียง" อยากชวนให้ลองเช็คตัวเองใหม่ ผ่านกระบวนการ 3 Loop นี้ครับ:

1/ Learn (เติมของใหม่)
การเรียนรู้ยุคนี้ คือการเรียนรู้ "บริบทโลกใหม่" ที่กระทบกับงานของเราโดยตรง

2/ Unlearn (ทิ้งของเก่า)
นี่คือด่านปราบเซียน เพราะเราถูกสอนมาให้เชื่อใน Standard และ Norm เดิมๆ การ Unlearn ไม่ใช่การลืมความรู้พื้นฐาน แต่คือการ "กล้าทิ้งความเชื่อที่หมดอายุ"

3/ Relearn (เรียนรู้ซ้ำในมุมมองใหม่)
เอาพื้นฐานที่แน่นของเรา มา "Format" ใหม่ด้วยเครื่องมือยุคปัจจุบัน

ความจริงที่น่ากลัวคือ โลกธุรกิจและนายจ้าง ไม่ได้จ่ายเงินเดือนให้เราจาก "ความสำเร็จในอดีต" แต่เขาจ่ายให้จาก "ความสามารถในการแก้ปัญหาปัจจุบัน"`
  },
  {
    slug: "life-design-vs-career",
    title: "เลิกถามว่าทำงานอะไรดี แล้วเริ่มถามว่า 'อยากมีชีวิตแบบไหน?'",
    summary: "ความสำเร็จในอาชีพเป็นเพียงส่วนหนึ่งของชีวิต การออกแบบไลฟ์สไตล์ที่ต้องการก่อนจะช่วยให้คุณเลือกงานที่ตอบโจทย์ความสุขได้จริง",
    category: "พัฒนาตัวเอง",
    readTime: "4 นาที",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    date: "31 มี.ค. 2026",
    content: `เวลาเราจบใหม่ๆ คำถามอย่างแรกที่เรามักถามกันคือ "จบมาแล้วจะทำอะไรดี งานแบบไหนที่ตอบโจทย์เรา?"

แต่จริงๆ แล้วสิ่งที่ผมได้เรียนรู้คือ คำถามที่ดีกว่าที่จะทำให้เรามีชีวิตที่ดีขึ้นได้จริงคือ "เราอยากมีชีวิตแบบไหน?"

เราต้องแยกให้ออกว่า 3 สิ่งนี้ไม่ใช่เรื่องเดียวกันเสมอไป:
1. ความสำเร็จ ในการเรียน (Academic Success)
2. ความสำเร็จ ในการงาน (Career Success)
3. ความสำเร็จ ในชีวิต (Life Success)

ผมเจอคนที่เรียนเก่งมากๆ แต่ไม่ได้ทำงานที่ชอบ หรือเจอคนมากมายที่งานดีมีหน้ามีตา แต่ชีวิตพัง ความสัมพันธ์แย่ และไม่มีความสุขในทุกเช้าที่ตื่นมา

บางทีเราอาจไม่รู้ว่า "สมดุลชีวิต" ของเราคืออะไร เพราะเรามัวแต่โฟกัสที่การวิ่งตามมาตรฐานสังคม การกลับมาตั้งคำถามนี้ชัดๆ จะทำให้เราเห็นภาพว่า:

- ชีวิตแบบที่เราใฝ่ฝัน... งานปัจจุบันอาจให้ไม่ได้
- งานประจำ Routine... อาจไม่สามารถสร้างอิสระที่เราต้องการจริง ๆ

สุดท้ายแล้ว คำตอบมันไม่ได้อยู่ใน Google หรือคำแนะนำของใคร แตมันอยู่ที่ตัวเรา และเราต้องเป็นคนกล้าที่จะหามันด้วยตัวเองครับ`
  }
];

export default function ArticleDetail() {
  const { slug } = useParams();
  const router = useRouter();
  
  // แปลง slug เป็น string (เผื่อกรณี catch-all route ส่งมาเป็น array)
  const articleSlug = Array.isArray(slug) ? slug[0] : slug;

  // State เดิม
  const [showSummary, setShowSummary] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  // State ใหม่สำหรับ Firebase
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const article = mockArticles.find((a) => a.slug === articleSlug);

  // 💡 เช็กว่า User ล็อกอินและเคยกดรับ XP บทความนี้หรือยัง
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            // ตรวจสอบจาก Array readArticles ว่ามี slug นี้ไหม
            if (userData.readArticles && userData.readArticles.includes(articleSlug)) {
              setXpClaimed(true); // ถ้าเคยอ่านแล้วก็ปรับสถานะเป็นเคลมแล้วทันที
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [articleSlug]);

  // 💡 ฟังก์ชันบันทึก XP ลง Database
  const handleClaimXP = async () => {
    if (!user || xpClaimed || isClaiming) return;
    
    setIsClaiming(true);
    
    try {
      const userRef = doc(db, "users", user.uid);
      
      // อัปเดตข้อมูล: บวก XP 5 หน่วย และเอา slug ใส่เข้าไปในประวัติการอ่าน
      await setDoc(userRef, {
        totalXP: increment(5),
        readArticles: arrayUnion(articleSlug)
      }, { merge: true });

      setXpClaimed(true);
    } catch (error) {
      console.error("Error claiming article XP:", error);
      alert("เกิดข้อผิดพลาดในการรับ XP กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsClaiming(false);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#0A0A0A] text-white">
        <h2 className="text-2xl font-black mb-4">ไม่พบเนื้อหานี้ในคลังสมอง 😅</h2>
        <Link href="/library" className="flex items-center gap-2 text-amber-400 font-bold hover:underline">
          <ArrowLeft size={18} /> กลับไปหน้าคลังหนังสือ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20 font-sans text-slate-200 selection:bg-amber-500/30">
      {/* Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* 🧭 Navigation */}
      <nav className="sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-xl z-50 border-b border-white/5 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors font-bold text-sm"
          >
            <ChevronLeft size={20} /> ย้อนกลับ
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-black border border-amber-500/20 uppercase tracking-widest">
             <Crown size={12} /> EXCLUSIVE UPSKILL LIBRARY
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full text-slate-400">
            <Share2 size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-12 relative z-10">
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-block mb-6">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${article.color}`}>
              {article.category}
            </span>
          </div>
      <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.4] mb-8">
  {article.title}
</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm font-bold border-y border-white/5 py-6">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-amber-500/50" /> <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500/50" /> <span>{article.readTime}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <User size={16} className="text-amber-500/50" /> <span>By Fuii</span>
            </div>
          </div>
        </motion.header>

        {/* ✍️ Content Area */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="min-h-[300px]"
        >
          <article className="prose prose-invert max-w-none">
            <div className="whitespace-pre-line text-slate-300 leading-[2.1] text-lg font-light italic-none">
              {article.content}
            </div>
          </article>
        </motion.section>

        {/* 💡 1-Sentence Summary & XP Section */}
       {/* 💡 1-Sentence Summary & XP Section (ปรับให้เล็กลงและสวยขึ้น) */}
        <div className="mt-16 pt-10 border-t border-white/5">
          {!showSummary ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSummary(true)}
              className="w-full py-8 rounded-[2rem] border border-dashed border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all flex flex-col items-center gap-3 group"
            >
              <div className="p-3 bg-amber-500/20 rounded-full group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Sparkles className="text-amber-400" size={22} />
              </div>
              <div className="text-center">
                <span className="block text-amber-400 font-bold text-base tracking-wide">ตกผลึกความรู้</span>
                <span className="text-amber-500/40 text-[10px] font-black uppercase tracking-widest mt-1">+5 XP Rewards</span>
              </div>
            </motion.button>
          ) : (
            /* ✅ สรุปเวอร์ชัน Compact & Prettier */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-amber-500/10 via-transparent to-transparent p-6 md:p-8 rounded-[2rem] border border-white/10 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-amber-500 text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                  <Target size={12} /> The Elite Insight
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8 italic pr-4">
                  "{article.summary}"
                </h3>
                
                {!xpClaimed ? (
                  <button 
                    onClick={handleClaimXP}
                    disabled={isClaiming || !user}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black text-xs font-black rounded-xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isClaiming ? <Loader2 className="animate-spin" size={14} /> : "CLAIM +5 XP"}
                  </button>
                ) : (
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    className="flex items-center gap-2 text-emerald-400 text-xs font-black bg-emerald-500/10 w-fit px-4 py-2 rounded-xl border border-emerald-500/20"
                  >
                    <CheckCircle2 size={16} />
                    <span>XP CLAIMED</span>
                  </motion.div>
                )}
              </div>
              {/* Background Decor */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/10 blur-3xl rounded-full" />
            </motion.div>
          )}
        </div>

        {/* 🚀 Footer CTA (เปลี่ยนเป็น Emoji Layout Dashboard) */}
        <motion.footer 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-white/5"
        >
          <div className="flex flex-col items-center text-center gap-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">เช็ก Progress การเติบโตของคุณต่อ</h2>
              <p className="text-slate-500 text-sm">กลับไปหน้า Dashboard เพื่อดูภาพรวมการอัพสกิลของคุณ </p>
            </div>

            <Link href="/dashboard" className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <button className="relative flex items-center gap-4 bg-[#111] px-6 py-4 rounded-2xl border border-white/10 transition-all hover:border-amber-500/50">
                {/* Emoji Layout Grid */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-lg">
                  <div className="w-3 h-3 flex items-center justify-center text-[8px]">🏠</div>
                  <div className="w-3 h-3 flex items-center justify-center text-[8px]">📊</div>
                  <div className="w-3 h-3 flex items-center justify-center text-[8px]">🎯</div>
                  <div className="w-3 h-3 flex items-center justify-center text-[8px]">⚡</div>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Return to</p>
                  <p className="text-sm font-bold text-white">Dashboard</p>
                </div>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </button>
            </Link>
          </div>
        </motion.footer>

        <div className="mt-12 text-center">
            <Link href="/library" className="text-slate-600 hover:text-slate-400 transition-colors text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                <ArrowLeft size={12} /> Back to Library
            </Link>
        </div>
      </main>
    </div>
  );
}