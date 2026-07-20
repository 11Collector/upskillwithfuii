"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Sparkles, ShieldCheck, MessageCircle } from "lucide-react";
import { PersonaResult } from "@/data/personalityZeroData";

export interface CommentItem {
  id: string;
  personaCode: string;
  personaTitle: string;
  commentText: string;
  createdAt: string;
}

interface PersonalityZeroCommentsProps {
  persona?: PersonaResult | null;
  allowPost?: boolean;
}

export const PersonalityZeroComments: React.FC<PersonalityZeroCommentsProps> = ({
  persona,
  allowPost = true,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPosted, setHasPosted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/personalityzero/comments", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.comments) {
        setComments(data.comments);
      }
    } catch (e) {
      console.error("Failed to fetch comments:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting || hasPosted) return;

    const textToPost = inputText.trim();
    setIsSubmitting(true);

    const newCommentObj: CommentItem = {
      id: `temp-${Date.now()}`,
      personaCode: persona?.code || "NPC",
      personaTitle: persona?.title || "THE DEFAULT",
      commentText: textToPost,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setComments((prev) => [newCommentObj, ...prev]);
    setInputText("");
    setHasPosted(true);

    try {
      await fetch("/api/personalityzero/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaCode: persona?.code || "NPC",
          personaTitle: persona?.title || "THE DEFAULT",
          commentText: textToPost,
        }),
      });
      fetchComments();
    } catch (e) {
      console.error("Failed to post comment:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4 text-left">
      {/* Post Comment Input Section */}
      {allowPost && (
        <div className="bg-white border-2 border-neutral-900 rounded-3xl p-4 shadow-lg relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-red-600" />
              <span className="text-xs font-black text-neutral-950 uppercase tracking-wider">
                ทิ้งข้อความไว้ทำไมวะ
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 font-bold">ANONYMOUS</span>
          </div>

          {!hasPosted ? (
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  maxLength={150}
                  placeholder="เขียนอะไรปั่นๆ หรือระบายความในใจทิ้งไว้ที่นี่... (ไม่เก็บชื่อ/อีเมล)"
                  className="w-full h-20 bg-neutral-50 border border-neutral-300 rounded-2xl p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-600 transition-colors resize-none"
                />
                <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-neutral-400">
                  {inputText.length}/150
                </span>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isSubmitting}
                className="w-full py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-600/20"
              >
                <Send size={14} />
                <span>{isSubmitting ? "กำลังส่งข้อความ..." : "ส่งข้อความไว้"}</span>
              </button>
            </form>
          ) : (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-center space-y-1">
              <span className="text-xs font-bold text-red-600 block">
                ✓ ส่งข้อความไว้เรียบร้อย!
              </span>
              <p className="text-[10px] text-neutral-600">
                ขอบคุณที่ร่วมแบ่งปันความไร้สาระอย่างปลอดภัย ไร้การเก็บตัวตน 🙏
              </p>
            </div>
          )}
        </div>
      )}

      {/* Live Comment Feed Wall */}
      <div className="bg-white border-2 border-neutral-900 rounded-3xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-red-600" />
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">
              กำแพงข้อความ
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold text-red-600">LIVE FEED</span>
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-neutral-500 font-mono">
            กำลังดึงข้อความปั่นๆ...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-500">
            ยังไม่มีข้อความ มาร่วมประเดิมคนแรกกัน!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-300">
            {comments.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1.5 hover:border-neutral-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-50 text-red-600 border border-red-200 font-mono">
                    {item.personaCode} · {item.personaTitle}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400">Anonymous</span>
                </div>
                <p className="text-xs font-medium text-neutral-800 leading-relaxed break-words">
                  "{item.commentText}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
