"use client";

import { useState, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, ArrowRight, BookMarked, Target,
  Crown, Sparkles, LayoutGrid, Wallet, Briefcase, ChevronRight, CheckCircle2,
  Search, Plus, Trash2, Loader2, Copy, Check, FileText, RefreshCw, Brain, Lock
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ✅ 1. นำเข้าข้อมูล
import { mockArticles } from "@/constants/article";
import { db, auth, storage } from "@/lib/firebase";
import { doc, getDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// 🎨 2. Themes
const CATEGORY_THEMES: Record<string, { icon: any; color: string; bgColor: string; borderColor: string }> = {
  "ทั้งหมด": {
    icon: <LayoutGrid size={18} />,
    color: "text-slate-400",
    bgColor: "bg-white/5",
    borderColor: "border-white/10"
  },
  "หนังสือ": {
    icon: <BookOpen size={20} />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  },
  "พัฒนาตัวเอง": {
    icon: <Sparkles size={20} />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20"
  },
  "การเงิน & ลงทุน": {
    icon: <Wallet size={20} />,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20"
  },
  "ธุรกิจ": {
    icon: <Briefcase size={20} />,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20"
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

function LibraryContent() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isProMember, setIsProMember] = useState(false);
  const [hasEbookAccess, setHasEbookAccess] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // --- 🧠 Second Brain Notes States ---
  const [activeView, setActiveView] = useState<"library" | "notes">("library");
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("พัฒนาตัวเอง");
  const [searchNoteQuery, setSearchNoteQuery] = useState("");
  const [filterNoteCategory, setFilterNoteCategory] = useState("ทั้งหมด");
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeAiAction, setActiveAiAction] = useState<"summarize" | "coaching" | "quote" | null>(null);
  const [copyStatus, setCopyStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [mobileNotesView, setMobileNotesView] = useState<"list" | "editor">("list");
  const [isCreatingNoteFromUrl, setIsCreatingNoteFromUrl] = useState(false);

  // Derived state sync when newNote or noteId query param is present
  const newNoteParam = searchParams.get("newNote") === "true";
  const targetNoteId = searchParams.get("noteId");
  const [prevNewNote, setPrevNewNote] = useState(false);
  const [prevTargetNoteId, setPrevTargetNoteId] = useState<string | null>(null);

  if (newNoteParam !== prevNewNote || targetNoteId !== prevTargetNoteId) {
    setPrevNewNote(newNoteParam);
    setPrevTargetNoteId(targetNoteId);
    if (newNoteParam || targetNoteId) {
      setActiveView("notes");
      setMobileNotesView("editor");
      if (newNoteParam) {
        setIsCreatingNoteFromUrl(true);
      }
    }
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🆕 Second Brain Notes Listener
  useEffect(() => {
    if (!isMounted || !user) {
      setNotes([]);
      setSelectedNote(null);
      return;
    }

    const notesRef = collection(db, "users", user.uid, "second_brain");
    const q = query(notesRef, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setNotes(fetchedNotes);

      setSelectedNote((prev: any) => {
        const urlNoteId = searchParams.get("noteId");
        if (urlNoteId) {
          const target = fetchedNotes.find((n) => n.id === urlNoteId);
          if (target) return target;
        }
        if (prev) {
          const updated = fetchedNotes.find((n) => n.id === prev.id);
          return updated || fetchedNotes[0] || null;
        }
        return fetchedNotes[0] || null;
      });
    }, (error) => {
      console.error("Error fetching notes:", error);
    });

    return () => unsubscribe();
  }, [isMounted, user, searchParams]);

  // 🆕 Create note from query param
  useEffect(() => {
    if (!isMounted || !user) return;

    const params = new URLSearchParams(window.location.search);
    const shouldCreateNewNote = params.get("newNote") === "true";

    if (shouldCreateNewNote) {
      const createEmptyNote = async () => {
        try {
          const notesRef = collection(db, "users", user.uid, "second_brain");
          const createdAtStr = new Date().toISOString();
          const docRef = await addDoc(notesRef, {
            title: "บันทึกที่ไม่มีชื่อ",
            content: "",
            category: "พัฒนาตัวเอง",
            createdAt: createdAtStr,
            updatedAt: createdAtStr
          });

          setActiveView("notes");
          setMobileNotesView("editor");
          setSelectedNote({
            id: docRef.id,
            title: "บันทึกที่ไม่มีชื่อ",
            content: "",
            category: "พัฒนาตัวเอง",
            createdAt: createdAtStr,
            updatedAt: createdAtStr
          });

          // Clear query param
          params.delete("newNote");
          const newRelativePathQuery = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
          window.history.replaceState(null, "", newRelativePathQuery);
        } catch (err) {
          console.error("Failed to auto-create note from query:", err);
        } finally {
          setIsCreatingNoteFromUrl(false);
        }
      };

      createEmptyNote();
    }
  }, [isMounted, user]);

  // 🆕 Clean noteId from query param once note is loaded
  useEffect(() => {
    if (!isMounted) return;
    const urlNoteId = searchParams.get("noteId");
    if (urlNoteId && selectedNote && selectedNote.id === urlNoteId) {
      const params = new URLSearchParams(window.location.search);
      params.delete("noteId");
      const newRelativePathQuery = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState(null, "", newRelativePathQuery);
    }
  }, [isMounted, selectedNote?.id, searchParams]);

  // Sync selected note fields to local input states
  useEffect(() => {
    if (selectedNote) {
      setNoteTitle(selectedNote.title || "");
      setNoteContent(selectedNote.content || "");
      setNoteCategory(selectedNote.category || "พัฒนาตัวเอง");
    } else {
      setNoteTitle("");
      setNoteContent("");
      setNoteCategory("พัฒนาตัวเอง");
    }
  }, [selectedNote?.id]);

  // Auto-save note changes with debounce
  useEffect(() => {
    if (!user || !selectedNote) return;

    const isChanged =
      noteTitle !== (selectedNote.title || "") ||
      noteContent !== (selectedNote.content || "") ||
      noteCategory !== (selectedNote.category || "พัฒนาตัวเอง");

    if (!isChanged) return;

    setIsSaving(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const noteRef = doc(db, "users", user.uid, "second_brain", selectedNote.id);
        await updateDoc(noteRef, {
          title: noteTitle.trim() || "บันทึกที่ไม่มีชื่อ",
          content: noteContent,
          category: noteCategory,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error auto-saving note:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1200);

    return () => clearTimeout(delayDebounce);
  }, [noteTitle, noteContent, noteCategory, user, selectedNote?.id]);

  const deleteCurrentNoteIfEmpty = async () => {
    if (!user || !selectedNote) return;
    const isTitleDefault = !noteTitle.trim() || noteTitle === "บันทึกที่ไม่มีชื่อ";
    const isContentEmpty = !noteContent.trim();
    if (isTitleDefault && isContentEmpty) {
      try {
        const noteRef = doc(db, "users", user.uid, "second_brain", selectedNote.id);
        await deleteDoc(noteRef);
      } catch (error) {
        console.error("Failed to delete empty note on exit:", error);
      }
    }
  };

  const handleSelectNote = async (n: any) => {
    if (selectedNote && selectedNote.id !== n.id) {
      await deleteCurrentNoteIfEmpty();
    }
    setSelectedNote(n);
    setMobileNotesView("editor");
  };

  const handleCreateNote = async () => {
    if (!user) return;
    await deleteCurrentNoteIfEmpty();
    try {
      const notesRef = collection(db, "users", user.uid, "second_brain");
      const createdAtStr = new Date().toISOString();
      const newDoc = await addDoc(notesRef, {
        title: "บันทึกที่ไม่มีชื่อ",
        content: "",
        category: "พัฒนาตัวเอง",
        createdAt: createdAtStr,
        updatedAt: createdAtStr
      });
      setSelectedNote({
        id: newDoc.id,
        title: "บันทึกที่ไม่มีชื่อ",
        content: "",
        category: "พัฒนาตัวเอง",
        createdAt: createdAtStr,
        updatedAt: createdAtStr
      });
      setMobileNotesView("editor");
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    try {
      const noteRef = doc(db, "users", user.uid, "second_brain", noteId);
      await deleteDoc(noteRef);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleApplyTemplate = (type: "book" | "daily" | "idea") => {
    let templateText = "";
    if (type === "book") {
      templateText = `========================================
📚 สรุปหนังสือ: [ระบุชื่อหนังสือ]
========================================

1. จุดที่ชอบที่สุด (Key Takeaways)
- 
- 

2. ประโยคทองคำ (Favorite Quotes)
- " "

3. แผนที่จะเอาไปทำจริง (Action Plan)
[ ] 
`;
    } else if (type === "daily") {
      templateText = `========================================
🌅 บันทึกรายวัน & ทบทวนความรู้สึก
========================================

1. วันนี้มีอะไรดีๆ เกิดขึ้นบ้าง (Daily Wins)
- 
- 

2. 3 เรื่องที่รู้สึกขอบคุณวันนี้ (3 Gratitudes)
- 
- 
- 

3. สิ่งที่ควรพัฒนาให้ดียิ่งขึ้นพรุ่งนี้ (Lessons)
- 
`;
    } else if (type === "idea") {
      templateText = `========================================
💡 ไอเดียแล่น (Idea Spark)
========================================

1. รายละเอียดไอเดีย (Concept)
- 

2. ทำไมไอเดียนี้ถึงน่าสนใจ
- 

3. ขั้นตอนเล็กๆ แรกสุดที่จะเริ่มลงมือทำ (First Step)
[ ] 
`;
    }

    setNoteContent((prev) => {
      if (!prev.trim()) return templateText;
      return prev + "\n\n" + templateText;
    });
  };



  const handleCallAi = async (action: "summarize" | "quote" | "coaching") => {
    if (!user || !noteContent.trim()) return;

    if (!isProMember) {
      alert("✨ ฟีเจอร์ AI วิเคราะห์บันทึกสมองที่สอง เป็นสิทธิ์เฉพาะสมาชิก PRO\n\nสามารถอัปเดตสมาชิกที่หน้าแดชบอร์ดได้ครับ");
      return;
    }

    setIsAiLoading(true);
    setActiveAiAction(action);
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      let promptText = "";

      if (action === "summarize") {
        promptText = `ช่วยสรุปเนื้อหาโน้ตต่อไปนี้ให้กระชับ ตกผลึกออกมาเป็นข้อๆ ไม่เกิน 3 ข้อหลัก โดยเขียนในรูปแบบข้อความธรรมดา (Plain Text) เท่านั้น ห้ามใช้เครื่องหมายจัดฟอร์แมตที่เป็นมาร์กดาวน์ เช่น เครื่องหมายดอกจัน (**) หรือเครื่องหมายสี่เหลี่ยม (#) โดยเด็ดขาด ให้ใช้การขึ้นบรรทัดใหม่ธรรมดาและสัญลักษณ์หัวข้อ เช่น - หรือตัวเลขในการแบ่งข้อเพื่อความอ่านง่าย:\n\n${noteContent}`;
      } else if (action === "coaching") {
        promptText = `ช่วยอ่านโน้ตต่อไปนี้ และเขียนฟีดแบ็กแนะนำพร้อมให้กำลังใจ ในฐานะโค้ชพี่ฟุ้ยผู้เชี่ยวชาญ คอยแนะนำแบบเป็นกันเอง อบอุ่น นำไปใช้ได้จริง ความยาวประมาณ 3-4 ประโยค โดยเขียนในรูปแบบข้อความธรรมดา (Plain Text) เท่านั้น ห้ามใช้เครื่องหมายจัดฟอร์แมตที่เป็นมาร์กดาวน์ เช่น เครื่องหมายดอกจัน (**) หรือเครื่องหมายสี่เหลี่ยม (#) โดยเด็ดขาด:\n\n${noteContent}`;
      }

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          prompt: promptText,
          type: "second_brain"
        })
      });

      if (!response.ok) {
        throw new Error("AI call failed");
      }

      const data = await response.json();
      const aiResult = data.quote;

      const dateHeader = `\n\n----------------------------------------\n🤖 AI ${
        action === "summarize" ? "สรุปประเด็น" : "คำแนะนำจากพี่ฟุ้ย"
      } (${new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })})\n`;
      
      setNoteContent((prev) => prev + dateHeader + aiResult);

    } catch (error) {
      console.error("AI Action failed:", error);
      alert("ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ลองใหม่อีกครั้งนะครับ");
    } finally {
      setIsAiLoading(false);
      setActiveAiAction(null);
    }
  };

  const handleCopyToClipboard = () => {
    if (!noteContent) return;
    navigator.clipboard.writeText(noteContent);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const charCount = noteContent.length;
  const wordCount = noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0;

  // 1. Fetch Articles from Firestore
  useEffect(() => {
    if (!isMounted) return;
    const fetchArticles = async () => {
      try {
        const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
        const articlesRef = collection(db, "articles");
        const q = query(articlesRef, orderBy("id", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedArticles = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));

        if (fetchedArticles.length > 0) {
          setArticles(fetchedArticles);
        } else {
          setArticles(mockArticles);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
        setArticles(mockArticles);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [isMounted]);

  // 2. Fetch User Read History & PRO status
  useEffect(() => {
    if (!isMounted) return;
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (unsubSnapshot) {
          unsubSnapshot();
          unsubSnapshot = null;
        }

        const userRef = doc(db, "users", currentUser.uid);
        unsubSnapshot = onSnapshot(userRef, (snap) => {
          try {
            if (snap.exists()) {
              const userData = snap.data();
              if (userData.readArticles) {
                setReadArticles(userData.readArticles);
              }
              const subscriptionStatus = userData?.subscriptionStatus || userData?.subscription_status || "";
              const subscriptionTier = userData?.subscriptionTier || userData?.subscription_tier || "";
              const isPro =
                userData?.role === "premium" ||
                subscriptionTier === "pro" ||
                ["active", "trialing"].includes(subscriptionStatus) ||
                Boolean(userData?.isLifetimeMember);

              setIsProMember(isPro);

              const hasAccess =
                isPro && (
                  Boolean(userData?.isLifetimeMember) ||
                  userData?.subscriptionPlan === "lifetime" ||
                  userData?.subscriptionPlan === "yearly" ||
                  userData?.subscriptionPlan === "founding_yearly"
                );
              setHasEbookAccess(hasAccess);
            }
          } catch (error) {
            console.error("Error reading user data in library:", error);
          }
        });
      } else {
        setUser(null);
        setReadArticles([]);
        setIsProMember(false);
        setHasEbookAccess(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [isMounted]);

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === "ทั้งหมด" || article.category === activeCategory;
    const isRead = readArticles.includes(article.slug);
    const matchesStatus = statusFilter === "ทั้งหมด"
      || (statusFilter === "อ่านแล้ว" && isRead)
      || (statusFilter === "ยังไม่อ่าน" && !isRead);
    return matchesCategory && matchesStatus;
  });

  if (!isMounted || isCreatingNoteFromUrl) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-amber-500" size={36} />
        {isCreatingNoteFromUrl && (
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">
            กำลังสร้างโน้ตใหม่ในคลังสมองของคุณ... 🧠
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans overflow-x-hidden selection:bg-amber-500/30 p-6 md:p-10 ${
      activeView === "notes" ? "bg-slate-50 text-slate-800" : "bg-[#0A0A0A] text-slate-55"
    }`}>

      {/* Background Decor */}
      {activeView === "notes" ? (
        <>
          <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        </>
      ) : (
        <>
          <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        </>
      )}

      <div className="max-w-5xl mx-auto relative z-10">

        {/* --- View Switcher Header --- */}
        <div className="flex justify-center mb-10 pt-4">
          <div className={`inline-flex rounded-full p-1 border transition-colors shadow-sm ${
            activeView === "notes" ? "bg-slate-200/80 border-slate-300" : "bg-white/5 border-white/10"
          }`}>
            <button
              onClick={() => setActiveView("library")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                activeView === "library"
                  ? "bg-[#f59e0b] text-black shadow-md"
                  : activeView === "notes"
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen size={14} />
              คลังบทความ
            </button>
            <button
              onClick={() => {
                if (!user) {
                  alert("กรุณาเข้าสู่ระบบเพื่อใช้งานสมองที่สอง (Second Brain) ครับ");
                  return;
                }
                setActiveView("notes");
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                activeView === "notes"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText size={14} />
              สมองที่สอง
            </button>
          </div>
        </div>

        {activeView === "library" ? (
          <>
            {/* --- Header --- */}
            <header className="mb-10">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-black mb-6 border border-amber-500/20 uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <Crown size={14} /> <span>Exclusive Upskill Library</span>
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                คลังสมอง <span className="text-amber-500">อัพสกิล</span>
              </h1>
              <p className="text-slate-500 text-sm md:text-lg font-medium">สรุปหนังสือและบทความพรีเมียมคัดมาเพื่อคุณโดยเฉพาะ</p>
            </header>

            {/* --- Ebook Banner --- */}
            {(!user || !isProMember || hasEbookAccess) && (
              <Link href="/ebook" className="flex items-center justify-between gap-4 mb-8 px-5 py-3.5 rounded-2xl border border-white/8 bg-white/4 hover:bg-white/7 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📖</span>
                  <span className="text-sm text-slate-400">อยากอ่านหนังสือรวมบทความเล่มแรก?</span>
                </div>
                {hasEbookAccess ? (
                  <span className="text-xs font-bold text-emerald-400 whitespace-nowrap group-hover:translate-x-0.5 transition-transform">ดาวน์โหลดฟรี (สำหรับ PRO) →</span>
                ) : (
                  <span className="text-xs font-bold text-amber-400 whitespace-nowrap group-hover:translate-x-0.5 transition-transform">โบนัสสำหรับสมาชิก PRO →</span>
                )}
              </Link>
            )}

            {/* --- Categories --- */}
            <div className="relative mb-14">
              <div className="flex gap-3 overflow-x-auto pt-8 pb-8 px-6 no-scrollbar -mt-8 -mb-8 -mx-6">
                {Object.keys(CATEGORY_THEMES).map((cat, index) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-none flex items-center gap-2.5 px-6 py-3.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 border ${activeCategory === cat
                      ? "bg-[#f59e0b] text-black border-[#fbbf24] shadow-[0_10px_30px_rgba(245,158,11,0.4)] scale-105 z-20"
                      : "bg-[#161616] text-zinc-500 border-zinc-800/50 hover:bg-[#1c1c1c] hover:text-zinc-300 hover:border-zinc-700"
                      } ${index === 0 ? "ml-2" : ""}`}
                  >
                    <span className={activeCategory === cat ? "text-black" : "text-zinc-600"}>
                      {CATEGORY_THEMES[cat].icon}
                    </span>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="absolute right-[-24px] top-0 bottom-0 w-20 bg-gradient-to-l from-[#0A0A0A] to-transparent pointer-events-none z-10" />
            </div>

            {/* --- Minimal Status Filters --- */}
            <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar pb-1">
              <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 rounded-full border border-white/5 shrink-0">
                <LayoutGrid size={12} className="text-slate-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Filter</span>
              </div>

              <div className="flex gap-2 shrink-0">
                {[
                  { id: "ทั้งหมด", label: "ทั้งหมด" },
                  { id: "อ่านแล้ว", label: "อ่านแล้ว" },
                  { id: "ยังไม่อ่าน", label: "ยังไม่อ่าน" }
                ].map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setStatusFilter(status.id)}
                    className={`px-4 py-2.5 rounded-full text-[11px] font-bold tracking-wide transition-all duration-300 border shrink-0 min-h-[40px] ${
                      statusFilter === status.id
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                        : "bg-transparent text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-300"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* --- Grid Area --- */}
            <motion.div
              key={activeCategory}
              initial="hidden"
              animate="show"
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredArticles.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="col-span-full py-24 text-center bg-[#111]/30 rounded-[3rem] border border-dashed border-white/10"
                  >
                    <div className="bg-amber-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                      <BookOpen size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">ไม่พบบทความในหมวดนี้</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">ลองเลือกหมวดหมู่ใหม่หรือเปลี่ยนตัวกรองการอ่านดูนะครับ</p>
                    <button
                      onClick={() => { setActiveCategory("ทั้งหมด"); setStatusFilter("ทั้งหมด"); }}
                      className="mt-8 text-amber-500 text-xs font-black uppercase tracking-[0.2em] hover:text-amber-400 transition-colors"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  </motion.div>
                )}
                {filteredArticles.map((article) => {
                  const theme = CATEGORY_THEMES[article.category] || CATEGORY_THEMES["ทั้งหมด"];
                  return (
                    <motion.div
                      key={article.id}
                      variants={cardVariants}
                      layout
                      className="h-full"
                    >
                      <Link href={`/library/${article.slug}`} className="group block h-full">
                        <div className="h-full bg-[#111] p-8 rounded-[2.5rem] border border-white/5 flex flex-col transition-all duration-500 hover:border-amber-500/30 hover:bg-[#151515] relative overflow-hidden shadow-2xl">
                          {readArticles.includes(article.slug) ? (
                            <div className="absolute top-8 right-8 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-[9px] font-black tracking-widest uppercase shadow-sm">
                              <BookMarked size={10} className="fill-emerald-400" /> อ่านแล้ว
                            </div>
                          ) : (
                            <div className="absolute top-8 right-8 flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 text-[9px] font-black tracking-widest uppercase shadow-sm">
                              <Sparkles size={10} className="fill-amber-400" /> +5 XP
                            </div>
                          )}

                          <div className="mb-8 relative">
                            <div className={`w-14 h-14 rounded-2xl ${theme.bgColor} ${theme.borderColor} border flex items-center justify-center ${theme.color} group-hover:scale-110 transition-transform duration-500`}>
                              {theme.icon}
                            </div>
                          </div>

                          <div className="flex-1">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ${theme.color}`}>
                              {article.category} • {(() => {
                                const t = article.readTime?.trim() || '';
                                const m = t.match(/^(\d+)/);
                                if (m && !t.includes('นาที')) return `${m[1]} นาที`;
                                return t;
                              })()}
                            </span>
                            <h2 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
                              {article.title}
                            </h2>
                            <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium line-clamp-2 opacity-80">
                              {article.excerpt}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{article.date}</span>
                            <div className="flex items-center gap-2 text-xs font-black text-amber-500 group-hover:gap-3 transition-all uppercase tracking-tighter">
                              Read Insight <ChevronRight size={14} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* --- Footer --- */}
            <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-24 text-center py-12 border-t border-white/5">
              <Link href={user ? "/dashboard" : "/"} className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-4 rounded-full font-black text-sm transition-all hover:bg-amber-400 hover:scale-105 shadow-[0_20px_40px_rgba(255,255,255,0.05)] uppercase tracking-widest">
                <LayoutGrid size={18} /> {user ? "กลับสู่ DASHBOARD" : "กลับหน้าแรก"}
              </Link>
            </motion.footer>
          </>
        ) : (
          <>
            {/* --- Notes Header --- */}
            <header className="mb-10">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-slate-200 rounded-full text-[10px] font-black mb-6 border border-slate-950 uppercase tracking-[0.2em] shadow-sm">
                <Brain size={14} className="text-slate-400" /> <span>PERSONAL SECOND BRAIN</span>
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight mb-4">
                สมองที่สอง <span className="text-slate-500">จดบันทึก</span>
              </h1>
              <p className="text-slate-500 text-sm md:text-lg font-medium">เก็บบันทึกสรุปหนังสือและไอเดียพัฒนาตัวเอง</p>
            </header>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col md:flex-row gap-8 bg-white rounded-[3rem] border border-slate-200/80 p-6 md:p-8 shadow-[0_30px_70px_rgba(15,23,42,0.06)] min-h-[640px] relative overflow-hidden"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(99, 102, 241, 0.035) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(99, 102, 241, 0.035) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px',
                backgroundColor: '#ffffff'
              }}
            >
              {/* 📁 Left Column: Sidebar List */}
              <div className={`w-full md:w-80 shrink-0 flex flex-col border-r border-slate-100 pr-0 md:pr-6 ${
                mobileNotesView === "list" ? "block" : "hidden md:flex"
              }`}>
              
              {/* Sidebar Header & Add Note Button */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5">
                  🧠 บันทึกสมองที่สอง ({notes.length})
                </h3>
                <button
                  onClick={handleCreateNote}
                  className="flex items-center justify-center gap-1 px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm active:scale-95"
                >
                  <Plus size={12} /> เพิ่มโน้ต
                </button>
              </div>

              {/* Note Search Input */}
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาบันทึกของคุณ..."
                  value={searchNoteQuery}
                  onChange={(e) => setSearchNoteQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:bg-white focus:border-slate-200 focus:outline-none transition-all duration-300"
                />
              </div>

              {/* Filter Category Select (Horizontal scroll of tiny pills) */}
              <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar border-b border-slate-100">
                {["ทั้งหมด", "พัฒนาตัวเอง", "การเงิน & ลงทุน", "ธุรกิจ", "หนังสือ"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterNoteCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 border ${
                      filterNoteCategory === cat
                        ? "bg-slate-900 border-slate-950 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200/60 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Notes List Scroll Container */}
              <div className="flex-1 overflow-y-auto max-h-[480px] pr-1 space-y-2.5 no-scrollbar">
                {notes.filter((n) => {
                  const matchesSearch =
                    (n.title || "").toLowerCase().includes(searchNoteQuery.toLowerCase()) ||
                    (n.content || "").toLowerCase().includes(searchNoteQuery.toLowerCase());
                  const matchesCategory =
                    filterNoteCategory === "ทั้งหมด" || n.category === filterNoteCategory;
                  return matchesSearch && matchesCategory;
                }).length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium text-xs">
                    ไม่มีบันทึกสำหรับตัวกรองนี้
                  </div>
                ) : (
                  notes
                    .filter((n) => {
                      const matchesSearch =
                        (n.title || "").toLowerCase().includes(searchNoteQuery.toLowerCase()) ||
                        (n.content || "").toLowerCase().includes(searchNoteQuery.toLowerCase());
                      const matchesCategory =
                        filterNoteCategory === "ทั้งหมด" || n.category === filterNoteCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map((n) => {
                      const isSelected = selectedNote?.id === n.id;
                      const hasText = n.content && n.content.trim().length > 0;
                      const excerpt = hasText
                        ? n.content.replace(/[#*`_-]/g, "").slice(0, 45) + (n.content.length > 45 ? "..." : "")
                        : "ไม่มีเนื้อหาจดบันทึก...";

                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            handleSelectNote(n);
                          }}
                          className={`group relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "bg-indigo-50/70 border-indigo-200 text-indigo-950 shadow-sm"
                              : "bg-slate-50 hover:bg-slate-100/70 border-slate-200/50 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <div className="pr-6">
                            <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 ${
                              isSelected ? "bg-indigo-200/50 text-indigo-800" : "bg-slate-200 text-slate-600"
                            }`}>
                              {n.category || "พัฒนาตัวเอง"}
                            </span>
                            <h4 className="text-xs font-bold leading-snug line-clamp-1 mb-1">
                              {n.title || "บันทึกที่ไม่มีชื่อ"}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium line-clamp-1 leading-normal">
                              {excerpt}
                            </p>
                            <span className="block text-[8px] text-slate-400 font-bold mt-2 uppercase tracking-wide">
                              {n.updatedAt ? new Date(n.updatedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' }) : "ไม่มีวันที่"}
                            </span>
                          </div>

                          {/* Delete Note Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowDeleteConfirm(n.id);
                            }}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-600 hover:bg-red-50 bg-slate-100 hover:border-red-200 border border-slate-200 rounded-xl p-2 transition-all duration-200 active:scale-95 shadow-sm z-20"
                            title="ลบบันทึก"
                          >
                            <Trash2 size={15} />
                          </button>

                          {/* Delete Confirmation Popup Inline */}
                          {showDeleteConfirm === n.id && (
                            <div className="absolute inset-0 bg-white/95 rounded-2xl z-30 flex items-center justify-center p-3 border border-red-200 shadow-sm gap-2">
                              <span className="text-[9px] font-black text-slate-700">ลบบันทึกไหม?</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteNote(n.id); }}
                                className="px-2 py-1 bg-red-500 text-white rounded text-[8px] font-bold"
                              >
                                ลบ
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(null); }}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[8px] font-bold"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* 📝 Right Column: Main Editor Area */}
            <div className={`flex-1 flex flex-col justify-between ${
              mobileNotesView === "editor" ? "block" : "hidden md:flex"
            }`}>
              {selectedNote ? (
                <>
                  <div className="space-y-4 flex flex-col">
                    {/* Back button for mobile view */}
                    <button
                      onClick={async () => {
                        await deleteCurrentNoteIfEmpty();
                        setMobileNotesView("list");
                      }}
                      className="md:hidden flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold mb-2 active:scale-95 transition-all self-start"
                    >
                      <ArrowRight size={14} className="rotate-180" />
                      <span>กลับสู่รายการบันทึก</span>
                    </button>
                    
                    {/* Header bar of editor (Saving status and Category selector) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      
                      {/* Saving status indication */}
                      <div className="flex items-center gap-2">
                        {isSaving ? (
                          <span className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                            กำลังบันทึกอัตโนมัติ...
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            บันทึกอัตโนมัติเรียบร้อย
                          </span>
                        )}
                      </div>

                      {/* Note Category dropdown select */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">หมวดหมู่โน้ต:</span>
                        <select
                          value={noteCategory}
                          onChange={(e) => setNoteCategory(e.target.value)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg px-2.5 py-1 border border-transparent focus:bg-white focus:border-slate-200 focus:outline-none transition-colors duration-200 cursor-pointer"
                        >
                          <option value="พัฒนาตัวเอง">พัฒนาตัวเอง</option>
                          <option value="หนังสือ">หนังสือ</option>
                          <option value="การเงิน & ลงทุน">การเงิน & ลงทุน</option>
                          <option value="ธุรกิจ">ธุรกิจ</option>
                        </select>
                      </div>
                    </div>

                    {/* Auto-save Hint Banner */}
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-medium">
                      <span>💡</span>
                      <span>โน้ตจะ <strong className="font-black text-slate-700">เซฟอัตโนมัติ</strong> ขณะพิมพ์ สามารถใช้เทมเพลตและ AI สรุปเนื้อหาด้านล่างได้ครับ</span>
                    </div>

                    {/* Note Title Input */}
                    <input
                      type="text"
                      placeholder="หัวข้อบันทึก (เช่น สรุปหนังสือ Atomic Habits)..."
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full text-2xl font-black text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent"
                    />

                    {/* Note Content Textarea */}
                    <textarea
                      placeholder="พิมพ์จดบันทึกความคิด สรุปความรู้ หรือแผนพัฒนาตัวเองที่นี่ได้เลย..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={14}
                      className="w-full bg-transparent text-sm leading-loose text-slate-600 placeholder-slate-400 focus:outline-none resize-none font-medium pr-1 focus:ring-0 min-h-[320px]"
                    />
                  </div>

                  {/* Footer widgets: Stats, Templates and AI actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-4">
                    
                    {/* Segment 1: Templates List (Visually Grouped) */}
                    <div className="flex items-center gap-1.5 flex-wrap bg-slate-50/50 p-2 rounded-xl border border-slate-100/60">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 pl-1">⚡ คัดลอกเทมเพลต:</span>
                      <button
                        onClick={() => handleApplyTemplate("book")}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors duration-200"
                      >
                        📚 สรุปหนังสือ
                      </button>
                      <button
                        onClick={() => handleApplyTemplate("daily")}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors duration-200"
                      >
                        🌅 ทวนบันทึกรายวัน
                      </button>
                      <button
                        onClick={() => handleApplyTemplate("idea")}
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-100 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors duration-200"
                      >
                        💡 ไอเดียแล่น
                      </button>
                    </div>

                    {/* Segment 2: Toolbar actions & stats */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {/* Left side: Note counter */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold">
                          {charCount} ตัวอักษร ({wordCount} คำ)
                        </span>
                      </div>

                      {/* Right side: Copy to clipboard action */}
                      <button
                        onClick={handleCopyToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors duration-200"
                        title="คัดลอกข้อความทั้งหมด"
                      >
                        {copyStatus ? (
                          <>
                            <Check size={11} className="text-green-600" />
                            <span className="text-green-600">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>คัดลอกโน้ต</span>
                          </>
                        )}
                      </button>
                    </div>

                                        {/* Row 2: AI Actions Bar (DeepSeek) */}
                    <div className="flex flex-col gap-2.5 p-3.5 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 rounded-2xl border border-violet-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/10 blur-xl rounded-full pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 z-10">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                            ✨ คุยกับพี่ฟุ้ยช่วยวิเคราะห์
                          </span>
                          {!isProMember && (
                            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 leading-none">
                              <Crown size={8} className="fill-white" />
                              PRO
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold">ผลลัพธ์จะถูกเขียนเพิ่มต่อท้ายบันทึกของคุณอัตโนมัติ</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap z-10 mt-1 w-full sm:w-auto">
                        <button
                          onClick={() => handleCallAi("summarize")}
                          disabled={isAiLoading || !noteContent.trim()}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors duration-200 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {activeAiAction === "summarize" ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <span className="flex items-center gap-1">
                              <span>💡 สรุป 3 ประเด็นโน้ต</span>
                              {!isProMember && <Lock size={10} className="text-violet-500/70" />}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => handleCallAi("coaching")}
                          disabled={isAiLoading || !noteContent.trim()}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border border-transparent rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {activeAiAction === "coaching" ? (
                            <Loader2 size={11} className="animate-spin text-white" />
                          ) : (
                            <span className="flex items-center gap-1">
                              <span>💪 ขอคำแนะนำจากพี่ฟุ้ย</span>
                              {!isProMember && <Lock size={10} className="text-white/70" />}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-slate-400">
                  <div className="w-24 h-24 rounded-full bg-[#f8fafc] flex items-center justify-center text-4xl mb-6 border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                    🧠
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mb-2">พื้นที่สมองที่สอง (Second Brain)</h4>
                  <p className="text-xs text-slate-400 font-medium max-w-sm text-center leading-relaxed mb-10">
                    เก็บบันทึกสรุปหนังสือ ไอเดียสร้างสรรค์ และบทเรียนพัฒนาตัวเอง เพื่อให้สมองจริงพร้อมจดจ่อกับปัจจุบัน
                  </p>

                  {/* 3 Step Guidance Cards (Flex-wrap or row layout on mobile) */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mb-10 px-4 sm:px-0">
                    <div className="flex-1 bg-slate-50/60 p-5 rounded-[1.5rem] border border-slate-100 text-left shadow-sm">
                      <span className="text-2xl mb-2.5 block">📝</span>
                      <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5">1. จดบันทึก / สรุป</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">บันทึกข้อคิดที่ได้เรียนรู้ ความฝัน หรือแผนงาน</p>
                    </div>
                    <div className="flex-1 bg-slate-50/60 p-5 rounded-[1.5rem] border border-slate-100 text-left shadow-sm">
                      <span className="text-2xl mb-2.5 block">⚡</span>
                      <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5">2. ใช้เทมเพลตช่วย</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">กดเลือกเทมเพลตสรุปหนังสือ หรือทบทวนรายวันเพื่อเริ่มทันที</p>
                    </div>
                    <div className="flex-1 bg-slate-50/60 p-5 rounded-[1.5rem] border border-slate-100 text-left shadow-sm">
                      <span className="text-2xl mb-2.5 block">🤖</span>
                      <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5">3. ให้ AI ร่วมคิด</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">สรุปใจความสำคัญ หรือขอคำแนะนำจากโค้ชพี่ฟุ้ย</p>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateNote}
                    className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-[0_10px_25px_rgba(15,23,42,0.15)] active:scale-95 flex items-center gap-2"
                  >
                    + สร้างบันทึกแรก
                  </button>
                </div>
              )}
            </div>

          </motion.div>
        </>
      )}

      </div>
    </div>
  );
}

export default function PremiumLibraryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-amber-500" size={32} />
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">
          กำลังโหลดคลังสมอง... 🧠
        </p>
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}