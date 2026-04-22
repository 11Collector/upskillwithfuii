"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { questions } from "@/data/librarySoulsQuestions";
import { calculateMBTI } from "@/lib/librarySoulsScoring";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { BookOpen, ArrowLeft, Sparkles, Quote, Wind, Coffee, Loader2 } from "lucide-react";
import { results } from "@/data/librarySoulsResults";

export default function LibrarySoulsQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = async (value: 'A' | 'B' | 'C') => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: Record<number, 'A' | 'B' | 'C'>) => {
    setIsSubmitting(true);

    // Cinematic Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const mbtiType = calculateMBTI(finalAnswers);
      const resultData = results[mbtiType];
      const user = auth.currentUser;

      if (user) {
        // Save to library_souls sub-collection for better permissions
        await addDoc(collection(db, "users", user.uid, "library_souls"), {
          userId: user.uid,
          type: mbtiType,
          title: resultData.title,
          answers: finalAnswers,
          createdAt: serverTimestamp(),
        });

        // Also update the user's latest tool result for the dashboard
        await setDoc(doc(db, "users", user.uid), {
          lastLibrarySoul: mbtiType,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      // Redirect to a results page (or info page with success state)
      router.push(`/tools/library-of-souls/info?result=${mbtiType}`);
    } catch (error) {
      console.error("Error saving quiz result:", error);
      setIsSubmitting(false);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      router.push("/tools/library-of-souls/info");
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCF8] flex flex-col p-4 md:p-8 relative overflow-hidden text-slate-800">
      {/* Organic Background Elements */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-emerald-50 rounded-full blur-[120px] opacity-60 -z-10" />
      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-teal-50 rounded-full blur-[120px] opacity-60 -z-10" />

      {/* Header */}
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full mb-8 pt-4 z-10">
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBack}
          className="p-3 bg-white/70 backdrop-blur-md rounded-full text-emerald-600 shadow-sm border border-emerald-100"
        >
          <ArrowLeft size={24} />
        </motion.button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2 px-4 py-1.5 bg-emerald-100/50 rounded-full border border-emerald-200/50">
            <BookOpen size={14} className="text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 tracking-[0.2em] uppercase">
              {currentQuestion.dimension} JOURNEY
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((p) => (
              <div
                key={p}
                className={`h-1.5 w-8 rounded-full transition-all duration-500 ${Math.ceil((currentIndex + 1) / 3) >= p ? 'bg-emerald-500 w-12' : 'bg-emerald-200'
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-emerald-50">
          <Coffee size={20} className="text-emerald-500" />
        </div>
      </header>

      {/* Progress Path */}
      <div className="max-w-3xl mx-auto w-full mb-12 relative z-10">
        <div className="h-3 bg-white/50 rounded-full border border-emerald-100 overflow-hidden backdrop-blur-sm shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 relative"
          />
        </div>
        <div className="flex justify-between mt-3 text-emerald-800/60 text-[10px] font-black tracking-widest uppercase">
          <span>Beginning</span>
          <span className="text-emerald-700">Page {currentIndex + 1} / {questions.length}</span>
          <span>End</span>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 mb-20">
        <AnimatePresence mode="wait">
          {!isSubmitting && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-emerald-100 shadow-[0_20px_50px_-15px_rgba(16,185,129,0.1)] max-w-2xl w-full relative"
            >
              <div className="absolute -top-4 -right-4 text-emerald-400 animate-pulse">
                <Sparkles size={32} />
              </div>

              <div className="text-center">
                <div className="mb-6 opacity-20">
                  <Quote size={40} className="mx-auto text-emerald-600" />
                </div>

                <h2 className="text-xl md:text-3xl font-black text-slate-800 mb-10 leading-tight">
                  {currentQuestion.text}
                </h2>

                <div className="grid gap-4">
                  {(['A', 'B', 'C'] as const).map((opt, i) => (
                    <motion.button
                      key={opt}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      whileHover={{ scale: 1.02, backgroundColor: "white" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(opt)}
                      className="group p-5 md:p-6 text-left bg-white/40 border-2 border-emerald-50 rounded-2xl hover:border-emerald-400 hover:shadow-lg transition-all flex items-center justify-between"
                    >
                      <span className="text-sm md:text-lg font-bold text-slate-700 group-hover:text-emerald-900 pr-4">
                        {currentQuestion.options[opt].text}
                      </span>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full border border-emerald-100 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all flex items-center justify-center">
                        <Wind className="text-emerald-400 group-hover:text-white size-4" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/90 z-50 flex flex-col items-center justify-center backdrop-blur-md">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mb-8 p-12 bg-emerald-50 rounded-full"
          >
            <Sparkles size={100} className="text-emerald-500" />
          </motion.div>
          <h3 className="text-2xl md:text-3xl font-black text-emerald-900 text-center px-6">
            สัมผัสรอยแยกของจิตวิญญาณ...<br />
            <span className="text-lg opacity-60 font-bold">กำลังวาดภาพตัวตนของคุณ</span>
          </h3>
          <div className="mt-12">
            <Loader2 size={40} className="animate-spin text-emerald-400" />
          </div>
        </div>
      )}
    </main>
  );
}
