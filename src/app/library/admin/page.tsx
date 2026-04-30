"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, getDocs, query, orderBy, 
  doc, updateDoc, deleteDoc, writeBatch 
} from "firebase/firestore";
import { mockArticles } from "@/constants/article";
import { Loader2, Plus, Save, Trash2, RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function LibraryAdmin() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [secret, setSecret] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    summary: "",
    category: "พัฒนาตัวเอง",
    readTime: "5 นาที",
    date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
    content: ""
  });

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "articles"), orderBy("id", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }));
      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) fetchArticles();
  }, [isAuthorized]);

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret === "Fuii!3538") {
      setIsAuthorized(true);
    } else {
      alert("รหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleMigrate = async () => {
    if (!confirm("ยืนยันการนำเข้าบทความ Mock ทั้งหมดไปที่ Firestore?")) return;
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      mockArticles.forEach((article) => {
        const docRef = doc(collection(db, "articles"));
        batch.set(docRef, article);
      });
      await batch.commit();
      alert("นำเข้าข้อมูลสำเร็จ!");
      fetchArticles();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการนำเข้า");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const nextId = articles.length > 0 ? Math.max(...articles.map(a => a.id || 0)) + 1 : 1;
      await addDoc(collection(db, "articles"), {
        ...formData,
        id: nextId
      });
      alert("บันทึกบทความสำเร็จ!");
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        summary: "",
        category: "พัฒนาตัวเอง",
        readTime: "5 นาที",
        date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
        content: ""
      });
      fetchArticles();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (firestoreId: string) => {
    if (!confirm("ลบบทความนี้ใช่หรือไม่?")) return;
    try {
      await deleteDoc(doc(db, "articles", firestoreId));
      fetchArticles();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-[#111] border border-white/10 p-8 rounded-3xl shadow-2xl">
          <h1 className="text-2xl font-black mb-6 text-center">Library CMS Admin</h1>
          <form onSubmit={handleAuthorize} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Admin Password" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50 transition-all"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
            <button className="w-full bg-amber-500 text-black font-black py-3 rounded-xl hover:bg-amber-400 transition-all">
              Login to CMS
            </button>
            <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest mt-4">
              Authorized personnel only
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/library" className="flex items-center gap-2 text-slate-500 hover:text-white mb-4 text-xs font-black uppercase tracking-widest transition-colors">
              <ChevronLeft size={16} /> Back to Library
            </Link>
            <h1 className="text-4xl font-black text-white">จัดการคลังสมอง</h1>
            <p className="text-slate-500 mt-2">เพิ่ม/แก้ไข บทความพรีเมียมโดยไม่ต้อง Deploy</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleMigrate}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black hover:bg-white/10 transition-all"
            >
              <RefreshCw size={14} className={isSaving ? "animate-spin" : ""} /> IMPORT MOCK DATA
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Form Section */}
          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
            <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2">
              <Plus size={20} className="text-amber-500" /> เพิ่มบทความใหม่
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">หัวข้อบทความ</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50"
                    placeholder="ใส่ชื่อบทความ..."
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Slug (URL)</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50"
                    placeholder="เช่น let-them-theory"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">หมวดหมู่</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="หนังสือ">หนังสือ</option>
                    <option value="พัฒนาตัวเอง">พัฒนาตัวเอง</option>
                    <option value="การเงิน & ลงทุน">การเงิน & ลงทุน</option>
                    <option value="ธุรกิจ">ธุรกิจ</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">เวลาอ่าน</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50"
                    placeholder="เช่น 5 นาที"
                    value={formData.readTime}
                    onChange={(e) => setFormData({...formData, readTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">วันที่</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">คำโปรย (Excerpt)</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50"
                  placeholder="ข้อความสั้นๆ สำหรับหน้า List..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">สรุปบทความ (Summary)</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50"
                  placeholder="ข้อความสรุปในตอนท้าย (ใช้รับ XP)..."
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">เนื้อหาหลัก (Markdown)</label>
                <textarea 
                  required
                  rows={10}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50 font-mono text-sm"
                  placeholder="เขียนเนื้อหาแบบ Markdown ที่นี่..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> บันทึกและโพสต์บทความ</>}
              </button>
            </form>
          </div>

          {/* List Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-white flex items-center justify-between">
              บทความทั้งหมด ({articles.length})
              <button onClick={fetchArticles} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <RefreshCw size={16} />
              </button>
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-amber-500" size={32} />
              </div>
            ) : (
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 no-scrollbar">
                {articles.map((article) => (
                  <div key={article.firestoreId} className="bg-[#161616] border border-white/5 p-5 rounded-2xl group">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-black bg-white/10 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest">ID: {article.id}</span>
                          <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase tracking-widest">{article.category}</span>
                        </div>
                        <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">{article.title}</h3>
                        <p className="text-[10px] text-slate-500 mt-1">{article.slug}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(article.firestoreId)}
                        className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {articles.length === 0 && (
                  <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                    <p className="text-slate-500 text-sm">ยังไม่มีบทความใน Firestore</p>
                    <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest">กด IMPORT ด้านบนเพื่อดึงข้อมูล Mock</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
