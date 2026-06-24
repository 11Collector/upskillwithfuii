"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Sparkles, Send, CheckCircle2 } from "lucide-react";

interface Reflection {
  id: string;
  question: string;
  answer: string;
  answeredAt: string;
}

interface MementoMoriModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  onSaveSetup: (birthdate: string, expectedAge: number) => Promise<void>;
  onAddReflection: (question: string, answer: string, xpReward: number) => Promise<void>;
}

const STOIC_PROMPTS = [
  "หากวันนี้เป็นวันสุดท้าย เรื่องอะไรที่คุณจะเสียดายที่สุดที่ยังไม่ได้ลงมือทำ?",
  "หากรู้ล่วงหน้าว่าคุณมีเวลาเหลือเพียง 1 ปี คุณจะปรับเปลี่ยนลำดับความสำคัญในชีวิตอย่างไร?",
  "สิ่งใดที่คุณอยากสร้างสรรค์หรือทำเพื่อคนอื่นให้สำเร็จ ก่อนที่จะต้องจากโลกนี้ไป?",
  "คำขอโทษ การให้อภัย หรือคำขอบคุณใดที่คุณยังติดค้างอยู่ในใจ และควรพูดมันในวันนี้?",
  "อะไรคือสิ่งไร้สาระที่คุณกำลังปล่อยให้มันขโมยเวลาชีวิตอันมีค่าของคุณไปในตอนนี้?",
  "หากความตายมาเยือนคุณในคืนนี้ สิ่งที่คุณภูมิใจที่สุดในชีวิตที่ผ่านมาคืออะไร?",
  "ถ้าเลือกได้เพียงเรื่องเดียว คุณอยากให้ผู้คนจดจำคุณในฐานะคนแบบไหน?",
  "คุณกำลังอดทนกับความสัมพันธ์หรือสถานการณ์ที่เป็นพิษ เพียงเพราะกลัวความเปลี่ยนแปลงหรือเปล่า?",
  "อะไรคือสิ่งที่คุณอยากบอกตัวคุณเองในวัยเด็ก หากมองย้อนกลับมาจากจุดสิ้นสุดของชีวิต?",
  "วันนี้คุณได้ใช้เวลากับคนที่รักราวกับว่ามันเป็นวันสุดท้ายแล้วหรือยัง?",
  "ถ้าหากวันพรุ่งนี้ไม่มีจริง งานชิ้นไหนที่คุณอยากทำให้เสร็จในวันนี้ที่สุด?",
  "คุณกำลังใช้ชีวิตตามความคาดหวังของคนอื่น หรือกำลังเดินตามเส้นทางของตัวเอง?",
  "อะไรคือความกลัวที่ขัดขวางคุณไม่ให้ทำตามเป้าหมาย และความกลัวนั้นสำคัญกว่าเวลาชีวิตที่เหลืออยู่จริงหรือ?",
  "หากย้อนเวลากลับไปได้ มีสิ่งใดที่คุณอยากทำต่างไปจากเดิมเพื่อไม่ให้เสียดายในบั้นปลาย?",
  "คุณใช้เวลาในแต่ละวันเพื่อเรียนรู้สิ่งใหม่ๆ หรือเพียงแค่ปล่อยให้เวลาไหลผ่านไปเฉยๆ?",
  "คำว่า 'ชีวิตที่ดี' ในมุมมองของคุณในวันนี้ คืออะไร?",
  "คุณได้กล่าวชื่นชมตัวเองสำหรับความพยายามที่ผ่านมาบ้างแล้วหรือยัง?",
  "สิ่งเล็กๆ น้อยๆ ในวันนี้ที่ทำให้คุณรู้สึกขอบคุณชีวิตมากที่สุดคืออะไร?",
  "หากชีวิตคือการเดินทาง คุณคิดว่าสถานีต่อไปที่คุณต้องการไปถึงคืออะไร?",
  "คุณจะทำอย่างไรหากวันนี้ได้รับโอกาสให้เริ่มใหม่อีกครั้งในเรื่องที่คุณเคยล้มเหลว?",
  "ความโกรธ ความเกลียด หรือความขุ่นเคืองในวันนี้ มีค่าพอที่จะเก็บไว้ไปจนถึงวันสุดท้ายจริงหรือ?",
  "คุณเคยถามตัวเองไหมว่า สิ่งที่คุณกำลังสะสมอยู่ในตอนนี้ (เงินทอง, ชื่อเสียง) จะมีความหมายอะไรในวันสุดท้าย?",
  "หากมีเวลาเหลืออีกไม่มาก คุณยังจะเลือกใช้เวลากับสิ่งบันเทิงหรือโซเชียลมีเดียในปริมาณเท่าเดิมอยู่ไหม?",
  "กิจกรรมใดในชีวิตประจำวันที่ทำให้คุณรู้สึกมีชีวิตชีวาและมีความหมายที่สุด?",
  "คุณกำลังเลื่อนการทำสิ่งที่รักออกไปเพียงเพราะคำว่า 'ไว้พรุ่งนี้' อยู่หรือเปล่า?",
  "หากต้องทิ้งคำแนะนำไว้ให้โลกนี้เพียงข้อเดียว คำแนะนำนั้นจะเขียนว่าอย่างไร?",
  "วันนี้คุณได้ทำประโยชน์หรือสร้างรอยยิ้มให้กับใครบ้างแล้วหรือยัง?",
  "คุณกำลังวิ่งตามความสำเร็จภายนอกจนลืมดูแลความสงบภายในใจตนเองอยู่หรือไม่?",
  "อะไรคือสิ่งที่เมื่อคุณทำแล้ว จะไม่รู้สึกเสียดายเวลาที่เสียไปเลยแม้แต่วินาทีเดียว?",
  "ถ้าต้องสรุปชีวิตตนเองเป็นประโยคสั้นๆ หนึ่งประโยค ประโยคนั้นจะเขียนว่าอย่างไร?"
];

const STOIC_QUOTES = [
  { text: "อย่าใช้ชีวิตเหมือนว่าคุณจะมีชีวิตอยู่ตลอดไป ความตายกำลังเอื้อมมือมาหาคุณ ขณะที่คุณยังมีชีวิตอยู่ จงทำตัวเป็นคนดีเสียตั้งแต่วันนี้", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "เราไม่ได้มีเวลาน้อยหรอก แต่เราใช้เวลานั้นทิ้งขว้างไปต่างหาก", author: "เซเนกา (Seneca)" },
  { text: "จงทำราวกับว่าวันแต่ละวันคือทั้งชีวิตของตนเอง", author: "เซเนกา (Seneca)" },
  { text: "ความตายไม่ใช่เรื่องไกลตัว หรือสิ่งที่น่ากลัวในอนาคต แต่ความตายเกิดขึ้นอยู่ตลอดเวลาในอดีตที่ผ่านพ้นไปแล้วต่างหาก", author: "เซเนกา (Seneca)" },
  { text: "อย่าเพิ่งแน่ใจว่าจะมีวันพรุ่งนี้ จงใช้ชั่วโมงนี้ประหนึ่งมันคือชั่วโมงสุดท้ายของคุณ", author: "เอพิคเตตัส (Epictetus)" },
  { text: "คุณสมควรได้รับสิ่งที่ดีที่สุดแล้ว เหตุใดคุณจึงยังรีรอที่จะทำเพื่อตัวเองอีกล่ะ?", author: "เอพิคเตตัส (Epictetus)" },
  { text: "สิ่งที่ควบคุมได้คือความคิดและการกระทำของเราเอง สิ่งที่ควบคุมไม่ได้คือสิ่งภายนอกทั้งหมด จงปล่อยวางสิ่งหลังและโฟกัสสิ่งแรก", author: "เอพิคเตตัส (Epictetus)" },
  { text: "เวลาชีวิตคือสิ่งมีค่าที่สุดที่เราไม่สามารถซื้อคืนมาได้ แต่เรามักยกมันให้คนอื่นหรือสิ่งไร้สาระไปฟรีๆ อย่างง่ายดาย", author: "เซเนกา (Seneca)" },
  { text: "ไม่มีสิ่งใดเป็นของเรานอกจากเวลาที่เราครอบครองอยู่ในปัจจุบันขณะนี้เท่านั้น", author: "เซเนกา (Seneca)" },
  { text: "จงมีความสุขกับสิ่งที่คุณมี ในขณะที่กำลังลงมือทำงานเพื่อสิ่งที่คุณต้องการ", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "ถ้าหากวันพรุ่งนี้ไม่มีจริง งานชิ้นไหนที่คุณอยากทำให้เสร็จในวันนี้ที่สุด?", author: "เซเนกา (Seneca)" },
  { text: "ไม่ใช่ความตายหรอกที่คนเราควรกลัว แต่การไม่เคยเริ่มต้นใช้ชีวิตต่างหากที่น่ากลัวที่สุด", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "ชีวิตนั้นสั้นเกินกว่าจะไปใส่ใจกับคำพูดหรือความคิดของผู้อื่นเกี่ยวกับตัวเรา", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "สิ่งใดที่ไม่ได้ทำให้สังคมดีขึ้น ก็ไม่ได้ทำให้ตัวคุณดีขึ้นเช่นกัน", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "ความโกรธ ความเกลียด หรือความขุ่นเคืองในวันนี้ มีค่าพอที่จะเก็บไว้ไปจนถึงวันสุดท้ายจริงหรือ?", author: "เซเนกา (Seneca)" },
  { text: "ความสุขของชีวิตขึ้นอยู่กับคุณภาพของความคิดของคุณเอง", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "สิ่งที่ดีที่สุดที่จะตอบโต้ศัตรู คือการไม่ทำตัวเหมือนกับพวกเขา", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "จงจำไว้ว่าชีวิตของเรานั้นสั้นมาก และมีเพียงช่วงเวลานี้เท่านั้นที่เราสามารถควบคุมได้", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "อุปสรรคในการลงมือทำคือตัวผลักดันให้เกิดการกระทำ สิ่งที่ขวางทางอยู่จะกลายเป็นเส้นทางเอง", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "ความทุกข์ส่วนใหญ่ไม่ได้เกิดจากเหตุการณ์ภายนอก แต่เกิดจากวิธีที่เราตีความเหตุการณ์เหล่านั้นต่างหาก", author: "เอพิคเตตัส (Epictetus)" },
  { text: "หากคุณต้องการความสงบใจ จงจำกัดสิ่งที่ตัวคุณต้องทำลงเสียบ้าง", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "จงยินดีกับชีวิต เพราะมันเปิดโอกาสให้คุณรัก ทำงาน เล่น และมองดูดวงดาว", author: "เซเนกา (Seneca)" },
  { text: "ไม่มีใครทำร้ายคุณได้ เว้นแต่คุณจะยอมอนุญาตให้พวกเขาทำในใจคุณเอง", author: "เอพิคเตตัส (Epictetus)" },
  { text: "เวลาชีวิตเปรียบเหมือนแม่น้ำที่ไหลเชี่ยวและไม่มีวันไหลย้อนกลับ จงรีบใช้มันทำสิ่งที่มีความหมาย", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "ความมั่งคั่งที่แท้จริงคือการมีระดับความต้องการที่น้อยลง ไม่ใช่การสะสมทรัพย์สินให้มากขึ้น", author: "เซเนกา (Seneca)" },
  { text: "จงรักในโชคชะตาของตนเอง (Amor Fati) เพราะไม่มีอะไรเกิดขึ้นภายนอกที่เกิดขึ้นโดยปราศจากเหตุผล", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "สิ่งที่เกิดขึ้นกับคุณไม่ได้สำคัญเท่ากับวิธีการที่คุณตอบสนองต่อมัน", author: "เอพิคเตตัส (Epictetus)" },
  { text: "ทุกสิ่งที่เราได้ยินคือความคิดเห็น ไม่ใช่ข้อเท็จจริง ทุกสิ่งที่เราเห็นคือมุมมอง ไม่ใช่ความจริงทั้งหมด", author: "มาร์คุส ออเรลิอุส (Marcus Aurelius)" },
  { text: "จงขอบคุณความยากลำบาก เพราะมันคือโอกาสในการพิสูจน์ความแข็งแกร่งและความอดทนของคุณ", author: "เอพิคเตตัส (Epictetus)" },
  { text: "จงเริ่มใช้ชีวิตตั้งแต่วันนี้ และจงนับว่าวันแต่ละวันแยกกันเป็นหนึ่งชีวิตที่มีคุณค่าในตัวเอง", author: "เซเนกา (Seneca)" }
];

export const MementoMoriModal: React.FC<MementoMoriModalProps> = ({
  isOpen,
  onClose,
  userData,
  onSaveSetup,
  onAddReflection
}) => {
  const [activeTab, setActiveTab] = useState<"countdown" | "reflect" | "history">("countdown");
  
  // Setup fields
  const [birthdate, setBirthdate] = useState("");
  const [expectedAge, setExpectedAge] = useState(80);
  const [isSavingSetup, setIsSavingSetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Reflection fields
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [reflectionAnswer, setReflectionAnswer] = useState("");
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [hasReflectedThisWeek, setHasReflectedThisWeek] = useState(false);

  // Time metrics
  const [daysLived, setDaysLived] = useState<number>(0);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [weeksLived, setWeeksLived] = useState<number>(0);
  const [weeksRemaining, setWeeksRemaining] = useState<number>(0);
  const [percentLived, setPercentLived] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      // Set initial fields from userData
      if (userData?.birthdate) {
        setBirthdate(userData.birthdate);
        setExpectedAge(userData.expectedAge || 80);
        setShowSettings(false);
      } else {
        setBirthdate("");
        setExpectedAge(80);
        setShowSettings(true);
      }

      // Select random prompt on open
      const randomIdx = Math.floor(Math.random() * STOIC_PROMPTS.length);
      setCurrentPromptIndex(randomIdx);
      setReflectionAnswer("");

      // Default tab based on setup state
      setActiveTab("countdown");
    }
  }, [isOpen, userData]);

  useEffect(() => {
    if (!birthdate) return;

    const birth = new Date(birthdate);
    const now = new Date();
    
    const target = new Date(birth);
    target.setFullYear(birth.getFullYear() + expectedAge);

    const timeLivedMs = now.getTime() - birth.getTime();
    const timeRemainingMs = target.getTime() - now.getTime();

    const livedDays = Math.max(0, Math.floor(timeLivedMs / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24)));
    
    setDaysLived(livedDays);
    setDaysRemaining(remainingDays);
    setWeeksLived(Math.floor(livedDays / 7));
    setWeeksRemaining(Math.max(0, Math.floor(remainingDays / 7)));

    const totalDays = expectedAge * 365.25;
    setPercentLived(Math.min(100, Math.max(0, (livedDays / totalDays) * 100)));

    // Check if reflected this week
    if (userData?.mementoReflections && userData.mementoReflections.length > 0) {
      const sorted = [...userData.mementoReflections].sort(
        (a: any, b: any) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime()
      );
      const lastAnswer = new Date(sorted[0].answeredAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      setHasReflectedThisWeek(lastAnswer.getTime() > oneWeekAgo.getTime());
    } else {
      setHasReflectedThisWeek(false);
    }
  }, [birthdate, expectedAge, userData]);

  if (!isOpen) return null;

  const handleSaveSetupClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthdate) {
      alert("กรุณาเลือกวันเกิดของคุณ");
      return;
    }
    setIsSavingSetup(true);
    try {
      await onSaveSetup(birthdate, expectedAge);
      setShowSettings(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSetup(false);
    }
  };

  const handleSaveReflection = async () => {
    if (!reflectionAnswer.trim()) {
      alert("กรุณาเขียนบันทึกความรู้สึกของคุณ");
      return;
    }
    setIsSavingReflection(true);
    try {
      const xpReward = hasReflectedThisWeek ? 0 : 15;
      await onAddReflection(STOIC_PROMPTS[currentPromptIndex], reflectionAnswer, xpReward);
      setReflectionAnswer("");
      setActiveTab("history");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingReflection(false);
    }
  };

  const cyclePrompt = () => {
    setCurrentPromptIndex((prev) => (prev + 1) % STOIC_PROMPTS.length);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-[#F5EFEB] border border-[#E0D5C3] rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.35)] overflow-hidden text-left"
      >
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#8B5A2B]/8 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#D2B48C]/8 blur-[60px] rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-6 md:p-8 pb-4 flex justify-between items-center border-b border-[#E3D9CC]/80">
          <div>
            <h3 className="text-xl font-black text-[#3E2723] flex items-center gap-2">
              <Clock className="text-[#8B5A2B]" size={20} />
              ตกตะกอนความคิด
            </h3>
            <p className="text-xs font-semibold text-[#6F5B4E] mt-1">ระลึกเวลาจำกัด เพื่อโฟกัสสิ่งสำคัญที่สุดของวัน</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full text-[#8C7A6B] hover:text-[#3E2723] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        {userData?.birthdate && (
          <div className="relative z-10 px-6 md:px-8 pt-4 flex gap-2 border-b border-[#E3D9CC]/60 bg-[#F5EFEB]/60 backdrop-blur-md">
            <button
              onClick={() => { setActiveTab("countdown"); setShowSettings(false); }}
              className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "countdown" && !showSettings
                  ? "text-[#8B5A2B] border-[#8B5A2B]"
                  : "text-[#8C7A6B] border-transparent hover:text-[#3E2723]"
              }`}
            >
              นาฬิกาทราย
            </button>
            <button
              onClick={() => { setActiveTab("reflect"); setShowSettings(false); }}
              className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "reflect"
                  ? "text-[#8B5A2B] border-[#8B5A2B]"
                  : "text-[#8C7A6B] border-transparent hover:text-[#3E2723]"
              }`}
            >
              ทบทวนชีวิต
              {!hasReflectedThisWeek && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B] animate-ping" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab("history"); setShowSettings(false); }}
              className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "history"
                  ? "text-[#8B5A2B] border-[#8B5A2B]"
                  : "text-[#8C7A6B] border-transparent hover:text-[#3E2723]"
              }`}
            >
              ประวัติ ({userData.mementoReflections?.length || 0})
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`ml-auto pb-3 text-xs font-bold transition-all cursor-pointer ${
                showSettings ? "text-[#8B5A2B]" : "text-[#8C7A6B] hover:text-[#5C4033]"
              }`}
            >
              ⚙️ ตั้งค่าวันเกิด
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="relative z-10 p-6 md:p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
          
          {/* Settings / Setup View */}
          {showSettings && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSaveSetupClick}
              className="space-y-6"
            >
              <div className="bg-[#FCFAF7] border border-[#E3D9CC] rounded-3xl p-5 md:p-6 space-y-4">
                <h4 className="text-sm font-black text-[#3E2723] flex items-center gap-2">
                  <Calendar size={16} className="text-[#8B5A2B]" />
                  ระบุข้อมูลเพื่อคำนวณเวลาชีวิต
                </h4>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-[#6F5B4E] uppercase tracking-wider">วันเดือนปีเกิด (ค.ศ.)</label>
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-4 py-3 text-sm text-[#3E2723] focus:outline-none focus:border-[#8B5A2B] transition-colors w-full cursor-pointer"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-black text-[#6F5B4E] uppercase tracking-wider">
                        เป้าหมายอายุขัย (ปี)
                      </label>
                      <div className="flex items-center gap-1 bg-[#FAF7F2] border border-[#E0D5C3] rounded-lg px-2 py-1">
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={expectedAge}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) setExpectedAge(val);
                          }}
                          className="w-10 bg-transparent text-right font-black text-xs text-[#8B5A2B] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[10px] font-black text-[#8C7A6B]">ปี</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="120"
                      value={expectedAge > 120 ? 120 : (expectedAge < 50 ? 50 : expectedAge)}
                      onChange={(e) => setExpectedAge(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#8B5A2B]"
                    />
                    <div className="flex justify-between text-[8px] font-bold text-[#8C7A6B] px-0.5">
                      <span>50 ปี</span>
                      <span>80 ปี (เฉลี่ย)</span>
                      <span>120 ปี</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {userData?.birthdate && (
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-3.5 text-xs font-black text-[#5C4033] bg-[#FCFAF7] hover:bg-[#FAF4EC] rounded-full transition-all text-center border border-[#E0D5C3] cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSavingSetup}
                  className="flex-1 py-3.5 text-xs font-black text-white bg-gradient-to-r from-[#8B5A2B] to-[#A0522D] hover:from-[#724a23] hover:to-[#8b4513] rounded-full transition-all text-center disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles size={14} className="animate-pulse" />
                  <span>บันทึกข้อมูลตั้งค่า {!userData?.birthdate && "(+15 XP)"}</span>
                </button>
              </div>
            </motion.form>
          )}

          {/* Active Tab Content */}
          {!showSettings && (
            <AnimatePresence mode="wait">
              {activeTab === "countdown" && (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {/* Lifespan Stats Overview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FCFAF7] border border-[#E3D9CC] p-5 rounded-3xl text-left">
                      <span className="text-[9px] font-black text-[#6F5B4E] uppercase tracking-widest block mb-1">เวลาที่คุณใช้ไปแล้ว</span>
                      <p className="text-2xl font-black text-[#3E2723] mt-1 leading-none">{daysLived.toLocaleString()}</p>
                      <span className="text-[10px] font-bold text-[#6F5B4E] mt-1.5 block">วัน ({weeksLived.toLocaleString()} สัปดาห์)</span>
                    </div>
                    
                    <div className="bg-[#FCFAF7] border border-[#E3D9CC] p-5 rounded-3xl text-left">
                      <span className="text-[9px] font-black text-[#6F5B4E] uppercase tracking-widest block mb-1">เวลาที่เหลืออยู่โดยเฉลี่ย</span>
                      <p className="text-2xl font-black text-[#8B5A2B] mt-1 leading-none">{daysRemaining.toLocaleString()}</p>
                      <span className="text-[10px] font-bold text-[#6F5B4E] mt-1.5 block">วัน ({weeksRemaining.toLocaleString()} สัปดาห์)</span>
                    </div>
                  </div>

                  {/* Visual Progress ring and countdown */}
                  <div className="flex flex-col md:flex-row items-center gap-6 bg-[#FAF6F0] border border-[#E5DEC9] p-6 rounded-[2rem]">
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          fill="transparent"
                          stroke="#EADFCF"
                          strokeWidth="6"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          fill="transparent"
                          stroke="url(#modal-memento-grad-brown)"
                          strokeWidth="8"
                          strokeDasharray="339.29"
                          strokeDashoffset={339.29 - (percentLived / 100) * 339.29}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="modal-memento-grad-brown" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8B5A2B" />
                            <stop offset="100%" stopColor="#D2B48C" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="text-center">
                        <span className="text-2xl font-black text-[#3E2723] leading-none block">{percentLived.toFixed(1)}%</span>
                        <span className="text-[8px] font-black text-[#8C7A6B] uppercase tracking-widest block mt-1">Lived</span>
                      </div>
                    </div>

                    <div className="text-left space-y-2">
                      <h4 className="text-sm font-black text-[#3E2723] flex items-center gap-2">
                        <Clock size={16} className="text-[#8B5A2B]" />
                        ความเร็วชีวิตของคุณ
                      </h4>
                      <p className="text-xs text-[#5C4033] font-medium leading-relaxed">
                        คุณใช้ชีวิตไปแล้วประมาณ <span className="text-[#8B5A2B] font-extrabold">{percentLived.toFixed(1)}%</span> ของอายุขัยคาดหวัง ({expectedAge} ปี) หากคิดเป็นสัปดาห์ คุณเหลือเวลาประมาณ <span className="text-[#8B5A2B] font-extrabold">{weeksRemaining.toLocaleString()} สัปดาห์</span> ในการสร้างสรรค์ ทำสิ่งที่ดีงาม และมีความสุขกับผู้คนรอบข้าง
                      </p>
                    </div>
                  </div>

                  {/* ฤดูกาลของชีวิต (Seasons of Life) */}
                  <div className="bg-[#FCFAF7] border border-[#E3D9CC] p-5 rounded-3xl space-y-4 text-left">
                    <h4 className="text-sm font-black text-[#3E2723] flex items-center gap-2">
                      <Calendar size={16} className="text-[#8B5A2B]" />
                      ฤดูกาลชีวิตของคุณ
                    </h4>
                    
                    {(() => {
                      const age = daysLived / 365.25;
                      const seasons = [
                        { name: "ฤดูใบไม้ผลิ", label: "0-20 ปี: เรียนรู้และเติบโต", icon: "🌱", range: [0, 20], color: "from-green-500/10 to-green-600/5", border: "border-green-200/50" },
                        { name: "ฤดูร้อน", label: "20-40 ปี: สร้างตัวและลุยชีวิต", icon: "☀️", range: [20, 40], color: "from-amber-500/10 to-amber-600/5", border: "border-amber-200/50" },
                        { name: "ฤดูใบไม้ร่วง", label: "40-60 ปี: มั่นคงและตกตะกอน", icon: "🍂", range: [40, 60], color: "from-orange-500/10 to-orange-600/5", border: "border-orange-200/50" },
                        { name: "ฤดูหนาว", label: "60 ปีขึ้นไป: สงบและส่งมรดกชีวิต", icon: "❄️", range: [60, 150], color: "from-blue-500/10 to-blue-600/5", border: "border-blue-200/50" }
                      ];

                      return (
                        <div className="grid grid-cols-2 gap-2.5">
                          {seasons.map((season, idx) => {
                            const isActive = age >= season.range[0] && age < season.range[1];
                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-2xl border transition-all duration-500 flex flex-col justify-between ${
                                  isActive
                                    ? "bg-gradient-to-tr from-[#8B5A2B]/10 to-[#D2B48C]/5 border-[#8B5A2B] shadow-sm scale-[1.02]"
                                    : `bg-slate-500/5 ${season.border} opacity-50`
                                }`}
                              >
                                <div className="flex items-center gap-1.5 justify-between">
                                  <span className="text-xs font-black text-[#3E2723]">{season.name}</span>
                                  <span className="text-sm">{season.icon}</span>
                                </div>
                                <span className="text-[9px] font-bold text-[#6F5B4E] mt-2 block leading-snug">
                                  {season.label}
                                </span>
                                {isActive && (
                                  <span className="inline-block self-start mt-2 px-1.5 py-0.5 bg-[#8B5A2B] text-white text-[7px] font-black uppercase tracking-wider rounded-md">
                                    ช่วงอายุของคุณ
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Stoic Quote of the Day */}
                  {(() => {
                    const today = new Date();
                    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
                    const quote = STOIC_QUOTES[dayOfYear % STOIC_QUOTES.length];

                    return (
                      <div className="relative overflow-hidden bg-gradient-to-tr from-[#FAF5ED] to-[#FCFAF7] border border-[#E5DEC9] p-5 rounded-2xl text-left shadow-sm">
                        <span className="text-[8px] font-black text-[#8B5A2B]/70 tracking-widest uppercase block mb-2">ข้อเตือนใจของวัน (Stoic Wisdom)</span>
                        <p className="text-xs font-semibold text-[#5C4033] leading-relaxed italic">
                          "{quote.text}"
                        </p>
                        <p className="text-[9px] font-black text-[#8B5A2B] mt-2 text-right">
                          — {quote.author}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Action Banner for Reflections */}
                  {!hasReflectedThisWeek && (
                    <div 
                      onClick={() => setActiveTab("reflect")}
                      className="bg-gradient-to-r from-[#FAF2E6] to-[#FCFAF7] border border-[#EADFCF] p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#8B5A2B]/40 transition-all animate-pulse"
                    >
                      <div className="p-2 bg-[#8B5A2B]/10 text-[#8B5A2B] rounded-full shrink-0">
                        <Sparkles size={16} className="animate-pulse" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs font-black text-[#8B5A2B]">เขียนบันทึกทบทวนชีวิตประจำสัปดาห์ของคุณ</p>
                        <p className="text-[10px] text-[#7A5B3D]/80 font-bold mt-0.5">รับรางวัล +15 XP เพื่อสะสมการตกตะกอนความคิด</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "reflect" && (
                <motion.div
                  key="reflect"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6 text-left"
                >
                  <div className="bg-[#FCFAF7] border border-[#E3D9CC] rounded-3xl p-5 md:p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#6F5B4E]">คำถามชวนคิดเพื่อคุณ</span>
                      <button
                        onClick={cyclePrompt}
                        className="text-[10px] font-black text-[#8B5A2B] hover:text-[#734A22] transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        🔄 เปลี่ยนคำถาม
                      </button>
                    </div>

                    <p className="text-base font-black text-[#3E2723] leading-relaxed">
                      "{STOIC_PROMPTS[currentPromptIndex]}"
                    </p>
                    
                    <textarea
                      value={reflectionAnswer}
                      onChange={(e) => setReflectionAnswer(e.target.value)}
                      placeholder="เขียนบันทึกความรู้สึกลึกๆ ความคิด หรือสิ่งที่คุณตระหนักได้ตรงนี้..."
                      className="w-full h-32 bg-[#FAF7F2] border border-[#E0D5C3] rounded-2xl p-4 text-xs font-bold text-[#3E2723] placeholder-[#A09080] focus:outline-none focus:border-[#8B5A2B] transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={handleSaveReflection}
                    disabled={isSavingReflection || !reflectionAnswer.trim()}
                    className="w-full py-4 text-xs font-black text-white bg-gradient-to-r from-[#8B5A2B] to-[#A0522D] hover:from-[#724a23] hover:to-[#8b4513] rounded-full transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Send size={14} />
                    <span>
                      {hasReflectedThisWeek 
                        ? "บันทึกคำตอบลง Timeline" 
                        : "บันทึกและรับ 15 XP ✨"
                      }
                    </span>
                  </button>

                  {hasReflectedThisWeek && (
                    <p className="text-[10px] text-[#8C7A6B] font-bold text-center">
                      * คุณได้รับ XP ในสัปดาห์นี้ไปแล้ว แต่สามารถเขียนบันทึกเพิ่มเติมเพื่อเก็บสติได้ตลอดเวลา
                    </p>
                  )}
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6 text-left"
                >
                  {userData.mementoReflections && userData.mementoReflections.length > 0 ? (
                    <div className="space-y-6 relative pl-4 border-l-2 border-[#E5DEC9] ml-2 py-2">
                      {userData.mementoReflections.map((ref: Reflection, idx: number) => (
                        <div key={ref.id || idx} className="relative space-y-2 group">
                          {/* Dot marker on timeline */}
                          <div className="absolute -left-[25px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#FAF6F0] border-2 border-[#8B5A2B] shadow-md group-hover:bg-[#8B5A2B] transition-colors" />
                          
                          <div className="flex justify-between items-baseline gap-4">
                            <span className="text-[9px] font-black text-[#5C4033] bg-[#EADFCF] px-2 py-0.5 rounded-full border border-[#D2B48C]/40">
                              {new Date(ref.answeredAt).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>

                          <div className="bg-[#FCFAF7] border border-[#E3D9CC] p-4 rounded-2xl">
                            <p className="text-[11px] font-black text-[#8B5A2B] leading-relaxed mb-2">Q: {ref.question}</p>
                            <p className="text-xs font-bold text-[#3E2723] leading-relaxed whitespace-pre-line">"{ref.answer}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <div className="w-14 h-14 bg-[#FCFAF7] border border-[#E5DEC9] rounded-full flex items-center justify-center text-[#8C7A6B] mx-auto shadow-inner">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#3E2723]">ยังไม่มีบันทึกการทบทวน</h4>
                        <p className="text-xs text-[#6F5B4E] mt-1">เริ่มต้นบันทึกความรู้สึกในการระลึกถึงเวลาจำกัด เพื่อเก็บบันทึกของคุณ</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}

        </div>
      </motion.div>
    </div>
  );
};
