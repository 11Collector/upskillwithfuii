"use client";
import { collection, addDoc, updateDoc, serverTimestamp, doc, setDoc, getDoc, increment } from "firebase/firestore";
import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, RefreshCcw, Camera, AlertTriangle, ArrowLeft, ArrowRight, Loader2, Zap, Info, X, BookOpen, PieChart, Users, MessageCircle, LayoutDashboard
} from "lucide-react";
import { domToPng } from "modern-screenshot";
import Image from "next/image";
import { Prompt } from "next/font/google";

import Link from 'next/link';
import { scenarios } from "@/data/moneyScenarios";
import AssessmentResultCTA from '@/app/components/AssessmentResultCTA';
import { resultData } from "@/data/moneyResult";
import DisclaimerFooter from '@/app/components/DisclaimerFooter';
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

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

const promptFont = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"]
});

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

const avatarImages: Record<string, string> = {
  "HIGH_RISK_LOW_DISC": "/avatars/phoenix.png",
  "HIGH_RISK_MID_DISC": "/avatars/monkey.png",
  "HIGH_RISK_HIGH_DISC": "/avatars/wolf.png",
  "MID_RISK_LOW_DISC": "/avatars/peacock.png",
  "MID_RISK_MID_DISC": "/avatars/capybara.png",
  "MID_RISK_HIGH_DISC": "/avatars/ant.png",
  "LOW_RISK_LOW_DISC": "/avatars/deer.png",
  "LOW_RISK_MID_DISC": "/avatars/turtle.png",
  "LOW_RISK_HIGH_DISC": "/avatars/snail.png",
};

const preloadAvatars = () => {
  if (typeof window !== "undefined") {
    Object.values(avatarImages).forEach((src) => {
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

const personaOptions = [
  { id: "เสี่ย", label: "เสี่ย", emoji: "🤵‍♂️" },
  { id: "ซ้อ", label: "ซ้อ", emoji: "💅" },
  { id: "จารย์", label: "จารย์", emoji: "📚" },
  { id: "ไม่ระบุ", label: "ไม่ระบุ", emoji: "😎" },
];

export const jargonDict = [
  { keywords: ["compound effect", "ทบต้น"], word: "Compound Effect (ดอกเบี้ยทบต้น)", desc: "กลไกที่ผลกำไรถูกนำไปลงทุนทบกับเงินต้นเดิมซ้ำๆ ทำให้ฐานเงินทุนใหญ่ขึ้นแบบทวีคูณเมื่อเวลาผ่านไป" },
  { keywords: ["dca"], word: "DCA (การลงทุนแบบถัวเฉลี่ยต้นทุน)", desc: "กลยุทธ์การทยอยลงทุนด้วยจำนวนเงินที่เท่าๆ กันอย่างสม่ำเสมอ เพื่อถัวเฉลี่ยต้นทุนโดยไม่ใช้การจับจังหวะตลาด" },
  { keywords: ["asset allocation", "กระจายความเสี่ยง"], word: "Asset Allocation (การจัดสรรสินทรัพย์)", desc: "การจัดสรรเงินทุนไปยังกลุ่มสินทรัพย์ที่หลากหลายเพื่อลดความผันผวนของพอร์ต" },
  { keywords: ["passive"], word: "Passive Income (รายได้เชิงรับ)", desc: "รูปแบบการลงทุนหรือรายได้ที่เน้นให้ระบบทำงานแทน โดยลดการใช้แรงงานและเวลาเข้าไปแลกโดยตรง" },
  { keywords: ["cashflow", "กระแสเงินสด"], word: "Cashflow (กระแสเงินสด)", desc: "การไหลเข้าและออกของเงิน การมีกระแสเงินสดบวกหมายถึงรายรับมากกว่ารายจ่าย" },
  { keywords: ["yield"], word: "Yield (ผลตอบแทน)", desc: "อัตราส่วนผลตอบแทนที่เกิดจากการถือครองสินทรัพย์ เช่น เงินปันผลจากหุ้น หรือค่าเช่า" },
  { keywords: ["tech", "เทค"], word: "Tech Stock (หุ้นเทคโนโลยี)", desc: "หุ้นของบริษัทในกลุ่มนวัตกรรม มักเติบโตสูงแต่มีความผันผวนตามกระแสเทคโนโลยี" },
  { keywords: ["growth", "เติบโต"], word: "Growth Stock (หุ้นเติบโต)", desc: "หุ้นที่มีอัตราการขยายตัวของรายได้และกำไรสูงกว่าค่าเฉลี่ยของตลาด" },
  { keywords: ["blue-chip", "บลูชิป"], word: "Blue-chip Stock (หุ้นพื้นฐานดีขนาดใหญ่)", desc: "หุ้นของบริษัทขนาดใหญ่ที่มีฐานะทางการเงินมั่นคงและเป็นผู้นำในอุตสาหกรรม" },
  { keywords: ["index fund", "ดัชนี", "กองทุนดัชนี"], word: "Index Fund (กองทุนรวมดัชนี)", desc: "กองทุนที่ลงทุนเลียนแบบดัชนีตลาด เพื่อให้ได้ผลตอบแทนใกล้เคียงกับภาพรวมตลาด" },
  { keywords: ["reit", "อสังหาฯ"], word: "REIT (กองทุนรวมอสังหาริมทรัพย์)", desc: "กองทุนที่ลงทุนในอสังหาริมทรัพย์เพื่อรับรายได้จากค่าเช่าและนำมาแบ่งเป็นปันผล" },
  { keywords: ["หุ้นกู้"], word: "Corporate Bond (หุ้นกู้)", desc: "ตราสารหนี้ภาคเอกชนที่เราเป็นเจ้าหนี้บริษัท และได้รับผลตอบแทนเป็นดอกเบี้ยตามกำหนด" },
  { keywords: ["พันธบัตร", "ตราสารหนี้"], word: "Bond (พันธบัตร)", desc: "ตราสารหนี้ที่ออกโดยรัฐบาล มีความเสี่ยงต่ำและได้รับดอกเบี้ยสม่ำเสมอ" },
  { keywords: ["mixed fund", "กองทุนผสม"], word: "Mixed Fund (กองทุนผสม)", desc: "กองทุนที่มีนโยบายกระจายการลงทุนในหลายสินทรัพย์พร้อมกันเพื่อรักษาสมดุลความเสี่ยง" },
  { keywords: ["fomo"], word: "FOMO (อาการกลัวตกรถ)", desc: "อาการกลัวตกรถหรือพลาดโอกาสทำกำไรเมื่อเห็นคนอื่นได้เงิน ทำให้รีบตัดสินใจกระโดดเข้าไปลงทุนด้วยอารมณ์" },
  { keywords: ["black monday"], word: "Black Monday (วันจันทร์ทมิฬ)", desc: "เหตุการณ์ประวัติศาสตร์ที่ตลาดหุ้นทั่วโลกร่วงลงอย่างรุนแรงในวันจันทร์ มักใช้เปรียบเปรยถึงวันที่ตลาดพังยับเยิน" }
];

export const levelMapping = {
  level1: [8, 9, 11, 13, 14, 15, 18, 21, 24, 32, 33, 36, 39, 41, 43, 45, 47, 49, 50, 51, 52, 53, 54, 56, 67, 68, 69, 70, 76, 77, 79, 81, 95, 100],
  level2: [1, 2, 3, 4, 5, 6, 7, 17, 19, 22, 23, 28, 30, 35, 37, 38, 40, 44, 46, 55, 57, 58, 59, 60, 73, 74, 75, 78, 83, 84, 91, 92, 97],
  level3: [10, 12, 16, 20, 25, 26, 27, 29, 31, 34, 42, 48, 61, 62, 63, 64, 65, 66, 71, 72, 80, 82, 85, 86, 87, 88, 89, 90, 93, 94, 96, 98, 99]
};

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

    if (progressPercent <= 25) {
      const rand = Math.random();
      drawnId = rand <= 0.80
        ? (drawFromLevel('level1') || drawFromLevel('level2'))
        : (drawFromLevel('level2') || drawFromLevel('level1'));
    } else if (progressPercent <= 75) {
      const rand = Math.random();
      if (rand <= 0.60) drawnId = drawFromLevel('level2') || drawFromLevel('level1') || drawFromLevel('level3');
      else if (rand <= 0.80) drawnId = drawFromLevel('level1') || drawFromLevel('level2') || drawFromLevel('level3');
      else drawnId = drawFromLevel('level3') || drawFromLevel('level2') || drawFromLevel('level1');
    } else {
      const rand = Math.random();
      drawnId = rand <= 0.80
        ? (drawFromLevel('level3') || drawFromLevel('level2'))
        : (drawFromLevel('level2') || drawFromLevel('level3'));
    }

    if (drawnId) selectedIDs.push(drawnId);
  }

  return selectedIDs.map(id => allScenarios.find(s => s.id === id)).filter(Boolean);
};

import { useAssessmentMode } from "@/context/AssessmentContext";

export default function MoneyAvatarClient() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameState, setGameState] = useState<"start" | "playing" | "loading" | "result">("start");
  const isAssessing = gameState === "playing" || gameState === "loading";
  useAssessmentMode(isAssessing);
  const [fromPage, setFromPage] = useState<"home" | "dashboard" | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ risk: number, disc: number, choiceIndex: number }[]>([]);

  const [nickname, setNickname] = useState("");
  const [persona, setPersona] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeScenarios, setActiveScenarios] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showJargon, setShowJargon] = useState(false);
  const [matrixRotation, setMatrixRotation] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const hasMemberSaved = useRef(false);
  const savedDocRef = useRef<ReturnType<typeof doc> | null>(null);
  const TOTAL_QUESTIONS = 10;

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
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      if (from === "home" || from === "dashboard") {
        setFromPage(from as any);
      }
    }
    return () => unsubscribe();
  }, []);

  const matchStats = useMemo(() => {
    if (gameState !== "result" || answers.length < TOTAL_QUESTIONS) return null;

    const rawRiskScore = answers.reduce((sum, ans) => sum + (ans?.risk || 0), 0);
    const rawDiscScore = answers.reduce((sum, ans) => sum + (ans?.disc || 0), 0);

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

      const saveMoneyResult = async () => {
        try {
          if (currentUser) {
            hasMemberSaved.current = true;
          }
          const newDocRef = await addDoc(collection(db, "quiz_results"), {
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
          savedDocRef.current = newDocRef;

          if (currentUser) {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              if (!userData.hasMoneyXP) {
                const oldXP = userData.totalXP || 0;
                const newXP = oldXP + 50;
                const oldLevel = Math.floor(oldXP / 100) + 1;
                const newLevel = Math.floor(newXP / 100) + 1;
                await setDoc(userRef, { totalXP: increment(50), hasMoneyXP: true }, { merge: true });
                if (newLevel > oldLevel) {
                  sessionStorage.setItem('pendingLevelUp', String(newLevel));
                }
              }
            }
          }
        } catch (error) {
          console.error("❌ บันทึกล้มเหลว:", error);
        }
      };

      saveMoneyResult();

      setTimeout(() => {
        setIsTransitioning(false);
        setGameState("loading");
        setTimeout(() => setGameState("result"), 4500);
      }, 600);
    }
  };

  const handleMatrixClick = () => setMatrixRotation(prev => prev + 360);

  useEffect(() => {
    if (!currentUser || gameState !== "result" || hasMemberSaved.current) return;
    if (!matchStats) return;

    const grantXPOnLogin = async () => {
      hasMemberSaved.current = true;
      try {
        if (savedDocRef.current) {
          await updateDoc(savedDocRef.current, { userId: currentUser.uid });
        } else {
          const newDocRef = await addDoc(collection(db, "quiz_results"), {
            userId: currentUser.uid,
            nickname: nickname || "นักล่าความมั่งคั่ง",
            persona: resultData[matchStats.primary.id as keyof typeof resultData]?.title || "นักลงทุน",
            resultKey: matchStats.primary.id,
            primaryMatch: matchStats.primary.matchPercentage,
            secondaryPersona: resultData[matchStats.secondary.id as keyof typeof resultData]?.title || "นักลงทุน",
            secondaryKey: matchStats.secondary.id,
            secondaryMatch: matchStats.secondary.matchPercentage,
            createdAt: serverTimestamp(),
          });
          savedDocRef.current = newDocRef;
        }

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (!userData.hasMoneyXP) {
            const oldXP = userData.totalXP || 0;
            const newXP = oldXP + 50;
            const oldLevel = Math.floor(oldXP / 100) + 1;
            const newLevel = Math.floor((oldXP + 50) / 100) + 1;
            await setDoc(userRef, { totalXP: increment(50), hasMoneyXP: true }, { merge: true });
            if (newLevel > oldLevel) {
              sessionStorage.setItem('pendingLevelUp', String(newLevel));
            }
          }
        }
      } catch (error) {
        console.error("❌ บันทึกล้มเหลว (login grant):", error);
        hasMemberSaved.current = false;
      }
    };

    grantXPOnLogin();
  }, [currentUser]);

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await domToPng(printRef.current, { quality: 1, scale: 2, backgroundColor: "#FCFBF8" });
      
      let shared = false;
      
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `Money-DNA-${nickname}.png`, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "ผลลัพธ์ Money Avatar ของฉัน",
              text: "ดูผลลัพธ์ Money Avatar ของฉันบน Upskill with Fuii!"
            });
            shared = true;
          }
        } catch (shareErr) {
          console.error("Web Share failed, fallback to modal/download:", shareErr);
        }
      }

      if (!shared) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          setCapturedImage(dataUrl);
        } else {
          const link = document.createElement("a");
          link.download = `Money-DNA-${nickname}.png`;
          link.href = dataUrl;
          link.click();
        }
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเซฟรูป ลองแคปหน้าจอแทนนะครับ");
    } finally {
      setIsCapturing(false);
    }
  };

  const resetGame = () => {
    setPersona(null); setAnswers([]); setGameState("start"); setMatrixRotation(0); setIsTransitioning(false);
    hasMemberSaved.current = false;
    savedDocRef.current = null;
  };

  const getMatrixClass = (key: string) => {
    const isActive = matchStats?.primary.id === key;
    return `h-11 rounded-xl flex justify-center items-center text-[9px] sm:text-[9.5px] px-1 text-center transition-all ${isActive
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
      if (secondaryResult) {
        resultTexts.push(secondaryResult.bestPartner.name, secondaryResult.bestPartner.desc);
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

  return (
    <div className={`min-h-[100dvh] bg-stone-950 flex flex-col items-center justify-center sm:p-4 ${promptFont.className}`}>
      <div className={`w-full max-w-md shadow-2xl overflow-hidden h-[100dvh] sm:h-[850px] flex flex-col relative sm:rounded-[2.5rem] sm:border-[4px] sm:border-stone-800 ${gameState === 'playing' ? 'bg-[#F4F3ED]' : 'bg-[#FCFBF8]'}`}>
        
        {gameState === "start" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 sm:p-8 bg-gradient-to-br from-[#FCFBF8] via-[#F4EDE4] to-[#E8DCC4] overflow-y-auto">
            <div className="flex flex-col items-center justify-center text-center pt-2 pb-4">
              <div className="w-full max-w-[320px] mb-4 relative">
                <Image src="/money-avatar-logo.png" alt="Money Avatar" width={500} height={200} className="w-full h-auto drop-shadow-md" priority />
              </div>
              <button onClick={() => setShowInfo(true)} className="mb-6 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-100/80 hover:bg-amber-200 px-3 py-1.5 rounded-full transition-colors border border-amber-300/50 shadow-sm">
                <Info size={14} /> ทรง AVATAR ทางการเงิน
              </button>

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
                  <div className="relative w-28 sm:w-36 flex items-center pr-8">
                    <div className="relative w-full">
                      <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden border border-stone-700/50 shadow-inner relative">
                        <motion.div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                          initial={{ width: '2%' }}
                          animate={{ width: `${Math.max(2, (answers.length / TOTAL_QUESTIONS) * 100)}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                      <motion.div
                        className="absolute top-1/2 text-[18px] drop-shadow-md z-10"
                        initial={{ left: '0%', rotate: 0, y: '-50%' }}
                        animate={{
                          left: `calc(${Math.max(2, (answers.length / TOTAL_QUESTIONS) * 100)}% - 12px)`,
                          rotate: answers.length * 360,
                          scale: [1, 1.3, 1],
                          y: '-50%'
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
                  <div className="absolute -top-3 left-4 bg-amber-400 text-stone-900 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm">
                    <AlertTriangle size={12} /> Situation
                  </div>
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

        {gameState === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-stone-950 relative overflow-hidden"
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>
            <Loader2 size={52} className="text-amber-500 animate-spin mb-6 z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
            <h2 className="text-xl font-bold text-white mb-2 text-center tracking-wide z-10">กำลังประมวลผล...</h2>
            <p className="text-stone-400 text-[13px] text-center font-light mb-12 z-10">สแกน AVATAR การเงินของคุณ 📉📈</p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="max-w-[280px] text-center z-10 bg-stone-900/60 p-5 rounded-2xl border border-stone-800/80 backdrop-blur-sm shadow-xl"
            >
              <div className="text-amber-500/40 text-4xl leading-none absolute -top-3 -left-2 font-serif">&quot;</div>
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

        {gameState === "result" && currentResult && matchStats && (
          <div className="flex-1 flex flex-col bg-[#FCFBF8] relative overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-60 custom-scrollbar">
              <div ref={printRef} className="flex flex-col bg-[#FCFBF8] w-full relative overflow-hidden">
                <div className={`${currentResult.color} text-white p-6 min-h-[200px] pb-24 text-center flex flex-col items-center relative shadow-lg shrink-0 rounded-b-[2rem]`}>
                  <button onClick={() => setShowJargon(true)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all active:scale-90 backdrop-blur-sm border border-white/20 flex items-center justify-center z-20 shadow-sm">
                    <BookOpen size={18} />
                    {activeJargons.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border border-stone-900 animate-pulse shadow-sm"></span>}
                  </button>
                  <Trophy size={28} className="text-white/80 mb-2 mt-2 drop-shadow-md" />
                  <p className="text-white/90 text-[10px] font-semibold tracking-widest uppercase mb-3 opacity-80">Money Avatar</p>
                  <p className="relative z-20 whitespace-nowrap text-white/95 text-[11px] bg-black/50 px-4 py-1.5 rounded-full font-medium tracking-wide border border-white/10">{currentResult.subtitle}</p>
                </div>

                <div className="p-5 pt-10 flex flex-col relative">
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-[6px] border-[#FCFBF8] z-10 overflow-hidden">
                    {avatarImages[matchStats.primary.id] ? (
                      <img
                        src={avatarImages[matchStats.primary.id]}
                        alt={currentResult.title}
                        className="object-contain w-[85%] h-[85%]"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <span className="text-6xl">{currentResult.emoji}</span>
                    )}
                  </div>

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

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 mb-3 text-center">
                    <p className="text-[13px] text-stone-600 leading-relaxed font-light">
                      {highlightText(currentResult.desc)}
                    </p>
                  </div>

                  <div className="bg-sky-50/60 border border-sky-100 p-4 rounded-2xl mb-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-sky-400"></div>
                    <p className="text-[11px] font-bold text-sky-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                      <Zap size={14} className="text-sky-500" /> หลุมพรางทางการเงิน
                    </p>
                    <p className="font-bold text-sky-900 text-[13px] mb-1">{currentResult.kryptonite.name}</p>
                    <p className="text-[12px] text-sky-800/80 leading-relaxed font-light">
                      {highlightText(currentResult.kryptonite.desc, "font-bold text-sky-900 bg-sky-200/50 px-1 rounded-sm")}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 mb-4 overflow-hidden text-center">
                    <h3 className="font-bold text-stone-800 mb-4 text-[13px] border-b border-stone-100 pb-3 flex items-center justify-between w-full">
                      <div className="flex items-center gap-2"><span className="text-[16px]">🧭</span> พิกัดตัวตนการเงิน</div>
                      <button onClick={() => setShowInfo(true)} className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors font-medium active:scale-95"><Info size={12} /></button>
                    </h3>

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
                          <div className={getMatrixClass('MID_RISK_MID_DISC')}>สุดสมดุล</div>
                          <div className={getMatrixClass('MID_RISK_HIGH_DISC')}>นักปั้นพอร์ต</div>
                          <div className={getMatrixClass('LOW_RISK_LOW_DISC')}>ผู้ประสบภัย</div>
                          <div className={getMatrixClass('LOW_RISK_MID_DISC')}>สายเซฟโซน</div>
                          <div className={getMatrixClass('LOW_RISK_HIGH_DISC')}>พิทักษ์เงินต้น</div>
                        </motion.div>
                      </div>
                      <div className="flex justify-between items-center w-full max-w-[280px] mt-3 px-3 text-[10px] font-bold text-stone-400 tracking-widest ml-10">
                        <span>💖 ใช้ตามฟีล</span>
                        <span>➔</span>
                        <span>มีระบบ ⚙️</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-stone-400 text-center mt-3 italic mb-1">ลองจิ้มที่ตารางเพื่อหมุนโลกการเงินดูสิ! 💫</p>

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

                  <div className="mb-6 mt-4">
                    <AssessmentResultCTA currentUser={currentUser} completedType="money" />
                  </div>

                  <div className="mt-2 text-center text-stone-400 text-[9px] uppercase tracking-widest font-semibold pb-4">Created by อัพสกิลกับฟุ้ย</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl p-4 border-t border-stone-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex flex-col gap-2.5 z-30">
              <button onClick={handleDownloadImage} disabled={isCapturing} className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold py-3.5 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all text-[14px] shadow-lg disabled:opacity-50"><Camera size={18} /> {isCapturing ? "กำลังประมวลผลรูปภาพ..." : "เซฟรูปอวดเพื่อนลง Story"}</button>
              <button onClick={resetGame} className="w-full bg-stone-100 text-stone-600 font-semibold py-3 rounded-xl text-center text-[12px] flex items-center justify-center gap-1.5 hover:bg-stone-200 transition-colors"><RefreshCcw size={14} /> สแกน AVATAR อีกครั้ง</button>
            </div>
          </div>
        )}
      </div>

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
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#FCFBF8]">
                {Object.entries(resultData).map(([key, type]) => (
                  <div key={key} className="bg-white p-4 rounded-2xl border border-stone-100 flex items-start gap-4 shadow-sm hover:border-amber-200 transition-colors">
                    <div className="w-16 h-16 shrink-0 bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 flex items-center justify-center">
                      <img
                        src={avatarImages[key]}
                        alt={type.title}
                        className="w-14 h-14 object-contain"
                        onError={(e) => { e.currentTarget.src = "/avatars/default.png" }}
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

      <AnimatePresence>
        {showJargon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowJargon(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-[340px] max-h-[75vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-2 border-sky-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-slate-900 p-5 flex justify-between items-center shrink-0 border-b border-sky-500/20">
                <h3 className="font-bold text-[16px] text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-sky-400" />
                  <span className="bg-gradient-to-r from-sky-200 to-sky-400 bg-clip-text text-transparent">
                    คลังศัพท์น่ารู้
                  </span>
                </h3>
                <button
                  onClick={() => setShowJargon(false)}
                  className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-all active:scale-90 text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

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

      {capturedImage && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md"
            onClick={() => setCapturedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-5 rounded-[2rem] shadow-2xl max-w-sm w-full border border-stone-200 flex flex-col items-center gap-4 relative text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setCapturedImage(null)}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-white hover:bg-stone-850 transition-all shadow-md cursor-pointer z-10"
              >
                <X size={16} className="text-white" />
              </button>

              <div>
                <h3 className="text-base font-black text-stone-800 mb-1">✨ บันทึกรูปภาพของคุณ</h3>
                <p className="text-[11px] text-stone-500 font-bold leading-normal">
                  กดค้างที่รูปภาพด้านล่างเพื่อ <span className="text-blue-600 font-bold">&quot;บันทึกไปยังแอพรูปภาพ&quot;</span><br />
                  หรือแคปหน้าจอเพื่อขิงลง Story ได้เลยครับ!
                </p>
              </div>

              <div className="relative w-full max-h-[50vh] overflow-y-auto rounded-2xl border border-stone-200 shadow-inner bg-[#FCFBF8]">
                <img
                  src={capturedImage}
                  alt="Money Avatar Result"
                  className="w-full h-auto object-contain rounded-2xl"
                />
              </div>

              <div className="w-full flex gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.download = `Money-DNA-${nickname}.png`;
                    link.href = capturedImage;
                    link.click();
                  }}
                  className="flex-1 bg-stone-900 text-white font-bold py-3.5 rounded-xl hover:bg-stone-800 transition-all text-[12px] active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                >
                  ดาวน์โหลดตรงอีกครั้ง
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
