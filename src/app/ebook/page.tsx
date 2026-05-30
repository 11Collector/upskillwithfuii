"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Download, CheckCircle, ChevronRight, Users } from "lucide-react";
import Image from "next/image";
import { Sarabun } from "next/font/google";

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
  "ดาวน์โหลดฟรี ไม่มีเงื่อนไข",
];

export default function EbookPage() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadCount, setDownloadCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/ebook-lead')
      .then(r => r.json())
      .then(d => setDownloadCount(d.count ?? null))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch('/api/ebook-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error('server error');
      setStatus("done");
    } catch {
      setErrorMsg("เกิดข้อผิดพลาด ลองใหม่อีกครั้งนะครับ");
      setStatus("error");
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
          style={{ background: "#fff", border: "1px solid rgba(123,24,24,0.12)" }}
        >
          <div className="text-3xl mb-3">🎉</div>
          <h2 className="text-lg font-extrabold mb-1">ขอบคุณครับ!</h2>
          <p className="text-sm mb-6" style={{ color: "#5a5a5a" }}>กด Download ด้านล่างได้เลย</p>
          <a
            href="/สร้างก่อนพร้อม-A5.pdf"
            download="สร้างก่อนพร้อม.pdf"
            className="flex items-center justify-center gap-2 font-extrabold py-4 px-8 rounded-xl text-sm w-full"
            style={{ background: "#7B1818", color: "#fff" }}
          >
            <Download size={16} />
            Download E-Book ฟรี
          </a>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "#fff", border: "1px solid rgba(123,24,24,0.12)" }}
        >
          <div className="text-center">
            <h2 className="text-base font-extrabold">ดาวน์โหลดฟรี</h2>
            <p className="text-xs mt-1" style={{ color: "#5a5a5a" }}>กรอก email รับไฟล์ได้เลย</p>
          </div>
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
          {errorMsg && <p className="text-xs text-center" style={{ color: "#c0392b" }}>{errorMsg}</p>}
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center justify-center gap-2 w-full font-extrabold py-3 rounded-xl text-sm"
            style={{ background: "#7B1818", color: "#fff", opacity: status === "loading" ? 0.6 : 1 }}
          >
            {status === "loading" ? (
              <span className="animate-pulse">กำลังโหลด...</span>
            ) : (
              <><Download size={15} />รับ E-Book ฟรี</>
            )}
          </button>
          <p className="text-xs text-center" style={{ color: "#aaa" }}>
            ไม่มี spam · เลิก subscribe เมื่อไรก็ได้
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );

  return (
    <div className={sarabun.className} style={{ background: "#faf9f7", minHeight: "100vh", color: "#1a1a1a" }}>

      {/* Top bar */}
      <div style={{ height: 5, background: "#7B1818" }} />

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* ── Desktop: 2-col  Mobile: 1-col ── */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-16 lg:items-start">

          {/* ── LEFT COL (cover + info) ── */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-start lg:sticky lg:top-12">

            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-xl overflow-hidden w-44 lg:w-56"
              style={{ boxShadow: "0 16px 48px rgba(123,24,24,0.2)" }}
            >
              <Image
                src="/ebook-cover.png"
                alt="สร้างก่อนพร้อม"
                width={224}
                height={316}
                className="w-full h-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-center lg:text-left"
            >
              <div
                className="inline-block text-xs font-extrabold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
                style={{ background: "rgba(123,24,24,0.08)", color: "#7B1818" }}
              >
                Free E-Book
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
                สร้างก่อนพร้อม
              </h1>
              <p style={{ color: "#5a5a5a" }} className="text-sm leading-relaxed">
                41 บทความพัฒนาตัวเอง จากคนธรรมดาที่เริ่มต้นแม้ยังไม่พร้อม
              </p>

              {downloadCount !== null && downloadCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: "rgba(123,24,24,0.08)", color: "#7B1818" }}
                >
                  <Users size={12} />
                  {downloadCount.toLocaleString()} คนดาวน์โหลดไปแล้ว
                </motion.div>
              )}

              {/* Highlights — desktop only here */}
              <div className="hidden lg:block mt-8 space-y-3">
                {HIGHLIGHTS.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={15} style={{ color: "#7B1818", flexShrink: 0, marginTop: 2 }} />
                    <span className="text-sm" style={{ color: "#3a3a3a" }}>{h}</span>
                  </div>
                ))}
              </div>

              {/* Author — desktop only here */}
              <div
                className="hidden lg:block mt-8 rounded-2xl p-5"
                style={{ background: "#fff", border: "1px solid rgba(123,24,24,0.08)" }}
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
            </motion.div>
          </div>

          {/* ── RIGHT COL (form + chapters) ── */}
          <div className="lg:col-span-3 mt-10 lg:mt-0">

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
                    className="rounded-xl px-5 py-4 flex items-center justify-between"
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

            {/* Author — mobile only */}
            <div
              className="lg:hidden mt-8 rounded-2xl p-6"
              style={{ background: "#fff", border: "1px solid rgba(123,24,24,0.08)" }}
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
                className="mt-4 flex items-center gap-1 text-xs font-bold"
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
