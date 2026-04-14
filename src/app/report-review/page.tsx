"use client";

import { useEffect, useState, Suspense } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Download, ChevronLeft, Printer } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ReportReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>("คุณฟุ้ย");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no session ID, they might not have paid, but we let them pass for testing 
    // or we could enforce it.
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      setUserName(currentUser.displayName || "ผู้ใช้งาน");

      try {
        setGenerating(true);
        // Fetch user data
        const authWheelRef = collection(db, "users", currentUser.uid, "assessments");
        const [authWheelSnap, discSnap, moneySnap] = await Promise.all([
          getDocs(query(authWheelRef, orderBy("createdAt", "desc"), limit(1))),
          getDocs(query(collection(db, "discResults"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1))),
          getDocs(query(collection(db, "quiz_results"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1)))
        ]);

        let lastWheel = null;
        let lastDisc = null;
        let lastMoney = null;

        if (!authWheelSnap.empty) {
          lastWheel = authWheelSnap.docs[0].data();
        }
        if (!discSnap.empty) {
          lastDisc = discSnap.docs[0].data();
        }
        if (!moneySnap.empty) {
          lastMoney = moneySnap.docs[0].data();
        }

        if (!lastDisc || !lastMoney || !lastWheel) {
          setError("ไม่พบข้อมูลการประเมินของคุณ กรุณาทำแบบประเมินให้ครบถ้วนก่อน");
          setGenerating(false);
          setLoading(false);
          return;
        }

        // Call API
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: currentUser.displayName || "ผู้ใช้งาน",
            lastDisc,
            lastMoney,
            lastWheel
          })
        });

        if (!response.ok) {
          throw new Error("เกิดข้อผิดพลาดในการสร้าง Report");
        }

        const data = await response.json();
        setReportData(data.analysis);

      } catch (err: any) {
        console.error(err);
        setError("ไม่สามารถสร้าง Report ได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setGenerating(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, sessionId]);

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold mb-2">ระบบกำลังสังเคราะห์ The Master Blueprint...</h2>
        <p className="text-slate-400">อาจใช้เวลา 1-2 นาที โปรดรอสักครู่</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-2">แจ้งเตือน</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            กลับสู่แดชบอร์ด
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Buttons Header (Hidden in Print) */}
        <div className="flex justify-between items-center print:hidden">
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            กลับแดชบอร์ด
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-lg"
          >
            <Printer className="w-5 h-5" />
            บันทึกเป็น PDF
          </button>
        </div>

        {/* Report Document */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-slate-900 rounded-3xl shadow-xl p-8 md:p-12 print:shadow-none print:p-0"
        >
          {/* Header */}
          <div className="text-center mb-10 border-b border-slate-200 pb-8">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
              The Master Blueprint
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              Exclusive Life Architecture for <span className="text-slate-800 font-bold">{userName}</span>
            </p>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-h3:text-blue-700 prose-a:text-blue-600 prose-strong:text-slate-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {reportData || ""}
            </ReactMarkdown>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}

export default function ReportReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-white" /></div>}>
      <ReportReviewContent />
    </Suspense>
  );
}
