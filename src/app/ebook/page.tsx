"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Download, CheckCircle, ChevronRight, Crown, Lock, Sparkles } from "lucide-react";
import Image from "next/image";
import { Sarabun } from "next/font/google";
import { onAuthStateChanged, signInWithPopup, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700", "800"],
});

const CHAPTERS = [
  { part: "Part 1", title: "ตั้งต้นให้ถูก",      sub: "รู้จักตัวเองก่อนไปต่อ",               count: 6  },
  { part: "Part 2", title: "ปลดล็อคความคิด",    sub: "สิ่งที่ขวางอยู่ข้างใน",               count: 9  },
  { part: "Part 3", title: "สร้างและเติบโต",    sub: "เงิน ธุรกิจ และโลกความเป็นจริง",     count: 13 },
  { part: "Part 4", title: "บทเรียนจากหนังสือ", sub: "ไอเดียที่เปลี่ยนมุมมอง",              count: 13 },
];

const HIGHLIGHTS = [
  "41 บทความในการพัฒนาตัวเอง ธุรกิจ ชีวิต",
  "QR Code เชื่อมไปยัง Tools ช่วย Self-awareness",
  "โบนัส E-Book สำหรับสมาชิก PRO",
];

export default function EbookPage() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [checkingMember, setCheckingMember] = useState(true);
  const [isProMember, setIsProMember] = useState(false);
  const [hasEbookAccess, setHasEbookAccess] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsProMember(false);
      setHasEbookAccess(false);
      setCheckingMember(true);

      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      if (!currentUser) {
        setCheckingMember(false);
        return;
      }

      unsubSnapshot = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
        try {
          const data = snap.exists() ? snap.data() : {};
          const subscriptionStatus = data?.subscriptionStatus || data?.subscription_status || "";
          const subscriptionTier = data?.subscriptionTier || data?.subscription_tier || "";
          const isPro =
            data?.role === "premium" ||
            subscriptionTier === "pro" ||
            ["active", "trialing"].includes(subscriptionStatus) ||
            Boolean(data?.isLifetimeMember);

          setIsProMember(isPro);

          const hasAccess =
            isPro && (
              Boolean(data?.isLifetimeMember) ||
              data?.subscriptionPlan === "lifetime" ||
              data?.subscriptionPlan === "yearly" ||
              data?.subscriptionPlan === "founding_yearly"
            );
          setHasEbookAccess(hasAccess);
        } catch {
          setIsProMember(false);
          setHasEbookAccess(false);
        } finally {
          setCheckingMember(false);
        }
      }, (error) => {
        console.error("Ebook page snapshot error:", error);
        setIsProMember(false);
        setHasEbookAccess(false);
        setCheckingMember(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setErrorMsg("เข้าสู่ระบบก่อนรับ E-Book สำหรับ PRO นะครับ");
      return;
    }
    if (!hasEbookAccess) {
      setErrorMsg("E-Book เล่มนี้เป็นโบนัสสำหรับสมาชิก PRO รายปี หรือ Lifetime ครับ");
      return;
    }
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/ebook-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'server error');
      }
      setStatus("done");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "เกิดข้อผิดพลาด ลองใหม่อีกครั้งนะครับ");
      setStatus("error");
    }
  }

  async function handleDownload() {
    if (!user || !isProMember) {
      setErrorMsg("E-Book เล่มนี้เป็นโบนัสสำหรับสมาชิก PRO ครับ");
      return;
    }

    setDownloading(true);
    setErrorMsg("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/ebook-download", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "ดาวน์โหลดไม่สำเร็จ ลองใหม่อีกครั้งนะครับ");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "สร้างก่อนพร้อม.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "ดาวน์โหลดไม่สำเร็จ ลองใหม่อีกครั้งนะครับ");
    } finally {
      setDownloading(false);
    }
  }

  const form = (
    <AnimatePresence mode="wait">
      {status === "done" ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-8 text-center"
          style={{ background: "#fff", border: "1px solid rgba(123,24,24,0.12)", boxShadow: "0 8px 32px rgba(123,24,24,0.08)" }}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Crown size={22} />
          </div>
          <h2 className="text-lg font-extrabold mb-1">ปลดล็อกแล้วครับ</h2>
          <p className="text-sm mb-6" style={{ color: "#5a5a5a" }}>กด Download ด้านล่างได้เลย</p>
          {errorMsg && <p className="text-xs text-center mb-3" style={{ color: "#c0392b" }}>{errorMsg}</p>}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 font-extrabold py-4 px-8 rounded-xl text-sm w-full"
            style={{ background: "#7B1818", color: "#fff", opacity: downloading ? 0.65 : 1 }}
          >
            <Download size={16} />
            {downloading ? "กำลังดาวน์โหลด..." : "Download E-Book"}
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 lg:p-8 space-y-4"
          style={{ background: "#fff", border: "1px solid rgba(123,24,24,0.12)", boxShadow: "0 8px 32px rgba(123,24,24,0.08)" }}
        >
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              {hasEbookAccess ? <Crown size={20} /> : <Lock size={19} />}
            </div>
            <h2 className="text-base font-extrabold">{hasEbookAccess ? "รับ E-Book สำหรับ PRO" : "E-Book สำหรับสมาชิก PRO"}</h2>
            <p className="text-xs mt-1" style={{ color: "#5a5a5a" }}>
              {hasEbookAccess ? "กรอก email เพื่อรับไฟล์เล่มนี้" : "ปลดล็อกเมื่อสมัคร PRO รายปีหรือ Lifetime"}
            </p>
          </div>
          {hasEbookAccess && (
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#aaa" }} />
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none"
                style={{ background: "#faf9f7", border: "1px solid rgba(123,24,24,0.2)", color: "#1a1a1a" }}
              />
            </div>
          )}
          {errorMsg && <p className="text-xs text-center" style={{ color: "#c0392b" }}>{errorMsg}</p>}
          {hasEbookAccess ? (
            <>
              <button
                type="submit"
                disabled={status === "loading" || checkingMember}
                className="flex items-center justify-center gap-2 w-full font-extrabold py-3 rounded-xl text-sm"
                style={{ background: "#7B1818", color: "#fff", opacity: status === "loading" ? 0.6 : 1 }}
              >
                {status === "loading" ? (
                  <span className="animate-pulse">กำลังโหลด...</span>
                ) : (
                  <><Download size={15} />รับ E-Book</>
                )}
              </button>
              <p className="text-xs text-center" style={{ color: "#aaa" }}>
                ไม่มี spam · ใช้สำหรับส่งไฟล์และข่าวสาร PRO เท่านั้น
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={async () => {
                  if (!user) {
                    await signInWithPopup(auth, googleProvider);
                    return;
                  }
                  window.location.href = "/dashboard?membership=1";
                }}
                className="flex items-center justify-center gap-2 w-full font-extrabold py-3 rounded-xl text-sm"
                style={{ background: "#111827", color: "#fff" }}
              >
                {!user ? "เข้าสู่ระบบก่อนรับสิทธิ์" : "ดูแผน PRO เพื่อปลดล็อก"}
                <ChevronRight size={15} />
              </button>
              <p className="text-xs text-center" style={{ color: "#aaa" }}>
                E-Book นี้เป็นโบนัสสำหรับสมาชิก PRO เท่านั้น
              </p>
            </>
          )}
        </motion.form>
      )}
    </AnimatePresence>
  );

  return (
    <div className={sarabun.className} style={{ background: "#faf9f7", minHeight: "100vh", color: "#1a1a1a" }}>

      {/* Top bar */}
      <div style={{ height: 5, background: "#7B1818" }} />

      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">

        {/* ── Desktop: 2-col  Mobile: 1-col ── */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-20 lg:items-start">

          {/* ── LEFT COL (cover + info) ── */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-center lg:sticky lg:top-16">

            {/* Cover with glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl overflow-hidden w-44 lg:w-64"
              style={{ boxShadow: "0 24px 64px rgba(123,24,24,0.25), 0 4px 16px rgba(123,24,24,0.1)" }}
            >
              <Image
                src="/ebook-cover.png"
                alt="สร้างก่อนพร้อม"
                width={256}
                height={362}
                className="w-full h-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-center w-full"
            >
              <div
                className="inline-block text-xs font-extrabold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
                style={{ background: "rgba(123,24,24,0.08)", color: "#7B1818" }}
              >
                Pro Member Bonus
              </div>
              <h1 className="text-3xl lg:text-3xl font-extrabold leading-tight mb-3">
                สร้างก่อนพร้อม
              </h1>
              <p style={{ color: "#5a5a5a" }} className="text-sm leading-relaxed">
                41 บทความพัฒนาตัวเอง<br className="hidden lg:block" /> จากคนธรรมดาที่เริ่มต้นแม้ยังไม่พร้อม
              </p>

              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(123,24,24,0.08)", color: "#7B1818" }}
              >
                <Sparkles size={12} />
                โบนัสสำหรับสมาชิก PRO
              </motion.div>

              {/* Highlights — desktop only */}
              <div className="hidden lg:block mt-8 space-y-3 text-left">
                {HIGHLIGHTS.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={14} style={{ color: "#7B1818", flexShrink: 0, marginTop: 3 }} />
                    <span className="text-sm" style={{ color: "#3a3a3a" }}>{h}</span>
                  </div>
                ))}
              </div>

            </motion.div>
          </div>

          {/* ── RIGHT COL (form + chapters) ── */}
          <div className="lg:col-span-3 mt-10 lg:mt-2">

            {/* Highlights — mobile only */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="lg:hidden space-y-3 mb-6"
            >
              {HIGHLIGHTS.map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={15} style={{ color: "#7B1818", flexShrink: 0, marginTop: 2 }} />
                  <span className="text-sm" style={{ color: "#3a3a3a" }}>{h}</span>
                </div>
              ))}
            </motion.div>

            {/* Divider mobile */}
            <div className="lg:hidden mb-6">
              <div style={{ height: 1, background: "rgba(123,24,24,0.12)" }} />
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="mb-8"
            >
              {form}
            </motion.div>

            {/* Chapters */}
            <div>
              <div
                className="text-xs font-extrabold tracking-widest uppercase mb-4"
                style={{ color: "#7B1818" }}
              >
                เนื้อหาในเล่ม
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CHAPTERS.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="rounded-xl px-5 py-4 flex items-center justify-between transition-shadow hover:shadow-md cursor-default"
                    style={{ background: "#fff", border: "1px solid rgba(123,24,24,0.08)" }}
                  >
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{ color: "#7B1818" }}>
                        {c.part}
                      </div>
                      <div className="font-bold text-sm" style={{ color: "#1a1a1a" }}>{c.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#5a5a5a" }}>{c.sub}</div>
                    </div>
                    <div className="text-xs ml-4 shrink-0" style={{ color: "#aaa" }}>{c.count} บทความ</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Author — below chapters on all screen sizes */}
            <div
              className="mt-6 rounded-2xl p-6"
              style={{ background: "#fff", border: "1px solid rgba(123,24,24,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="text-xs font-extrabold tracking-widest uppercase mb-3" style={{ color: "#7B1818" }}>
                เกี่ยวกับผู้เขียน
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#3a3a3a" }}>
                <span className="font-extrabold" style={{ color: "#1a1a1a" }}>ฟุ้ย</span>{" "}
                — จบวิศวกรรมคอมพิวเตอร์จากจุฬาฯ เคยแข่งโปรแกรมโอลิมปิกระดับชาติ
                ผ่านงานด้านการตลาด และลองผิดลองถูกจนสร้าง Web App ด้วยตัวเองได้ แม้ไม่เคยทำมาก่อน
              </p>
              <a
                href="https://upskilleveryday.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-1 text-xs font-bold"
                style={{ color: "#7B1818" }}
              >
                upskilleveryday.com <ChevronRight size={11} />
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ height: 5, background: "#7B1818" }} />
    </div>
  );
}
