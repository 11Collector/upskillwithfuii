"use client";
import { collection, addDoc, serverTimestamp ,doc,setDoc,getDoc,increment} from "firebase/firestore";
import { useState, useRef, useMemo, useEffect } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, RefreshCcw, Camera, AlertTriangle, ArrowLeft, ArrowRight, Loader2, Zap, Info, X, BookOpen, PieChart, Users, MessageCircle, LayoutDashboard
} from "lucide-react"; 
import { toPng } from "html-to-image"; 
import Image from "next/image";
import { Prompt } from "next/font/google";

import { scenarios } from "@/data/moneyScenarios"; 
import { resultData } from "@/data/moneyResult";
import DisclaimerFooter from '@/app/components/DisclaimerFooter';
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth";

// 💡 กำหนดโครงสร้างข้อมูลให้ชัดเจน
interface PersonaScore {
  id: string;
  matchPercentage: number;
}

interface CalculationResult {
  primary: PersonaScore;
  secondary: PersonaScore;
}

const loadingQuotes = [
  { text: "การประสบความสำเร็จทางการเงิน ไม่ได้เกี่ยวกับความฉลาด แต่อยู่ที่ 'พฤติกรรม' ของคุณ", author: "Morgan Housel", book: "The Psychology of Money" },
  { text: "ความมั่งคั่ง คือการมีสินทรัพย์ที่ทำเงินให้คุณ... แม้ในยามที่คุณหลับ", author: "Naval Ravikant", book: "The Almanack of Naval Ravikant" },
  { text: "ตลาดหุ้นคือเครื่องมือ ย้ายเงินจาก 'คนใจร้อน' ไปสู่ 'คนใจเย็น'", author: "Warren Buffett", book: "Legendary Investor" },
  { text: "การเงินส่วนบุคคล เป็นเรื่องของจิตวิทยา 80% และกลไกตัวเลขแค่ 20%", author: "Dave Ramsey", book: "Personal Finance Expert" },
  { text: "เงินก้อนโตไม่ได้เกิดจากการ 'ซื้อๆ ขายๆ' แต่เกิดจากการ 'รอคอย' ให้เป็น", author: "Charlie Munger", book: "Legendary Investor" },
  { text: "คนทั่วไป 'ทำงานเพื่อเงิน' แต่คนรวยสร้างระบบให้ 'เงินทำงาน' แทนพวกเขา", author: "Robert Kiyosaki", book: "Rich Dad Poor Dad" },
  { text: "ทางเลือกเล็กๆ ที่ชาญฉลาด + 'ความสม่ำเสมอ' + เวลา = ผลลัพธ์ที่ยิ่งใหญ่มหาศาล", author: "Darren Hardy", book: "The Compound Effect" },
  { text: "จงวัดความสำเร็จจาก 'สิ่งที่คุณทำได้แล้ว' ไม่ใช่จากช่องว่างของ 'สิ่งที่คุณยังไม่มี'", author: "Dr. Benjamin Hardy", book: "The Gap and The Gain" },
  { text: "กลไกที่สำคัญที่สุดในการลงทุน ไม่ใช่สมอง... แต่คือ 'กระเพาะ' ที่ทนความเหวี่ยงได้", author: "Peter Lynch", book: "Legendary Fund Manager" },
  { text: "ศัตรูตัวฉกาจที่สุดของนักลงทุน... มักจะไม่ใช่ตลาด แต่เป็น 'ตัวของเขาเอง'", author: "Benjamin Graham", book: "The Intelligent Investor" },
  { text: "คุณไม่มีทางไปถึงระดับของเป้าหมายได้ คุณทำได้แค่ร่วงหล่นลงมาสู่ 'ระดับของระบบ' ที่คุณสร้างไว้", author: "James Clear", book: "Atomic Habits" },
  { text: "สิ่งสำคัญไม่ใช่ถูกหรือผิด แต่อยู่ที่ตอนถูกคุณ 'ได้เท่าไหร่' และตอนผิดคุณ 'จำกัดความเสียหาย' ได้แค่ไหน", author: "George Soros", book: "Legendary Investor" },
  { text: "การศึกษาในระบบจะทำให้คุณพอมีกิน แต่การ 'ศึกษาเรียนรู้ด้วยตัวเอง' จะทำให้คุณมั่งคั่ง", author: "Jim Rohn", book: "Business Philosopher" },
  { text: "เป้าหมายไม่ใช่การกอดเงินให้ตายไปพร้อมกัน แต่คือการเปลี่ยนเงินเป็น 'ประสบการณ์ชีวิต' ในเวลาที่เหมาะสม", author: "Bill Perkins", book: "Dying with Zero" },
  { text: "การคิดมากเกินไป (Overthinking) คือจังหวะที่ 'ความกลัว' เข้ามาขวางทาง 'สิ่งที่คุณต้องการ' จริงๆ", author: "Jon Acuff", book: "Soundtracks" },
  { text: "ความเจ็บปวดจากการขาดทุน + 'การทบทวนตัวเอง' = ความก้าวหน้าที่แท้จริง", author: "Ray Dalio", book: "Principles" },
  { text: "ถ้าคุณสร้าง 'สภาวะจิตใจ' ที่ไม่หวั่นไหวไปตามตลาดได้ ความยากลำบากในการลงทุนก็จะหายไป", author: "Mark Douglas", book: "Trading in the Zone" },
  { text: "ความสามารถในการ 'จดจ่อขั้นสุด' (Deep Work) คือทักษะที่มีมูลค่ามหาศาลที่สุด ในยุคที่เต็มไปด้วยสิ่งรบกวน", author: "Cal Newport", book: "Deep Work" },
  { text: "สิ่งที่เสพติดและอันตรายต่ออิสรภาพที่สุดมี 3 อย่าง คือ เฮโรอีน, คาร์โบไฮเดรต และ 'เงินเดือนประจำ'", author: "Nassim Nicholas Taleb", book: "The Bed of Procrustes" },
  { text: "'ความเสี่ยง' คือสิ่งที่หลงเหลืออยู่... หลังจากที่คุณมั่นใจว่า คุณคิดมาดีหมดทุกอย่างแล้ว", author: "Carl Richards", book: "The Behavior Gap" },
  { text: "สิ่งที่สวนกระแสที่สุด ไม่ใช่การทำตัวขวางโลก แต่คือการ 'คิดด้วยหัวของตัวเอง'", author: "Peter Thiel", book: "Zero to One" },
  { text: "การลงทุน ไม่ใช่แค่เรื่องของตัวเลข แต่มันคือจุดตัดระหว่าง 'เศรษฐศาสตร์' และ 'จิตวิทยามนุษย์'", author: "Seth Klarman", book: "Margin of Safety" },
  { text: "ความเจ็บปวดจากการสูญเสียเงิน รุนแรงกว่าความสุขที่ได้เงินจำนวนเท่ากันถึง 'สองเท่า'", author: "Daniel Kahneman", book: "Thinking, Fast and Slow" },
  { text: "ความเสี่ยงที่แท้จริงไม่ใช่ความผันผวนของราคา แต่คือการสูญเสียเงินทุนแบบ 'ถาวร'", author: "Howard Marks", book: "The Most Important Thing" },
  { text: "เงินไม่ใช่แค่ตัวเลข แต่มันคือ 'พลังชีวิต' ที่คุณยอมสละเวลาไปแลกมา", author: "Vicki Robin", book: "Your Money or Your Life" },
  { text: "ความคิดและอารมณ์ของคุณ 'ไม่ใช่ข้อเท็จจริง' เสมอไป โดยเฉพาะเวลาที่เห็นพอร์ตติดลบ", author: "Dr. Julie Smith", book: "Why Has Nobody Told Me This Before?" },
  { text: "ความมั่งคั่งไม่ใช่เกมที่มีจุดจบ แต่คือ 'เกมอนันต์' (Infinite Game) ที่เป้าหมายคือการอยู่รอดให้นานที่สุด", author: "Simon Sinek", book: "The Infinite Game" },
  { text: "เป้าหมายไม่ใช่การทำงานให้หนักที่สุด แต่คือการหา 'คานงัด' ที่สร้างอิสรภาพให้คุณได้เร็วที่สุด", author: "Tim Ferriss", book: "The 4-Hour Workweek" }
];

// --- 1. SETUP & UTILS ---
const promptFont = Prompt({ 
  subsets: ["thai", "latin"], 
  weight: ["300", "400", "500", "600", "700"] 
});

const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// --- 2. LOGIC: CALCULATE PERSONA (PRIMARY & SECONDARY) ---
const profileCenters = [
  { id: "HIGH_RISK_HIGH_DISC", risk: 10, disc: 10 },
  { id: "MID_RISK_HIGH_DISC", risk: 5, disc: 10 },
  { id: "LOW_RISK_HIGH_DISC", risk: 0, disc: 10 },
  { id: "HIGH_RISK_MID_DISC", risk: 10, disc: 5 },
  { id: "MID_RISK_MID_DISC", risk: 5, disc: 5 },
  { id: "LOW_RISK_MID_DISC", risk: 0, disc: 5 },
  { id: "HIGH_RISK_LOW_DISC", risk: 10, disc: 0 },
  { id: "MID_RISK_LOW_DISC", risk: 5, disc: 0 },
  { id: "LOW_RISK_LOW_DISC", risk: 0, disc: 0 },
];

// ใส่ไว้ใต้ const profileCenters = [...] ก็ได้ครับ
const avatarImages: Record<string, string> = {
  "HIGH_RISK_LOW_DISC": "/avatars/phoenix.png",    // กาวสุดกราฟ
  "HIGH_RISK_MID_DISC": "/avatars/monkey.png",     // ล่าเทรนด์(ดอย)
  "HIGH_RISK_HIGH_DISC": "/avatars/wolf.png",      // เซียนระบบ
  "MID_RISK_LOW_DISC": "/avatars/peacock.png",     // ตัวตึงสายเปย์
  "MID_RISK_MID_DISC": "/avatars/capybara.png",    // มนุษย์สมดุล
  "MID_RISK_HIGH_DISC": "/avatars/ant.png",        // นักปั้นพอร์ต
  "LOW_RISK_LOW_DISC": "/avatars/deer.png",        // ผู้ประสบภัย
  "LOW_RISK_MID_DISC": "/avatars/turtle.png",      // สายเซฟโซน
  "LOW_RISK_HIGH_DISC": "/avatars/snail.png",      // พิทักษ์เงินต้น
};

const preloadAvatars = () => {
  // เช็กก่อนว่าอยู่ใน Browser ไหม (ฝั่ง Server จะไม่มี window)
  if (typeof window !== "undefined") {
    Object.values(avatarImages).forEach((src) => {
      // 🟢 เติม window. นำหน้า เพื่อเรียกใช้ Native JS Image Constructor
      const img = new window.Image(); 
      img.src = src;
    });
  }
};

const calculatePersona = (riskScore: number, discScore: number): CalculationResult => {
    const results = profileCenters.map((profile) => {
      const distance = Math.hypot(riskScore - profile.risk, discScore - profile.disc);
      return { id: profile.id, distance, profileRisk: profile.risk, profileDisc: profile.disc };
    });

    results.sort((a, b) => {
      if (a.distance === b.distance) {
        if (a.profileDisc !== b.profileDisc) return a.profileDisc - b.profileDisc; 
        return a.profileRisk - b.profileRisk;
      }
      return a.distance - b.distance;
    });
    
    const maxDist = 14.14;
    const calculateMatch = (dist: number) => Math.max(0, Math.round(((maxDist - dist) / maxDist) * 100));

    return {
      primary: { id: results[0].id, matchPercentage: calculateMatch(results[0].distance) },
      secondary: { id: results[1].id, matchPercentage: calculateMatch(results[1].distance) },
    };
};

// --- 3. DATA & CONSTANTS ---
const personaOptions = [
  { id: "เสี่ย", label: "เสี่ย", emoji: "🤵‍♂️" },
  { id: "ซ้อ", label: "ซ้อ", emoji: "💅" },
  { id: "จารย์", label: "จารย์", emoji: "📚" },
  { id: "ไม่ระบุ", label: "ไม่ระบุ", emoji: "😎" },
];

export const jargonDict = [
  // --- แนวคิดการลงทุนเบื้องต้น ---
  { keywords: ["compound effect", "ทบต้น"], word: "Compound Effect (ดอกเบี้ยทบต้น)", desc: "กลไกที่ผลกำไรถูกนำไปลงทุนทบกับเงินต้นเดิมซ้ำๆ ทำให้ฐานเงินทุนใหญ่ขึ้นแบบทวีคูณเมื่อเวลาผ่านไป" },
  { keywords: ["dca"], word: "DCA (การลงทุนแบบถัวเฉลี่ยต้นทุน)", desc: "กลยุทธ์การทยอยลงทุนด้วยจำนวนเงินที่เท่าๆ กันอย่างสม่ำเสมอ เพื่อถัวเฉลี่ยต้นทุนโดยไม่ใช้การจับจังหวะตลาด" },
  { keywords: ["asset allocation", "กระจายความเสี่ยง"], word: "Asset Allocation (การจัดสรรสินทรัพย์)", desc: "การจัดสรรเงินทุนไปยังกลุ่มสินทรัพย์ที่หลากหลายเพื่อลดความผันผวนของพอร์ต" },
  { keywords: ["passive"], word: "Passive Income (รายได้เชิงรับ)", desc: "รูปแบบการลงทุนหรือรายได้ที่เน้นให้ระบบทำงานแทน โดยลดการใช้แรงงานและเวลาเข้าไปแลกโดยตรง" },
  { keywords: ["cashflow", "กระแสเงินสด"], word: "Cashflow (กระแสเงินสด)", desc: "การไหลเข้าและออกของเงิน การมีกระแสเงินสดบวกหมายถึงรายรับมากกว่ารายจ่าย" },
  { keywords: ["yield"], word: "Yield (ผลตอบแทน)", desc: "อัตราส่วนผลตอบแทนที่เกิดจากการถือครองสินทรัพย์ เช่น เงินปันผลจากหุ้น หรือค่าเช่า" },

  // --- สินทรัพย์และการประเมินมูลค่า ---
  { keywords: ["tech", "เทค"], word: "Tech Stock (หุ้นเทคโนโลยี)", desc: "หุ้นของบริษัทในกลุ่มนวัตกรรม มักเติบโตสูงแต่มีความผันผวนตามกระแสเทคโนโลยี" },
  { keywords: ["growth", "เติบโต"], word: "Growth Stock (หุ้นเติบโต)", desc: "หุ้นที่มีอัตราการขยายตัวของรายได้และกำไรสูงกว่าค่าเฉลี่ยของตลาด" },
  { keywords: ["blue-chip", "บลูชิป"], word: "Blue-chip Stock (หุ้นพื้นฐานดีขนาดใหญ่)", desc: "หุ้นของบริษัทขนาดใหญ่ที่มีฐานะทางการเงินมั่นคงและเป็นผู้นำในอุตสาหกรรม" },
  { keywords: ["index fund", "ดัชนี", "กองทุนดัชนี"], word: "Index Fund (กองทุนรวมดัชนี)", desc: "กองทุนที่ลงทุนเลียนแบบดัชนีตลาด เพื่อให้ได้ผลตอบแทนใกล้เคียงกับภาพรวมตลาด" },
  { keywords: ["reit", "อสังหาฯ"], word: "REIT (กองทุนรวมอสังหาริมทรัพย์)", desc: "กองทุนที่ลงทุนในอสังหาริมทรัพย์เพื่อรับรายได้จากค่าเช่าและนำมาแบ่งเป็นปันผล" },
  { keywords: ["หุ้นกู้"], word: "Corporate Bond (หุ้นกู้)", desc: "ตราสารหนี้ภาคเอกชนที่เราเป็นเจ้าหนี้บริษัท และได้รับผลตอบแทนเป็นดอกเบี้ยตามกำหนด" },
  { keywords: ["พันธบัตร", "ตราสารหนี้"], word: "Bond (พันธบัตร)", desc: "ตราสารหนี้ที่ออกโดยรัฐบาล มีความเสี่ยงต่ำและได้รับดอกเบี้ยสม่ำเสมอ" },
  { keywords: ["mixed fund", "กองทุนผสม"], word: "Mixed Fund (กองทุนผสม)", desc: "กองทุนที่มีนโยบายกระจายการลงทุนในหลายสินทรัพย์พร้อมกันเพื่อรักษาสมดุลความเสี่ยง" },
  { keywords: ["เศษหุ้น"], word: "Fractional Shares (เศษหุ้น)", desc: "ระบบที่ทำให้นักลงทุนซื้อหุ้นได้ด้วยจำนวนเงินตามต้องการ ไม่ต้องซื้อเต็มหุ้น" },
  { keywords: ["ipo"], word: "IPO (หุ้นเสนอขายครั้งแรก)", desc: "การเสนอขายหุ้นของบริษัทต่อประชาชนทั่วไปเป็นครั้งแรกเพื่อเข้าตลาดหลักทรัพย์" },
  { keywords: ["hard assets", "สินทรัพย์คงทน"], word: "Hard Assets (สินทรัพย์คงทน)", desc: "สินทรัพย์ที่มีมูลค่าในตัวเองและทนทานต่อเงินเฟ้อ เช่น ทองคำ อสังหาริมทรัพย์ หรือ Bitcoin" },
  { keywords: ["art toy", "ของสะสม", "สินทรัพย์ทางเลือก"], word: "Alternative Assets (สินทรัพย์ทางเลือก)", desc: "การลงทุนในสิ่งของนอกเหนือจากตลาดเงินทุนปกติ เช่น ของเล่นสะสม งานศิลปะ หรือนาฬิกาหรู" },

  // --- กลยุทธ์และการซื้อขาย ---
  { keywords: ["time in the market"], word: "Time in the Market (ระยะเวลาลงทุน)", desc: "แนวคิดการเน้นระยะเวลาถือครองสินทรัพย์ที่ยาวนานเพื่อให้เงินทำงาน แทนการกะจังหวะซื้อขาย" },
  { keywords: ["ปันผล"], word: "Dividend (เงินปันผล)", desc: "ผลกำไรส่วนหนึ่งที่บริษัทแบ่งจ่ายให้กับผู้ถือหุ้นตามสัดส่วนที่ถือครอง" },
  { keywords: ["ทำกำไร", "profit run"], word: "Take Profit / Let Profit Run (ทำกำไร / ปล่อยกำไรวิ่ง)", desc: "การขายเมื่อได้กำไรตามเป้า หรือการถือต่อเพื่อให้กำไรเติบโตไปเรื่อยๆ" },
  { keywords: ["cut loss", "คัทลอส", "ตัดขาดทุน"], word: "Cut Loss (ตัดขาดทุน)", desc: "การตัดสินใจขายสินทรัพย์ในราคาที่ต่ำกว่าทุนเพื่อจำกัดความเสียหายไม่ให้พอร์ตพัง" },
  { keywords: ["rebalance", "ปรับสมดุล"], word: "Rebalancing (การปรับสมดุลพอร์ต)", desc: "การปรับสัดส่วนพอร์ตให้กลับมาตามแผนที่ตั้งไว้ เช่น ขายตัวที่กำไรเยอะไปซื้อตัวที่สัดส่วนลดลง" },
  { keywords: ["คานงัด", "leverage"], word: "Leverage (คานงัด)", desc: "เครื่องมือทวีคูณผลลัพธ์ เช่น การกู้ยืมมาลงทุน หรือการใช้เทคโนโลยีมาช่วยสเกลรายได้" },
  { keywords: ["สวิงเทรด", "เล่นรอบ"], word: "Swing Trade (เทรดทำกำไรเป็นรอบ)", desc: "กลยุทธ์การเก็งกำไรระยะสั้นถึงกลาง โดยอาศัยจังหวะการแกว่งตัวของราคาเป็นรอบๆ" },
  { keywords: ["options"], word: "Options (สัญญาออปชัน)", desc: "เครื่องมือทางการเงินที่ให้สิทธิในการซื้อหรือขายสินทรัพย์ในอนาคตตามราคาที่ตกลงกันไว้" },
  { keywords: ["arbitrage"], word: "Arbitrage (ทำกำไรส่วนต่างไร้ความเสี่ยง)", desc: "การทำกำไรจากส่วนต่างของราคาสินทรัพย์ชนิดเดียวกันในสองตลาดที่ต่างกัน" },
  { keywords: ["day trade"], word: "Day Trade (เทรดรายวัน)", desc: "รูปแบบการเก็งกำไรที่เน้นการซื้อและขายจบภายในวันเดียว" },
  { keywords: ["all-in"], word: "All-in (ทุ่มหมดตัว)", desc: "การทุ่มเงินทุนทั้งหมดที่มีลงไปในสินทรัพย์เดียวหรือครั้งเดียว" },
  { keywords: ["hedging"], word: "Hedging (การป้องกันความเสี่ยง)", desc: "การใช้เครื่องมือทางการเงินเพื่อป้องกันหรือลดความเสี่ยงจากการเคลื่อนไหวของราคาที่สวนทาง" },

  // --- คริปโตเคอร์เรนซี ---
  { keywords: ["btc", "bitcoin"], word: "BTC (Bitcoin)", desc: "สกุลเงินดิจิทัลที่มีจำนวนจำกัด มักถูกเรียกว่าเป็นทองคำดิจิทัลเพื่อใช้รักษามูลค่าเงินในระยะยาว" },
  { keywords: ["คริปโต", "มีม", "เหรียญมีม"], word: "Cryptocurrency (คริปโตเคอร์เรนซี)", desc: "สินทรัพย์ดิจิทัลที่ทำงานบนบล็อกเชน รวมถึงเหรียญที่เกิดจากกระแสโซเชียลที่มีความผันผวนสูง" },

  // --- พฤติกรรมและจิตวิทยา ---
  { keywords: ["panic sell"], word: "Panic Sell (ตื่นตระหนกเทขาย)", desc: "สภาวะการเทขายสินทรัพย์ด้วยความตื่นตระหนกจากข่าวลือหรือตลาดที่ร่วงแรง" },
  { keywords: ["yield trap", "กับดักปันผล"], word: "Yield Trap (กับดักปันผล)", desc: "หุ้นที่ดูเหมือนปันผลสูงมาก แต่จริงๆ แล้วเกิดจากราคาหุ้นที่ร่วงหนักเพราะพื้นฐานธุรกิจพัง" },
  { keywords: ["xd"], word: "XD (เครื่องหมายงดจ่ายปันผล)", desc: "วันที่ผู้ซื้อหุ้นจะไม่มีสิทธิได้รับเงินปันผลในรอบนั้น" },
  { keywords: ["black swan"], word: "Black Swan (เหตุการณ์รุนแรงที่ไม่คาดฝัน)", desc: "เหตุการณ์ที่ไม่มีใครคาดคิด โอกาสเกิดน้อยมาก แต่ส่งผลกระทบรุนแรงต่อตลาด" },
  { keywords: ["bear market"], word: "Bear Market (ตลาดหมี)", desc: "สภาวะตลาดขาลงที่ซึมเซาและมีแรงขายต่อเนื่องยาวนาน" },
  { keywords: ["all-time high", "new high"], word: "All-Time High (จุดสูงสุดเป็นประวัติการณ์)", desc: "จุดสูงสุดของราคาที่สินทรัพย์นั้นๆ เคยทำได้ในประวัติศาสตร์" },
  { keywords: ["sunk cost"], word: "Sunk Cost Fallacy (อคติต้นทุนจม)", desc: "อคติที่ทำให้เราไม่ยอมเลิกทำสิ่งเดิมเพราะเสียดายเงินหรือเวลาที่จ่ายไปแล้ว" },
  { keywords: ["anchoring"], word: "Anchoring Bias (อคติการยึดติด)", desc: "อคติการยึดติดกับข้อมูลชุดแรกที่เห็น เช่น ยึดติดกับราคาที่เคยขึ้นไปสูงสุดในอดีต" },
  { keywords: ["revenge trading", "เทรดแก้มือ"], word: "Revenge Trading (เทรดล้างแค้น)", desc: "สภาวะอารมณ์ที่พยายามเทรดเพื่อเอาเงินที่เพิ่งขาดทุนไปกลับคืนมาให้เร็วที่สุด" },
  { keywords: ["lifestyle creep", "กับดักความสุข"], word: "Lifestyle Creep (กับดักไลฟ์สไตล์)", desc: "ปรากฏการณ์ที่ค่าใช้จ่ายขยับตัวสูงขึ้นตามรายได้ที่เพิ่มขึ้น ทำให้หาเงินได้เยอะแต่ไม่มีเงินเหลือเก็บ" },
  { keywords: ["loss aversion", "กลัวขาดทุน"], word: "Loss Aversion (อคติเกลียดความสูญเสีย)", desc: "อคติที่มนุษย์จะรู้สึกเจ็บปวดจากการสูญเสีย มากกว่ารู้สึกดีใจเมื่อได้รับกำไรในจำนวนที่เท่ากัน" },
  { keywords: ["comfort zone trap", "พื้นที่ปลอดภัย"], word: "Comfort Zone Trap (กับดักพื้นที่ปลอดภัย)", desc: "การยึดติดกับความสบายใจจนไม่กล้ารับความเสี่ยงเพิ่ม ซึ่งอาจทำให้เสียโอกาสสร้างความมั่งคั่ง" },
  { keywords: ["over-optimization", "สูตรสำเร็จ"], word: "Over-Optimization (การปรับแต่งระบบมากเกินไป)", desc: "การพยายามปรับจูนระบบให้สมบูรณ์แบบเกินไปจนยึดติดกับอดีตและไม่เผื่อใจให้ความไม่แน่นอน" },
  { keywords: ["relative wealth envy", "ริษยา"], word: "Relative Wealth Envy (ความริษยาเปรียบเทียบ)", desc: "สภาวะจิตใจที่รู้สึกกดดันเมื่อเห็นคนอื่นได้รับผลตอบแทนที่สูงกว่าในระยะเวลาอันสั้น" },
  { keywords: ["degen", "กาว"], word: "Degen (นักลงทุนสายกาว)", desc: "ศัพท์แสลงใช้เรียกนักลงทุนที่ชอบความเสี่ยงสูงมากเหมือนการเดิมพัน โดยไม่สนปัจจัยพื้นฐาน" },

  // --- การเงินส่วนบุคคลและไลฟ์สไตล์ ---
  { keywords: ["fire", "เกษียณไว"], word: "FIRE Movement (แนวคิดเกษียณเร็ว)", desc: "แนวคิดการออมและลงทุนอย่างหนักเพื่อเป้าหมายอิสรภาพทางการเงินก่อนวัยเกษียณ" },
  { keywords: ["สำรองฉุกเฉิน"], word: "Emergency Fund (เงินสำรองฉุกเฉิน)", desc: "เงินที่แยกไว้เพื่อใช้ยามจำเป็นจริงๆ เช่น ป่วยกะทันหัน หรือตกงาน" },
  { keywords: ["pay yourself first"], word: "Pay Yourself First (จ่ายให้ตัวเองก่อน)", desc: "หลักการหักเงินไปลงทุนทันทีที่รายได้เข้า ก่อนจะนำไปใช้จ่ายส่วนอื่น" },
  { keywords: ["สนามแข่งหนู"], word: "Rat Race (สนามแข่งหนู)", desc: "วงจรชีวิตวัยทำงานที่ต้องทำงานหาเงินเพื่อจ่ายหนี้และค่าใช้จ่ายวนไปไม่จบสิ้น" },
  { keywords: ["ภาษีสังคม"], word: "Social Tax (ภาษีสังคม)", desc: "ค่าใช้จ่ายที่เกิดจากการเข้าสังคม เช่น ใส่ซองงานแต่งหรืองานบวช" },
  { keywords: ["play money"], word: "Play Money (เงินซื้อความสุข)", desc: "เงินงบประมาณที่ตั้งไว้สำหรับซื้อความสุขหรือลงทุนเสี่ยงๆ โดยเฉพาะ" },
  { keywords: ["e-saving"], word: "e-Saving (บัญชีเงินฝากดิจิทัล)", desc: "บัญชีเงินฝากดิจิทัลที่มักให้ดอกเบี้ยสูงกว่าบัญชีออมทรัพย์ปกติ" },
  { keywords: ["ลดหย่อนภาษี", "rmf", "ssf", "กองทุนลดหย่อนภาษี"], word: "Tax Deduction (สิทธิลดหย่อนภาษี)", desc: "การใช้สิทธิประโยชน์ทางภาษีผ่านการลงทุนในกองทุนต่างๆ ตามเงื่อนไขของรัฐ" },
  { keywords: ["refinance"], word: "Refinance (รีไฟแนนซ์)", desc: "การขอลดดอกเบี้ยสินเชื่อบ้านโดยการย้ายธนาคารหรือปรับสัญญาใหม่" },
  { keywords: ["floating rate"], word: "Floating Rate (ดอกเบี้ยลอยตัว)", desc: "อัตราดอกเบี้ยแบบลอยตัวที่ปรับขึ้นลงตามประกาศนโยบายการเงิน" },
  { keywords: ["subscription"], word: "Subscription (บริการแบบสมัครสมาชิก)", desc: "โมเดลการจ่ายค่าบริการรายเดือน เช่น แอปสตรีมมิ่งต่างๆ" },
  { keywords: ["flip"], word: "Flip (ซื้อมาขายไปทำกำไรเร็ว)", desc: "การซื้อสินทรัพย์และขายเปลี่ยนมืออย่างรวดเร็วเพื่อทำกำไรส่วนต่าง" },
  { keywords: ["จ่ายขั้นต่ำ"], word: "Minimum Payment (การจ่ายขั้นต่ำ)", desc: "การจ่ายหนี้บัตรเครดิตเพียงบางส่วน ซึ่งจะนำไปสู่ภาระดอกเบี้ยทบต้นฝั่งรายจ่าย" },
  { keywords: ["โปะหนี้"], word: "Debt Repayment (การโปะหนี้)", desc: "การจ่ายเงินคืนหนี้เกินกว่ายอดขั้นต่ำเพื่อลดเงินต้นและประหยัดดอกเบี้ยในระยะยาว" },

  // --- ทักษะและธุรกิจ ---
  { keywords: ["specific knowledge", "ความรู้เฉพาะทาง"], word: "Specific Knowledge (ความรู้เฉพาะทาง)", desc: "ทักษะเฉพาะตัวที่เลียนแบบยาก ซึ่งสร้างมูลค่าได้มหาศาลในตลาดแรงงานยุคใหม่" },
  { keywords: ["สร้างตัวตน", "personal branding"], word: "Personal Branding (การสร้างแบรนด์บุคคล)", desc: "การสร้างภาพลักษณ์และความเชื่อถือในตัวเองผ่านสื่อเพื่อให้คนจดจำความเชี่ยวชาญของเรา" },
  { keywords: ["affiliate"], word: "Affiliate (การตลาดแบบนายหน้า)", desc: "การตลาดแบบนายหน้าที่เราได้รับค่าคอมมิชชันจากการแนะนำสินค้าให้ผู้อื่นซื้อ" },
  { keywords: ["นิติบุคคล"], word: "Legal Entity (นิติบุคคล)", desc: "การจดทะเบียนบริษัทเพื่อแยกสถานะทางการเงินและภาษีออกจากบุคคลธรรมดา" },
  { keywords: ["หนังสือชี้ชวน"], word: "Prospectus (หนังสือชี้ชวน)", desc: "เอกสารข้อมูลสำคัญของบริษัทและความเสี่ยงที่นักลงทุนต้องศึกษาก่อนตัดสินใจ" },
  { keywords: ["family office"], word: "Family Office (สำนักงานจัดการทรัพย์สินครอบครัว)", desc: "หน่วยงานบริหารจัดการความมั่งคั่งและมรดกสำหรับครอบครัวระดับมหาเศรษฐี" },
  { keywords: ["แชร์ลูกโซ่"], word: "Ponzi Scheme (แชร์ลูกโซ่)", desc: "การหลอกลวงที่นำเงินจากคนใหม่มาจ่ายคนเก่า โดยไม่มีการทำธุรกิจจริง" },
  { keywords: ["fed"], word: "FED (ธนาคารกลางสหรัฐฯ)", desc: "ธนาคารกลางสหรัฐฯ ผู้กำหนดทิศทางดอกเบี้ยโลก" },
  { keywords: ["automation", "ระบบอัตโนมัติ"], word: "Automation (ระบบอัตโนมัติ)", desc: "การใช้เทคโนโลยีหรือโค้ดมาทำงานแทนเราแบบต่อเนื่องตามเงื่อนไขที่ตั้งไว้" },
  { keywords: ["ai", "เอไอ"], word: "AI (ปัญญาประดิษฐ์)", desc: "ปัญญาประดิษฐ์ที่ช่วยวิเคราะห์ข้อมูลและทำงานทุ่นแรงมนุษย์" },
  { keywords: ["agi"], word: "AGI (ปัญญาประดิษฐ์ทั่วไป)", desc: "AI ขั้นสูงที่มีความสามารถรอบด้านเทียบเท่าหรือเหนือกว่ามนุษย์" },

  // --- พัฒนาตนเองและปรัชญา ---
  { keywords: ["deep work"], word: "Deep Work (การทำงานแบบจดจ่อขั้นสุด)", desc: "การทำงานแบบจดจ่อขั้นสุดโดยตัดสิ่งรบกวน เพื่อสร้างผลงานที่มีคุณภาพสูง" },
  { keywords: ["the gap and the gain"], word: "The Gap & The Gain (โฟกัสความก้าวหน้า)", desc: "แนวคิดการวัดความสำเร็จจากความก้าวหน้าที่ทำได้แล้ว (Gain) แทนการมองแต่สิ่งที่ขาด (Gap)" },
  { keywords: ["soundtracks"], word: "Soundtracks (เสียงในหัว)", desc: "เสียงในหัวหรือความเชื่อซ้ำๆ ที่ส่งผลต่อการตัดสินใจและพฤติกรรมในชีวิต" },
  { keywords: ["wheel of life", "วงล้อชีวิต"], word: "Wheel of Life (วงล้อชีวิต)", desc: "เครื่องมือประเมินความสมดุลของชีวิตในมิติต่างๆ เช่น การเงิน สุขภาพ และความสัมพันธ์" },
  { keywords: ["dying with zero"], word: "Dying with Zero (ตายไปพร้อมกับเงินศูนย์บาท)", desc: "แนวคิดการใช้เงินซื้อประสบการณ์ชีวิตในจังหวะที่เหมาะสม แทนการเก็บเงินไว้จนวันตาย" },
  { keywords: ["ubi"], word: "UBI (รายได้พื้นฐานถ้วนหน้า)", desc: "แนวคิดสวัสดิการที่รัฐแจกเงินพื้นฐานให้ทุกคนอย่างเท่าเทียม" },
  { keywords: ["10 เด้ง"], word: "10-Bagger (หุ้น 10 เด้ง)", desc: "การลงทุนที่มูลค่าเติบโตขึ้นเป็น 10 เท่าจากเงินต้น" },
  { keywords: ["กงสี"], word: "Family Business (ระบบกงสี)", desc: "ระบบการเงินส่วนรวมของครอบครัวที่ใช้ดูแลสมาชิกทุกคน" },
  { keywords: ["burnout", "หมดไฟ"], word: "Burnout Syndrome (ภาวะหมดไฟ)", desc: "ภาวะเหนื่อยล้าทางอารมณ์และจิตใจจากการทำงานหนักเกินไป" },
  { keywords: ["อัปสกิล", "skill up", "upskill"], word: "Upskill (การอัปสกิล)", desc: "การลงทุนพัฒนาทักษะใหม่ๆ เพื่อเพิ่มขีดความสามารถในการหารายได้" },

  // --- หมวด: รูปแบบการเกษียณ (FIRE Movement) ---
  { keywords: ["coast fire"], word: "Coast FIRE (เกษียณเร็วแบบลดเกียร์)", desc: "การมีเงินเก็บลงทุนสะสมมากพอที่ปล่อยให้ดอกเบี้ยทำงานดูแลตัวเองไปจนเกษียณได้ ทำให้สามารถเลือกทำงานที่รักได้โดยไม่ต้องกังวลเรื่องเงินอีกต่อไป" },
  { keywords: ["fat fire"], word: "Fat FIRE (เกษียณแบบมั่งคั่ง)", desc: "เป้าหมายการเกษียณด้วยพอร์ตลงทุนขนาดใหญ่มาก ทำให้สามารถใช้ชีวิตหรูหรา ซื้อความสุข และเปย์ไลฟ์สไตล์ได้เต็มที่หลังเกษียณ" },

  // --- หมวด: คำศัพท์สายเทรด & คริปโต ---
  { keywords: ["ดอย", "ติดดอย"], word: "Holding the Bag (ติดดอย)", desc: "สถานการณ์ที่ซื้อสินทรัพย์ในราคาสูง แล้วต่อมาราคาร่วงลงมาอย่างหนัก ทำให้ขายไม่ได้เพราะจะขาดทุนยับเยิน" },
  { keywords: ["ช้อน", "ช้อนซื้อ"], word: "Buy the Dip (ช้อนซื้อ)", desc: "การเข้าไปซื้อสินทรัพย์ในช่วงที่ราคาร่วงหรือตกต่ำลงมา โดยหวังว่าราคาจะปรับตัวเด้งขึ้นไปในอนาคต" },
  { keywords: ["short", "แทงลง"], word: "Short (แทงลง)", desc: "กลยุทธ์ทำกำไรในตลาดขาลง โดยยืมสินทรัพย์มาขายก่อนในราคาสูง แล้วค่อยซื้อคืนในราคาต่ำเพื่อทำกำไรส่วนต่าง" },
  { keywords: ["margin", "มาร์จิ้น"], word: "Margin (มาร์จิ้น)", desc: "การกู้ยืมเงินจากโบรกเกอร์มาซื้อสินทรัพย์หรือเก็งกำไร เพื่อเพิ่มอำนาจซื้อให้ได้ผลตอบแทนสูงขึ้น (แต่ก็เสี่ยงสูงขึ้นเช่นกัน)" },
  { keywords: ["แนวรับ", "แนวต้าน", "โซนรับ"], word: "Support & Resistance (แนวรับ-แนวต้าน)", desc: "ระดับราคาในกราฟทางเทคนิคที่คาดว่าราคาจะตกลงมาแล้วเด้งกลับ (แนวรับ) หรือขึ้นไปชนแล้วร่วงลง (แนวต้าน)" },
  { keywords: ["trading plan", "แผนการเทรด"], word: "Trading Plan (แผนการเทรด)", desc: "แผนการที่วางไว้ล่วงหน้าอย่างเป็นระบบ ว่าจะเข้าซื้อสินทรัพย์จุดไหน ตัดขาดทุน (Cut loss) ตรงไหน และทำกำไรที่ราคาใด" },

  // --- หมวด: เศรษฐศาสตร์ & การเงินพื้นฐาน ---
  { keywords: ["เงินเฟ้อ", "inflation"], word: "Inflation (เงินเฟ้อ)", desc: "ภาวะที่ราคาสินค้าและบริการทั่วไปเพิ่มสูงขึ้นเรื่อยๆ ทำให้มูลค่าและอำนาจการซื้อของเงินในกระเป๋าลดลง" },
  { keywords: ["สภาพคล่อง", "liquidity"], word: "Liquidity (สภาพคล่อง)", desc: "ความสามารถในการเปลี่ยนสินทรัพย์ให้เป็นเงินสดได้อย่างรวดเร็ว รวมถึงการมีเงินสดหมุนเวียนเพียงพอต่อค่าใช้จ่าย" },
  { keywords: ["ค่าเสื่อม", "depreciation"], word: "Depreciation (ค่าเสื่อมราคา)", desc: "การลดลงของมูลค่าสินทรัพย์เมื่อเวลาผ่านไปหรือจากการใช้งาน เช่น รถยนต์ อุปกรณ์อิเล็กทรอนิกส์" },
  { keywords: ["ตลาดเกิดใหม่", "emerging market"], word: "Emerging Market (ตลาดเกิดใหม่)", desc: "ตลาดทุนในประเทศที่กำลังพัฒนาเศรษฐกิจ ซึ่งมีโอกาสเติบโตสูงแต่ก็มีความเสี่ยงจากความผันผวนสูงเช่นกัน" },
  { keywords: ["วัฏจักร", "cycle"], word: "Market Cycle (วัฏจักรตลาด)", desc: "รอบการเคลื่อนไหวของตลาดเศรษฐกิจหรือราคาสินทรัพย์ ที่มักเกิดสลับกันไประหว่างช่วงเติบโตและช่วงหดตัว" },

  // --- หมวด: ธุรกิจ & การจัดการหนี้ ---
  { keywords: ["จุดคุ้มทุน", "break-even"], word: "Break-even Point (จุดคุ้มทุน)", desc: "จุดที่รายได้จากการทำธุรกิจหรือการลงทุน มีมูลค่าเท่ากับต้นทุนที่ลงไปพอดี (ไม่ขาดทุนและไม่ได้กำไร)" },
  { keywords: ["outsource"], word: "Outsource (การจ้างคนนอก)", desc: "การจ้างบุคคลหรือหน่วยงานภายนอกให้มาทำงานแทน เพื่อประหยัดเวลาและให้เราโฟกัสกับงานส่วนอื่นที่ถนัดกว่าได้" },
  { keywords: ["ประนอมหนี้"], word: "Debt Restructuring (การประนอมหนี้)", desc: "การเจรจากับเจ้าหนี้เพื่อขอปรับเปลี่ยนเงื่อนไขการชำระหนี้ เช่น ขอยืดเวลา หรือลดดอกเบี้ย เพื่อให้สามารถผ่อนจ่ายต่อได้ไหว" },
  { keywords: ["ประกันสะสมทรัพย์"], word: "Endowment Insurance (ประกันสะสมทรัพย์)", desc: "ประกันชีวิตรูปแบบหนึ่งที่เน้นการออมเงินควบคู่กับความคุ้มครอง โดยจะได้เงินก้อนคืนพร้อมผลตอบแทนเมื่อครบสัญญา" },

  // --- หมวด: จิตวิทยา & เหตุการณ์ ---
  { keywords: ["fomo"], word: "FOMO (อาการกลัวตกรถ)", desc: "อาการกลัวตกรถหรือพลาดโอกาสทำกำไรเมื่อเห็นคนอื่นได้เงิน ทำให้รีบตัดสินใจกระโดดเข้าไปลงทุนด้วยอารมณ์" },
  { keywords: ["black monday"], word: "Black Monday (วันจันทร์ทมิฬ)", desc: "เหตุการณ์ประวัติศาสตร์ที่ตลาดหุ้นทั่วโลกร่วงลงอย่างรุนแรงในวันจันทร์ มักใช้เปรียบเปรยถึงวันที่ตลาดพังยับเยิน" }
];

export const levelMapping = {
  // Level 1: พื้นฐานการเอาตัวรอด, นิสัยการเงิน, และการจัดการกิเลส (34 ข้อ)
  level1: [
    8, 9, 11, 13, 14, 15, 18, 21, 24, 32, 
    33, 36, 39, 41, 43, 45, 47, 49, 50, 51, 
    52, 53, 54, 56, 67, 68, 69, 70, 76, 77, 
    79, 81, 95, 100
  ],

  // Level 2: โลกการลงทุน, การประเมินโอกาส, และการรับมือความผันผวน (33 ข้อ)
  level2: [
    1, 2, 3, 4, 5, 6, 7, 17, 19, 22, 
    23, 28, 30, 35, 37, 38, 40, 44, 46, 55, 
    57, 58, 59, 60, 73, 74, 75, 78, 83, 84, 
    91, 92, 97
  ],

  // Level 3: บททดสอบจิตวิทยา, ความลำเอียง (Biases), และปรัชญาความมั่งคั่ง (33 ข้อ)
  level3: [
    10, 12, 16, 20, 25, 26, 27, 29, 31, 34, 
    42, 48, 61, 62, 63, 64, 65, 66, 71, 72, 
    80, 82, 85, 86, 87, 88, 89, 90, 93, 94, 
    96, 98, 99
  ]
};

// ฟังก์ชันสุ่มดึงคำถามแบบ Progressive Difficulty (ดึงตามสัดส่วนความยาก)
const getProgressiveQuestionSet = (allScenarios: any[], numQuestions: number) => {
  const selectedIDs: number[] = [];
  const pool = {
    level1: [...levelMapping.level1],
    level2: [...levelMapping.level2],
    level3: [...levelMapping.level3]
  };

  const drawFromLevel = (level: "level1" | "level2" | "level3") => {
    if (pool[level].length === 0) return null;
    const randomIndex = Math.floor(Math.random() * pool[level].length);
    const id = pool[level][randomIndex];
    pool[level].splice(randomIndex, 1);
    return id;
  };

  for (let i = 1; i <= numQuestions; i++) {
    const progressPercent = (i / numQuestions) * 100;
    let drawnId: number | null = null;

    if (progressPercent <= 25) { // ช่วงต้นเกม
      const rand = Math.random();
      drawnId = rand <= 0.80 
        ? (drawFromLevel('level1') || drawFromLevel('level2'))
        : (drawFromLevel('level2') || drawFromLevel('level1'));
    } else if (progressPercent <= 75) { // ช่วงกลางเกม
      const rand = Math.random();
      if (rand <= 0.60) drawnId = drawFromLevel('level2') || drawFromLevel('level1') || drawFromLevel('level3');
      else if (rand <= 0.80) drawnId = drawFromLevel('level1') || drawFromLevel('level2') || drawFromLevel('level3');
      else drawnId = drawFromLevel('level3') || drawFromLevel('level2') || drawFromLevel('level1');
    } else { // ช่วงท้ายเกม
      const rand = Math.random();
      drawnId = rand <= 0.80 
        ? (drawFromLevel('level3') || drawFromLevel('level2'))
        : (drawFromLevel('level2') || drawFromLevel('level3'));
    }

    if (drawnId) selectedIDs.push(drawnId);
  }

  return selectedIDs.map(id => allScenarios.find(s => s.id === id)).filter(Boolean);
};

// --- 4. MAIN COMPONENT ---
export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameState, setGameState] = useState<"start" | "playing" | "loading" | "result">("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{risk: number, disc: number, choiceIndex: number}[]>([]);
  
  const [nickname, setNickname] = useState("");
  const [persona, setPersona] = useState<string | null>(null); 
  const [isCapturing, setIsCapturing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeScenarios, setActiveScenarios] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showJargon, setShowJargon] = useState(false); 
  const [matrixRotation, setMatrixRotation] = useState(0);

  const printRef = useRef<HTMLDivElement>(null);
  const TOTAL_QUESTIONS = 10;

  // --- Auth Effect ---
  useEffect(() => {
    preloadAvatars();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (user.displayName && !nickname) {
          const firstName = user.displayName.split(" ")[0];
          setNickname(firstName);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // --- DERIVED RESULTS ---
  const matchStats = useMemo(() => {
    if (gameState !== "result" || answers.length < TOTAL_QUESTIONS) return null;
    
    const rawRiskScore = answers.reduce((sum, ans) => sum + (ans?.risk || 0), 0);
    const rawDiscScore = answers.reduce((sum, ans) => sum + (ans?.disc || 0), 0);
    
    // แปลงให้เป็นสเกลเต็ม 10 เสมอ (Normalization) 
    const finalRiskScore = (rawRiskScore / TOTAL_QUESTIONS) * 10;
    const finalDiscScore = (rawDiscScore / TOTAL_QUESTIONS) * 10;

    return calculatePersona(finalRiskScore, finalDiscScore);
  }, [gameState, answers, TOTAL_QUESTIONS]);

  const randomQuote = useMemo(() => {
    if (gameState === "loading") {
      return loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];
    }
    return loadingQuotes[0];
  }, [gameState]);

  const currentResult = matchStats ? resultData[matchStats.primary.id as keyof typeof resultData] : null;
  const secondaryResult = matchStats ? resultData[matchStats.secondary.id as keyof typeof resultData] : null;

  const handleStart = () => {
    if (!persona) { alert("เลือกทรงทางการเงินของคุณก่อนนะ!"); return; }
    if (!nickname.trim()) { alert("พิมพ์ชื่อเล่นของคุณก่อนนะ!"); return; }
    
    // เรียกใช้ระบบสุ่มคำถามแบบ Progressive
    const selectedScenarios = getProgressiveQuestionSet(scenarios, TOTAL_QUESTIONS);

    setActiveScenarios(selectedScenarios);
    setAnswers([]); 
    setCurrentIndex(0);
    setGameState("playing");
  };

  const handleChoice = async (riskPoint: number, discPoint: number, index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const newAnswers = [...answers];
    newAnswers[currentIndex] = { risk: riskPoint, disc: discPoint, choiceIndex: index };
    setAnswers(newAnswers);

    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsTransitioning(false); 
      }, 250);
    } else {
      const riskTotal = newAnswers.reduce((sum, ans) => sum + ans.risk, 0);
      const discTotal = newAnswers.reduce((sum, ans) => sum + ans.disc, 0);
      
      // Calculate Match (for Firebase)
      const calculated = calculatePersona(riskTotal, discTotal);
      const primaryId = calculated.primary.id;
      const primaryName = resultData[primaryId as keyof typeof resultData]?.title || "นักลงทุน";
      const primaryMatch = calculated.primary.matchPercentage;
      
      const secondaryId = calculated.secondary.id;
      const secondaryName = resultData[secondaryId as keyof typeof resultData]?.title || "นักลงทุน";
      const secondaryMatch = calculated.secondary.matchPercentage;

      const detailedResults = activeScenarios.map((scenario, i) => {
        const selectedChoice = scenario.choices[newAnswers[i].choiceIndex];
        return {
          q_id: scenario.id,
          npc: scenario.npcName,
          question: scenario.message,
          answer: selectedChoice.text,
          points: { risk: selectedChoice.risk, disc: selectedChoice.disc }
        };
      });

      // สั่งบันทึกลง Firebase (Fire-and-forget เพื่อไม่ให้ UI ต้องรอโหลด หากเน็ตช้า)
      const saveMoneyResult = async () => {
        try {
          await addDoc(collection(db, "quiz_results"), {
            userId: currentUser?.uid || "guest",
            nickname: nickname || "นักล่าความมั่งคั่ง",
            persona: primaryName,
            resultKey: primaryId, 
            primaryMatch: primaryMatch,
            secondaryPersona: secondaryName,
            secondaryKey: secondaryId,
            secondaryMatch: secondaryMatch,
            riskScore: riskTotal,
            discScore: discTotal,
            history: detailedResults,
            createdAt: serverTimestamp(),
          });

          // ระบบแจก XP
          if (currentUser) {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              if (!userData.hasMoneyXP) {
                await setDoc(userRef, { totalXP: increment(50), hasMoneyXP: true }, { merge: true });
              }
            }
          }
        } catch (error) {
          console.error("❌ บันทึกล้มเหลว:", error);
        }
      };
      
      saveMoneyResult();

      // หน่วงเวลา 600ms ให้ User เห็นหลอดสีวิ่งเต็ม 100% ฟินๆ ก่อนเปลี่ยนฉาก
      setTimeout(() => {
        setIsTransitioning(false);
        setGameState("loading");
        setTimeout(() => setGameState("result"), 4500); 
      }, 600);
    }
  };

  const handleBack = () => { if (currentIndex > 0 && !isTransitioning) setCurrentIndex((prev) => prev - 1); };
  const handleMatrixClick = () => setMatrixRotation(prev => prev + 360);

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await toPng(printRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#FCFBF8" });
      const link = document.createElement("a");
      link.download = `Money-DNA-${nickname}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเซฟรูป ลองแคปหน้าจอแทนนะครับ");
    } finally {
      setIsCapturing(false);
    }
  };

  const resetGame = () => {
    setPersona(null); setAnswers([]); setGameState("start"); setMatrixRotation(0); setIsTransitioning(false);
  };

  const getMatrixClass = (key: string) => {
    const isActive = matchStats?.primary.id === key;
    
    // ปรับลดขนาดลงเป็น text-[9px] (มือถือ) และ text-[9.5px] (จอใหญ่ขึ้น) 
    // เพิ่ม px-1 และ text-center เผื่อคำยาวจะได้ไม่ชนขอบ
    return `h-11 rounded-xl flex justify-center items-center text-[9px] sm:text-[9.5px] px-1 text-center transition-all ${
      isActive 
      ? 'bg-amber-500 text-stone-900 font-bold shadow-md ring-[2px] ring-amber-500 scale-[1.08] z-10 tracking-tight' 
      : 'bg-white text-stone-400 font-medium tracking-tight'
    }`;
  };

  const getCurrentJargons = () => {
    let textPool = "";
    if (gameState === "playing" && activeScenarios[currentIndex]) {
      const currentQ = activeScenarios[currentIndex];
      textPool = [currentQ.npcName, currentQ.role, currentQ.message, ...currentQ.choices.map((c: any) => c.text)].join(" ").toLowerCase();
    } else if (gameState === "result" && currentResult) {
      // ดึงข้อมูลจากตัวตนหลัก
      let resultTexts = [
        currentResult.title, 
        currentResult.subtitle, 
        currentResult.desc, 
        currentResult.motto, 
        currentResult.bestPartner.name, 
        currentResult.bestPartner.desc, 
        currentResult.kryptonite.name, 
        currentResult.kryptonite.desc
      ];

      // เพิ่มข้อมูล Asset ที่แนะนำจากตัวตนรอง (Secondary Persona)
      if (secondaryResult) {
        resultTexts.push(
          secondaryResult.bestPartner.name,
          secondaryResult.bestPartner.desc
        );
      }

      textPool = resultTexts.join(" ").toLowerCase();
    } else return [];

    return jargonDict.filter(jargon => jargon.keywords.some(kw => {
      const keyword = kw.toLowerCase().trim();
      if (/^[a-z0-9\s&%]+$/.test(keyword)) {
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9])(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?:$|[^a-zA-Z0-9])`, 'i');
        return regex.test(textPool);
      }
      return textPool.includes(keyword);
    }));
  };
  
  const activeJargons = getCurrentJargons();

  return (
    <div className={`min-h-[100dvh] bg-stone-950 flex flex-col items-center justify-center sm:p-4 ${promptFont.className}`}>
      
      <div className={`w-full max-w-md shadow-2xl overflow-hidden h-[100dvh] sm:h-[850px] flex flex-col relative sm:rounded-[2.5rem] sm:border-[4px] sm:border-stone-800 ${gameState === 'playing' ? 'bg-[#F4F3ED]' : 'bg-[#FCFBF8]'}`}>
        
        {/* --- START SCREEN --- */}
        {gameState === "start" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 sm:p-8 bg-gradient-to-br from-[#FCFBF8] via-[#F4EDE4] to-[#E8DCC4] overflow-y-auto">
            <div className="flex flex-col items-center justify-center text-center pt-2 pb-4">
              <div className="w-full max-w-[320px] mb-4 relative">
                <Image src="/money-avatar-logo.png" alt="Money Avatar" width={500} height={200} className="w-full h-auto drop-shadow-md" priority />
              </div>
              <button onClick={() => setShowInfo(true)} className="mb-6 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-100/80 hover:bg-amber-200 px-3 py-1.5 rounded-full transition-colors border border-amber-300/50 shadow-sm">
                <Info size={14} /> ทรง AVATAR ทางการเงิน
              </button>
             
{/* 🟢 ส่วนรูป Capybara แบบคลีนๆ ไม่มีขอบบนล่าง */}
<div className="w-full flex justify-center">
  <img
    src="/avatars/capybara.png"
    alt="Capybara"
    className="w-48 h-auto object-contain drop-shadow-xl" 
  />
</div>

              <div className="w-full mb-6">
                <label className="block text-[13px] font-bold text-stone-700 mb-3 text-center uppercase tracking-wider">คุณมาในทรงไหน?</label>
                <div className="grid grid-cols-4 gap-2">
                  {personaOptions.map((opt) => (
                    <button key={opt.id} onClick={() => setPersona(opt.id)} className={`py-3 px-1 rounded-xl font-bold flex flex-col items-center justify-center transition-all duration-300 ${persona === opt.id ? "bg-stone-900 text-amber-400 shadow-md border-transparent scale-105 -translate-y-1" : "bg-white text-stone-500 border border-stone-200 hover:border-amber-300 shadow-sm"}`}>
                      <span className="text-[24px] mb-1">{opt.emoji}</span>
                      <span className="text-[11px] leading-tight text-center">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-full space-y-4 mb-2">
                <input type="text" placeholder={currentUser ? "ชื่อเล่นของคุณ..." : "พิมพ์ชื่อเล่นของคุณ..."} value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full px-5 py-4 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-center font-semibold text-stone-800 transition-all bg-white/80 backdrop-blur-sm shadow-inner" />
                <button onClick={handleStart} disabled={!persona || !nickname.trim()} className={`w-full bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 text-amber-400 font-bold py-4 rounded-xl shadow-xl transition-all active:scale-95 border border-stone-700 tracking-wide ${!persona || !nickname.trim() ? "opacity-50 grayscale cursor-not-allowed" : ""}`}>🌍 เปิดโลกการเงิน</button>
              </div>
              <DisclaimerFooter />
              <div className="mt-6 text-center text-[10px] font-medium text-stone-500/70 uppercase tracking-widest">
                Created by <span className="font-bold text-stone-600">อัพสกิลกับฟุ้ย</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- PLAYING SCREEN --- */}
        {gameState === "playing" && activeScenarios.length > 0 && (
          <div className="flex flex-col h-full bg-[#F4F3ED]">
            <div className="bg-stone-950 text-white px-3 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-amber-500/20">
              <div className="flex items-center gap-2 max-w-[65%]">
                <div className="text-xl bg-gradient-to-br from-stone-800 to-stone-900 p-2 rounded-full w-10 h-10 flex items-center justify-center border border-stone-700 shadow-inner shrink-0">
                  {activeScenarios[currentIndex]?.avatar}
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-semibold text-[13px] text-stone-100 truncate w-full">{activeScenarios[currentIndex]?.npcName}</h2>
                  <p className="text-[10px] text-amber-400 font-light tracking-wide truncate w-full">{activeScenarios[currentIndex]?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-2.5 shrink-0 mr-1 sm:mr-3">
                  
                  {/* Progress Bar Section */}
                  <div className="relative w-28 sm:w-36 flex items-center pr-8"> 
                    
                    {/* Wrapper ครอบหลอดและเหรียญไว้ด้วยกัน */}
                    <div className="relative w-full">
                      
                      {/* หลอด Progress */}
                      <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden border border-stone-700/50 shadow-inner relative">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                          initial={{ width: '2%' }}
                          animate={{ width: `${Math.max(2, (answers.length / TOTAL_QUESTIONS) * 100)}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                        <motion.div 
                          className="absolute top-0 bottom-0 w-4 bg-white/30 blur-[2px]"
                          initial={{ left: '-10%' }}
                          animate={{ left: `calc(${Math.max(2, (answers.length / TOTAL_QUESTIONS) * 100)}% - 8px)` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>

                    {/* ไอคอนเหรียญทอง (ตัววิ่ง) */}
<motion.div
  // เอา -translate-y-1/2 ออกจากตรงนี้
  className="absolute top-1/2 text-[18px] drop-shadow-md z-10"
  
  // บังคับแกน Y ตรงนี้แทน
  initial={{ left: '0%', rotate: 0, y: '-50%' }}
  animate={{ 
    left: `calc(${Math.max(2, (answers.length / TOTAL_QUESTIONS) * 100)}% - 12px)`,
    rotate: answers.length * 360,
    scale: [1, 1.3, 1],
    y: '-50%' // ล็อกแกน Y ไว้ตรงกลางเสมอตอน Animate
  }}
  transition={{ 
    left: { type: "spring", bounce: 0.4, duration: 0.5 },
    rotate: { type: "spring", bounce: 0.4, duration: 0.5 },
    scale: { duration: 0.3 } 
  }}
>
  💰
</motion.div>
                      
                    </div>

                    {/* Emoji เป้าหมายปลายทาง (Target) */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[20px] drop-shadow-sm opacity-80 z-0">
                      🏆 
                    </div>

                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto flex flex-col justify-center min-h-[250px]"> 
              <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="bg-stone-800 p-6 pt-7 rounded-2xl shadow-xl w-full max-w-[92%] border-l-4 border-amber-400 relative mx-auto my-auto">
                  
                  {/* Tag Situation ด้านซ้าย */}
                  <div className="absolute -top-3 left-4 bg-amber-400 text-stone-900 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm">
                    <AlertTriangle size={12}/> Situation
                  </div>

                  {/* ปุ่มคลังศัพท์ */}
                  <button 
                    onClick={() => setShowJargon(true)} 
                    className="absolute -top-3 right-4 p-1.5 bg-stone-900 text-[#00bfff] hover:text-white hover:bg-stone-700 rounded-full transition-all active:scale-90 border border-stone-600 shadow-md flex items-center justify-center z-10"
                  >
                    <BookOpen size={14} />
                    {activeJargons.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border border-stone-800 animate-pulse"></span>}
                  </button>

                  <p className="text-[15px] text-center leading-relaxed font-medium text-stone-100 drop-shadow-sm mt-1">{activeScenarios[currentIndex]?.message}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="bg-[#FCFBF8] p-4 pb-6 border-t border-stone-200 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.03)] shrink-0 z-20">
              <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4"></div>
              <div className="space-y-3 max-h-[45vh] overflow-y-auto p-1 pb-6 custom-scrollbar">
                {activeScenarios[currentIndex]?.choices.map((choice: any, index: number) => {
                  const isSelected = answers[currentIndex]?.choiceIndex === index;
                  return (
                    <button key={`${currentIndex}-${index}`} disabled={isTransitioning} onClick={() => handleChoice(choice.risk, choice.disc, index)} className={`w-full text-left px-5 py-4 rounded-xl text-[13px] leading-relaxed font-medium border-2 transition-all active:scale-[0.98] shadow-sm ${isSelected ? "bg-[#004D7A] border-[#004D7A] text-white shadow-md ring-2 ring-sky-300 ring-offset-1" : "bg-white border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50"}`}>
                      {choice.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* --- LOADING SCREEN --- */}
        {gameState === "loading" && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex-1 flex flex-col items-center justify-center p-8 bg-stone-950 relative overflow-hidden"
          >
            {/* เอฟเฟกต์แสงเงาด้านหลัง (Glow Effect) */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>

            <Loader2 size={52} className="text-amber-500 animate-spin mb-6 z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
            
            <h2 className="text-xl font-bold text-white mb-2 text-center tracking-wide z-10">กำลังประมวลผล...</h2>
            <p className="text-stone-400 text-[13px] text-center font-light mb-12 z-10">สแกน AVATAR การเงินของคุณ 📉📈</p>

            {/* กรอบโชว์ Quote */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="max-w-[280px] text-center z-10 bg-stone-900/60 p-5 rounded-2xl border border-stone-800/80 backdrop-blur-sm shadow-xl"
            >
              <div className="text-amber-500/40 text-4xl leading-none absolute -top-3 -left-2 font-serif">"</div>
              
              <p className="text-stone-300 text-[12px] italic leading-relaxed mb-4 relative z-10">
                {randomQuote.text.split("'").map((part, i) => 
                  i % 2 === 1 ? <span key={i} className="text-amber-400 font-semibold">{part}</span> : part
                )}
              </p>
              
              <div className="flex flex-col items-center justify-center gap-0.5 relative z-10">
                <span className="text-stone-100 text-[10px] font-bold tracking-wide uppercase">
                  — {randomQuote.author} —
                </span>
                <span className="text-stone-500 text-[9px] tracking-wider">
                  {randomQuote.book}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* --- RESULT SCREEN --- */}
        {gameState === "result" && currentResult && matchStats && (
          <div className="flex-1 flex flex-col bg-[#FCFBF8] relative overflow-hidden">
            <div className="flex-1 overflow-y-auto pb-60 custom-scrollbar">
              <div ref={printRef} className="flex flex-col bg-[#FCFBF8] w-full relative">
                <div className={`${currentResult.color} text-white p-6 pb-20 text-center flex flex-col items-center relative shadow-lg shrink-0 rounded-b-[2rem]`}>
                  <button onClick={() => setShowJargon(true)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all active:scale-90 backdrop-blur-sm border border-white/20 flex items-center justify-center z-20 shadow-sm">
                    <BookOpen size={18} />
                    {activeJargons.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border border-stone-900 animate-pulse shadow-sm"></span>}
                  </button>
                  <Trophy size={28} className="text-white/80 mb-2 mt-2 drop-shadow-md" />
                  <p className="text-white/90 text-[10px] font-semibold tracking-widest uppercase mb-3 opacity-80">Money Avatar</p>
                  <p className="text-white/95 text-[11px] bg-black/25 px-4 py-1.5 rounded-full font-medium tracking-wide border border-white/10 backdrop-blur-sm">{currentResult.subtitle}</p>
                </div>

             <div className="p-5 pt-10 flex flex-col relative">
  {/* 🟢 ปรับขนาดจาก w-24 h-24 เป็น w-32 h-32 และเลื่อนขึ้นไป -top-16 (ครึ่งหนึ่งของ 32) */}
  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-[6px] border-[#FCFBF8] z-10 overflow-hidden">
    {avatarImages[matchStats.primary.id] ? (
      <Image 
        src={avatarImages[matchStats.primary.id]} 
        alt={currentResult.title} 
        width={128} // ปรับให้สัมพันธ์กับ w-32
        height={128} 
        className="object-contain w-[85%] h-[85%]" // ใช้ object-contain และลดขนาดลงนิดนึงเพื่อให้เห็นตัวการ์ตูนครบ ไม่โดนขอบวงกลมตัด
      />
    ) : (
      <span className="text-6xl">{currentResult.emoji}</span> // ขยาย Emoji ตามขนาดวงกลม
    )}
  </div>

  {/* ปรับ mt-3 เป็น mt-10 หรือ mt-12 เพื่อหลบวงกลมที่ใหญ่ขึ้น */}
  <div className="text-center mt-12 mb-5">
    <p className="text-stone-400 text-[11px] font-semibold tracking-widest uppercase mb-1">AVATAR การเงินของคุณ</p>
    <h1 className="text-2xl font-black text-stone-900 leading-tight mb-1">
      {persona === "ไม่ระบุ" ? nickname : `${persona}${nickname}`}
    </h1>
    <p className={`text-lg font-bold leading-tight ${currentResult.titleColor}`}>{currentResult.title}</p>
    <div className="flex items-center justify-center mt-2">
       <span className="bg-stone-100 text-stone-500 px-3 py-1 rounded-full text-[10px] font-bold border border-stone-200 shadow-sm">
         ตรงกับคุณ {matchStats.primary.matchPercentage}%
       </span>
    </div>
  </div>
                  
                  {/* 1️⃣ จุดแข็ง / มุมมองต่อเงิน */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 mb-3 text-center">
                    <p className="text-[13px] text-stone-600 leading-relaxed font-light">
                      {highlightText(currentResult.desc)}
                    </p>
                  </div>

                  {/* 2️⃣ หลุมพรางทางการเงิน */}
                  <div className="bg-sky-50/60 border border-sky-100 p-4 rounded-2xl mb-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-sky-400"></div>
                    <p className="text-[11px] font-bold text-sky-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                      <Zap size={14} className="text-sky-500"/> หลุมพรางทางการเงิน
                    </p>
                    <p className="font-bold text-sky-900 text-[13px] mb-1">{currentResult.kryptonite.name}</p>
                    <p className="text-[12px] text-sky-800/80 leading-relaxed font-light">
                      {highlightText(currentResult.kryptonite.desc, "font-bold text-sky-900 bg-sky-200/50 px-1 rounded-sm")}
                    </p>
                  </div>

                  {/* 🧭 พิกัดตัวตนการเงิน + 🎭 ตัวตนรอง */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 mb-4 overflow-hidden text-center">
                    <h3 className="font-bold text-stone-800 mb-4 text-[13px] border-b border-stone-100 pb-3 flex items-center justify-between w-full">
                      <div className="flex items-center gap-2"><span className="text-[16px]">🧭</span> พิกัดตัวตนการเงิน</div>
                      <button onClick={() => setShowInfo(true)} className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors font-medium active:scale-95"><Info size={12} /></button>
                    </h3>
                    
                    {/* ตาราง 3x3 */}
                    <div className="flex flex-col items-center">
                      <div className="flex w-full justify-center pl-4 pr-1">
                        <div className="relative w-8 flex justify-center items-center mr-1.5 shrink-0">
                          <div className="absolute flex flex-row-reverse items-center gap-2 whitespace-nowrap text-[10px] font-bold text-stone-400 tracking-widest -rotate-90">
                            <span>เสี่ยงสูง 🚀</span><span>➔</span><span>เสี่ยงต่ำ 🛡️</span>
                          </div>
                        </div>
                        <motion.div className="grid grid-cols-3 gap-1.5 w-full max-w-[260px] bg-stone-100 p-1.5 rounded-xl border border-stone-200 relative cursor-pointer" animate={{ rotate: matrixRotation }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} onClick={handleMatrixClick}>
                          <div className={getMatrixClass('HIGH_RISK_LOW_DISC')}>กาวสุดกราฟ</div>
                          <div className={getMatrixClass('HIGH_RISK_MID_DISC')}>ล่าเทรนด์(ดอย)</div>
                          <div className={getMatrixClass('HIGH_RISK_HIGH_DISC')}>เซียนระบบ</div>
                          <div className={getMatrixClass('MID_RISK_LOW_DISC')}>ตัวตึงสายเปย์</div>
                          <div className={getMatrixClass('MID_RISK_MID_DISC')}>มนุษย์สมดุล</div>
                          <div className={getMatrixClass('MID_RISK_HIGH_DISC')}>นักปั้นพอร์ต</div>
                          <div className={getMatrixClass('LOW_RISK_LOW_DISC')}>ผู้ประสบภัย</div>
                          <div className={getMatrixClass('LOW_RISK_MID_DISC')}>สายเซฟโซน</div>
                          <div className={getMatrixClass('LOW_RISK_HIGH_DISC')}>พิทักษ์เงินต้น</div>
                        </motion.div>
                      </div>
                      {/* แกน X แนวนอน (ใช้ตามฟีล ➔ มีระบบ) */}
                      <div className="flex justify-between items-center w-full max-w-[280px] mt-3 px-3 text-[10px] font-bold text-stone-400 tracking-widest ml-10">
                        <span>💖 ใช้ตามฟีล</span>
                        <span>➔</span>
                        <span>มีระบบ ⚙️</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-stone-400 text-center mt-3 italic mb-1">ลองจิ้มที่ตารางเพื่อหมุนโลกการเงินดูสิ! 💫</p>

                    {/* ตัวตนรอง (ย้ายมาต่อท้ายตารางแบบมินิมอล) */}
                    {secondaryResult && (
                      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex flex-col items-start text-left">
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                            🎭 ตัวตนรองที่ซ่อนอยู่
                          </p>
                          <p className={`font-bold text-[13px] ${secondaryResult.titleColor} flex items-center gap-1`}>
                            {secondaryResult.emoji} {secondaryResult.title}
                          </p>
                        </div>
                        <div className="bg-stone-50 text-stone-500 text-[10px] px-2.5 py-1.5 rounded-lg font-bold border border-stone-200 shadow-sm shrink-0">
                          เหมือน {matchStats.secondary.matchPercentage}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5️⃣ Asset ที่แนะนำสำหรับสไตล์คุณ (Primary + Secondary) */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 mb-4">
                    <div className="border-b border-stone-100 pb-3 mb-4 flex items-center justify-between">
                      <h3 className="font-bold text-stone-800 text-[13px] flex items-center gap-2">
                        <span className="text-[16px]">🎯</span> Asset ที่แนะนำ
                      </h3>
                      <span className="text-[9px] text-stone-400 bg-stone-100/80 border border-stone-200 px-2 py-0.5 rounded-md font-semibold tracking-wide">
                        *Not Financial Advice
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {/* อันดับ 1 จากตัวตนหลัก */}
                      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                        <p className="text-[10px] font-bold text-amber-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                          🥇 อันดับ 1 (จากตัวตนหลัก)
                        </p>
                        <p className="font-bold text-stone-800 text-[13px] mb-1">{currentResult.bestPartner.name}</p>
                        <p className="text-[12px] text-stone-600 leading-relaxed font-light">
                          {highlightText(currentResult.bestPartner.desc, "font-bold text-amber-900 bg-amber-200/50 px-1 rounded-sm")}
                        </p>
                      </div>

                      {/* อันดับ 2 จากตัวตนรอง */}
                      {secondaryResult && (
                        <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-stone-300"></div>
                          <p className="text-[10px] font-bold text-stone-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                            🥈 อันดับ 2 (จากตัวตนรอง)
                          </p>
                          <p className="font-bold text-stone-700 text-[13px] mb-1">{secondaryResult.bestPartner.name}</p>
                          <p className="text-[12px] text-stone-500 leading-relaxed font-light">
                            {highlightText(secondaryResult.bestPartner.desc, "font-bold text-stone-700 bg-stone-200/50 px-1 rounded-sm")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 6️⃣ เครื่องมืออัปสกิลอื่นๆ */}
                  <div className="flex flex-col items-center justify-center gap-2 mb-6 mt-4">
                    <div className="flex items-center justify-center gap-3 mb-2 w-full">
                      <div className="h-[1px] bg-stone-200 flex-1"></div>
                      <p className="text-[10px] font-bold text-stone-400 tracking-[0.1em] uppercase whitespace-nowrap">เครื่องมืออัปสกิลอื่นๆ</p>
                      <div className="h-[1px] bg-stone-200 flex-1"></div>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full">
                      <div className="grid grid-cols-2 gap-3">
                        <a href="/tools/wheel-of-life" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 bg-white border border-stone-200 py-4 rounded-2xl shadow-sm hover:border-orange-200 hover:bg-orange-50/50 transition-all active:scale-95 group">
                          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                            <PieChart size={18} className="text-orange-500" />
                          </div>
                          <span className="text-[12px] font-bold text-stone-700">เช็กสมดุลชีวิต</span>
                        </a>

                        <a href="/tools/disc" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 bg-white border border-stone-200 py-4 rounded-2xl shadow-sm hover:border-sky-200 hover:bg-sky-50/50 transition-all active:scale-95 group">
                          <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                            <Users size={18} className="text-sky-500" />
                          </div>
                          <span className="text-[12px] font-bold text-stone-700">ค้นหาจุดแข็ง</span>
                        </a>
                      </div>

                      <a href={currentUser ? "/dashboard" : "/"} className="relative flex w-full items-center justify-between bg-slate-900 p-1 rounded-2xl shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] group overflow-hidden">
                        <div className="flex items-center gap-3 pl-4 py-3">
                          {currentUser ? (
                            <>
                              <div className="bg-amber-500/20 p-2 rounded-xl group-hover:bg-amber-500/30 transition-colors">
                                <LayoutDashboard size={20} className="text-amber-400" />
                              </div>
                              <div className="flex flex-col items-start text-left">
                                <span className="text-[14px] font-black text-white tracking-wide">ไปที่ Dashboard หลัก</span>
                                <span className="text-[10px] text-stone-400 font-medium">รวมทุกสกิลของคุณไว้ที่เดียว</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="bg-stone-700 p-2 rounded-xl group-hover:bg-stone-600 transition-colors">
                                <ArrowLeft size={20} className="text-stone-300" />
                              </div>
                              <div className="flex flex-col items-start text-left">
                                <span className="text-[14px] font-black text-white tracking-wide">กลับสู่หน้าแรก</span>
                                <span className="text-[10px] text-stone-400 font-medium">ไปทำความรู้จักกันก่อนนะ</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="pr-4">
                          {currentUser ? <ArrowRight size={18} className="text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" /> : <RefreshCcw size={16} className="text-stone-500 group-hover:text-white group-hover:rotate-180 transition-all duration-500" />}
                        </div>
                        {currentUser && <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-2xl rounded-full"></div>}
                      </a>
                    </div>
                  </div>

                  <div className="mt-2 text-center text-stone-400 text-[9px] uppercase tracking-widest font-semibold pb-4">Created by อัพสกิลกับฟุ้ย</div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl p-4 border-t border-stone-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex flex-col gap-2.5 z-30">
              <button onClick={handleDownloadImage} disabled={isCapturing} className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold py-3.5 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all text-[14px] shadow-lg disabled:opacity-50"><Camera size={18} /> {isCapturing ? "กำลังประมวลผลรูปภาพ..." : "เซฟรูปอวดเพื่อนลง Story"}</button>
              <div className="flex gap-2">
                <a href="https://lin.ee/rQawKUM" target="_blank" rel="noopener noreferrer" className="flex-1 bg-stone-900 text-amber-400 font-bold py-3 rounded-xl text-center text-[12px] flex items-center justify-center gap-1.5 hover:bg-black transition-colors shadow-lg border border-stone-700"><MessageCircle size={16} className="fill-amber-400 text-amber-400" /> อัปสกิลหารายได้เพิ่ม</a>
                <button onClick={resetGame} className="flex-1 bg-stone-100 text-stone-600 font-semibold py-3 rounded-xl text-center text-[12px] flex items-center justify-center gap-1.5 hover:bg-stone-200 transition-colors"><RefreshCcw size={14} /> สแกน AVATAR อีกครั้ง</button>
              </div>
            </div>
          </div>
        )}
      </div>

    {/* === POPUP 9 DNA === */}
<AnimatePresence>
  {showInfo && (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[100] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-6" 
      onClick={() => setShowInfo(false)}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.9, y: 20 }} 
        className="bg-[#FCFBF8] w-full max-w-[360px] max-h-[75vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-stone-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* ส่วนหัว: ปรับสีเป็นทอง Gradient */}
        <div className="bg-stone-900 p-5 flex justify-between items-center shrink-0 border-b border-amber-500/20">
          <h3 className="font-bold text-[16px] flex items-center gap-2">
            <Info size={18} className="text-amber-500" />
            <span className="bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 bg-clip-text text-transparent">
              9 AVATAR ทางการเงิน
            </span>
          </h3>
          <button 
            onClick={() => setShowInfo(false)} 
            className="bg-stone-800 p-2 rounded-full hover:bg-stone-700 transition-all active:scale-90 text-stone-400"
          >
            <X size={20}/>
          </button>
        </div>

       <div className="overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#FCFBF8]">
  {/* เปลี่ยนเป็น Object.entries เพื่อให้ดึง 'key' มาใช้แมพรูปภาพได้ */}
  {Object.entries(resultData).map(([key, type]) => (
    <div key={key} className="bg-white p-4 rounded-2xl border border-stone-100 flex items-start gap-4 shadow-sm hover:border-amber-200 transition-colors">
      
      {/* ส่วนแสดงรูปภาพ Avatar */}
      <div className="w-16 h-16 shrink-0 bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 flex items-center justify-center">
        <img 
          src={avatarImages[key]} 
          alt={type.title}
          className="w-14 h-14 object-contain" // ใช้ object-contain เพื่อให้เห็นตัวการ์ตูนครบตัว
          onError={(e) => { e.currentTarget.src = "/avatars/default.png" }} // Fallback กรณีหาไฟล์ไม่เจอ
        />
      </div>

      <div className="flex-1">
        <p className={`font-bold text-[14px] ${type.titleColor}`}>{type.title}</p>
        <p className="text-[11px] text-stone-400 font-medium mb-2 uppercase tracking-tight">{type.subtitle}</p>
        <p className="text-[12px] text-stone-600 leading-relaxed font-light">
          {highlightText(type.desc, "font-bold text-stone-800 bg-amber-50 px-1 rounded-sm border-b border-amber-200")}
        </p>
      </div>
    </div>
  ))}
</div>
     
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
     {/* === POPUP คลังศัพท์การเงิน === */}
<AnimatePresence>
  {showJargon && (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      // เพิ่ม p-6 เพื่อให้ตัว Popup ลอยเด่น ไม่ติดขอบจอ
      className="fixed inset-0 z-[100] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-6" 
      onClick={() => setShowJargon(false)}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.9, y: 20 }} 
        // ปรับ rounded-[2.5rem] ให้โค้งมนสวยเท่ากัน และคุม max-h ไว้ที่ 75vh
        className="bg-white w-full max-w-[340px] max-h-[75vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-2 border-sky-100" 
        onClick={e => e.stopPropagation()}
      >
        {/* ส่วนหัว: ใช้โทนสีฟ้า/น้ำเงินเพื่อสื่อถึงข้อมูล/ความรู้ */}
        <div className="bg-slate-900 p-5 flex justify-between items-center shrink-0 border-b border-sky-500/20">
          <h3 className="font-bold text-[16px] text-white flex items-center gap-2">
            <BookOpen size={18} className="text-sky-400"/> 
            <span className="bg-gradient-to-r from-sky-200 to-sky-400 bg-clip-text text-transparent">
              คลังศัพท์น่ารู้
            </span>
          </h3>
          <button 
            onClick={() => setShowJargon(false)} 
            className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-all active:scale-90 text-slate-400"
          >
            <X size={20}/>
          </button>
        </div>

        {/* เนื้อหาด้านใน: ปรับปรุงระยะห่าง (Spacing) */}
        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
          {activeJargons.length > 0 ? (
            <div className="space-y-4">
              <p className="text-[11px] font-bold text-sky-600/60 uppercase tracking-[0.1em] mb-1">ศัพท์ที่เกี่ยวข้องในหน้านี้</p>
              {activeJargons.map((jargon, idx) => (
                <div key={idx} className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 shadow-sm">
                  <p className="font-bold text-[15px] text-slate-900 mb-1.5">{jargon.word}</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed font-light">{jargon.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4 grayscale opacity-50">📖</div>
              <p className="font-bold text-slate-800 text-[15px]">ไม่มีคลังศัพท์ในข้อนี้</p>
              <p className="text-[12px] text-slate-500 font-light mt-2 px-6">ลุยตอบตามสัญชาตญาณได้เลยครับ!</p>
            </div>
          )}
          
          <div className="pt-6 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">เกร็ดการเงินอื่นๆ</p>
            {jargonDict.filter(j => !activeJargons.includes(j)).slice(0, 2).map((jargon, idx) => (
              <div key={idx} className="mb-4 last:mb-0 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <p className="font-bold text-[13px] text-slate-700 mb-1">{jargon.word}</p>
                <p className="text-[12px] text-slate-500 font-light leading-snug">{jargon.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}

const highlightText = (text: string, colorClass: string = "font-bold text-stone-900 bg-amber-100/60 px-1 rounded-md") => {
  if (!text) return null;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) => 
    index % 2 === 1 ? (
      <span key={index} className={colorClass}>
        {part}
      </span>
    ) : (
      part
    )
  );
};