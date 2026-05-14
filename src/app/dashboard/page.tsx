"use client";

import { useEffect, useState, useMemo } from "react";
import { db, auth } from "@/lib/firebase";
// แก้ไขบรรทัด Import นี้ให้มี writeBatch ด้วย
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc, increment, writeBatch } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion"; 
import { PieChart, Quote, Users, Wallet, ChevronRight, Sparkles, BookOpen ,RefreshCw, LogOut, BrainCircuit, Target, AlertCircle, CheckCircle2, Circle, Trophy, Flame, Info, Lock, Unlock, X,Zap} from "lucide-react"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

// --- 💡 Dictionaries ---
export const MONEY_DATA: Record<string, any> = {
  HIGH_RISK_HIGH_DISC: {
    title: "เซียนระบบสุดตึง", subtitle: "The System Alpha", color: "bg-purple-600", barColor: "bg-purple-500", emoji: "🧠", titleColor: "text-purple-600",
    desc: "คุณมองเงินเป็น Code ที่ต้องดีบักและรันให้เป๊ะตามแผน จุดแข็งคือความนิ่งที่แยกอารมณ์ออกจากตัวเลขได้อย่างเด็ดขาด ทำให้คุณคุมเกมได้แม้ในสภาวะตลาดที่บ้าคลั่งที่สุด",
    motto: "เงินคือเครื่องจักร และตัวเราคือคนเขียนโค้ดคุมมันอีกที",
    bestPartner: { name: "🤖 บอทเทรด & หุ้นสาย Tech/Growth", desc: "เหมาะกับสินทรัพย์ที่สวิงแรงแต่มีปัจจัยพื้นฐานรองรับ ใช้เครื่องมือ Automation เพื่อตัดการตัดสินใจด้วยอารมณ์ออกไป" },
    kryptonite: { name: "กับดักความสมบูรณ์แบบ (Over-Optimization) ⚡", desc: "การพยายามหาสูตรสำเร็จที่ไม่มีอยู่จริง การยึดติดกับ Logic เดิมๆ โดยไม่เผื่อใจให้เหตุการณ์ที่ไม่คาดฝันอาจทำให้ระบบล่มสลายได้" }
  },
  MID_RISK_HIGH_DISC: {
    title: "นักปั้นพอร์ตมือฉมัง", subtitle: "The Compounder", color: "bg-blue-600", barColor: "bg-blue-500", emoji: "📈", titleColor: "text-blue-600",
    desc: "คุณมองเงินเป็นเมล็ดพันธุ์ที่ต้องใช้เวลาบ่มเพาะ จุดแข็งคือความอึดและพลังดอกเบี้ยทบต้นที่คุณยึดถือเป็นคัมภีร์ ชัยชนะที่ยั่งยืนไม่ได้สร้างเสร็จในวันเดียว",
    motto: "เงินไม่ได้งอกเงยด้วยความเร็ว แต่งอกเงยด้วยความสม่ำเสมอ",
    bestPartner: { name: "📊 กองทุนดัชนี & กลุ่มสินทรัพย์คงทน (Hard Assets)", desc: "เหมาะกับการ DCA สะสมสินทรัพย์ที่โตไปกับเทรนด์โลก ปล่อยให้เวลาและวินัยของคุณทำงาน แล้วมันจะสร้างผลตอบแทนมหาศาล" },
    kryptonite: { name: "อาการริษยาในความรวยเร็ว (Relative Wealth Envy) ⚡", desc: "เมื่อเห็นคนอื่นซิ่งจนรวยข้ามคืน วินัยอาจสั่นคลอน อย่าทิ้งคัมภีร์ที่ฝึกมาเพื่อกระโดดไปไล่ราคาในสิ่งที่ไม่ได้ศึกษา" }
  },
  LOW_RISK_HIGH_DISC: {
    title: "ผู้พิทักษ์เงินต้น", subtitle: "The Vault Guardian", color: "bg-emerald-600", barColor: "bg-emerald-500", emoji: "🛡️", titleColor: "text-emerald-600",
    desc: "คุณมองเงินเป็นปราสาทที่ต้องรักษาฐานที่มั่นให้แข็งแกร่งที่สุด จุดแข็งคือความรอบคอบ คุณคือนอนหลับฝันดีได้เสมอ เพราะรู้ว่าเงินต้นไม่มีวันพัง",
    motto: "ความมั่งคั่งที่แท้จริง คือการนอนหลับฝันดีโดยไม่ต้องกังวลเรื่องเงิน",
    bestPartner: { name: "🏦 หุ้นกู้เรตติ้งสูง & สลากออมทรัพย์", desc: "เหมาะกับแหล่งผลิตเงินสดความเสี่ยงต่ำ เน้นปกป้องเงินต้นแต่ให้ผลตอบแทนชนะเงินเฟ้อ" },
    kryptonite: { name: "ภัยเงียบจากอำนาจการซื้อที่ลดลง (Inflation) ⚡", desc: "การกอดเงินสดไว้แน่นเกินไปคือการเปิดประตูให้เงินเฟ้อมากัดกินมูลค่าเงิน ความกลัวการขาดทุนระยะสั้นอาจทำให้คุณขาดทุนมหาศาลในระยะยาว" }
  },
  HIGH_RISK_MID_DISC: {
    title: "ล่าเทรนด์(ติดดอย)", subtitle: "The Trend Surfer", color: "bg-rose-500", barColor: "bg-rose-400", emoji: "🏄‍♂️", titleColor: "text-rose-500",
    desc: "คุณมองเงินเป็นคลื่นที่ต้องกระโดดขึ้นไปขี่ให้ทันเวลา จุดแข็งคือความไวและความกล้าที่พร้อมรุกในจังหวะที่คนอื่นลังเล แม้จะติดดอยบ้าง แต่ก็พร้อมลุยรอบใหม่เสมอ",
    motto: "ที่ไหนมีกระแส ที่นั่นมีโอกาส (และดอยที่รอให้เราไปพิชิต)",
    bestPartner: { name: "🎢 หุ้นซิ่งตามกระแส & คริปโตฯ เล่นรอบ", desc: "เหมาะกับการเข้าออกไวเพื่อทำกำไรส่วนต่าง แต่ต้องบังคับตัวเองให้มีกฎตัดขาดทุน (Stop-Loss) ที่เฉียบขาดเสมอ" },
    kryptonite: { name: "การเทรดเพื่อแก้มือ (Revenge Trading) ⚡", desc: "เมื่อพลาดแล้วคุณมักจะอยากเอาคืนทันที ความวู่วามนี้จะทำลายแผนที่วางไว้ การพยายามเอาชนะตลาดด้วยอารมณ์จะพาพอร์ตเสียหายหนักกว่าที่ควร" }
  },
  MID_RISK_MID_DISC: {
    title: "มนุษย์สุดสมดุล", subtitle: "The Balanced One", color: "bg-amber-500", barColor: "bg-amber-400", emoji: "⚖️", titleColor: "text-amber-500",
    desc: "คุณมองเงินเป็นจิ๊กซอว์ส่วนหนึ่งของชีวิตที่ต้องวางให้ถูกที่ จุดแข็งคือความยืดหยุ่นที่ทำให้คุณสนุกกับปัจจุบันได้โดยไม่ทิ้งอนาคต บริหารความสุขและพอร์ตได้ดีที่สุด",
    motto: "เงินมีไว้ใช้สร้างชีวิต ไม่ใช่ให้ชีวิตมีไว้เพื่อหาเงินอย่างเดียว",
    bestPartner: { name: "🍱 กองทุนผสม (Mixed Fund) & หุ้นปันผล", desc: "เหมาะกับพอร์ตสำเร็จรูปที่จัดสรรความเสี่ยงมาให้แล้ว ให้คุณได้กระแสเงินสดมาเติมความสุข โดยไม่ต้องปวดหัวบริหารเอง" },
    kryptonite: { name: "กับดักพื้นที่ปลอดภัย (Comfort Zone Trap) ⚡", desc: "ความพอดีอาจกลายเป็นศัตรูของความก้าวหน้า การชิลเกินไปอาจทำให้พอร์ตโตไม่ทันเป้าหมายใหญ่ ลองท้าทายตัวเองด้วยเป้าหมายที่สูงขึ้น" }
  },
  LOW_RISK_MID_DISC: {
    title: "สายโคตรเซฟโซน", subtitle: "The Safety Net", color: "bg-teal-500", barColor: "bg-teal-400", emoji: "🛟", titleColor: "text-teal-500",
    desc: "คุณมองเงินเป็นชูชีพที่ต้องหยิบใช้ได้ทันทียามฉุกเฉิน จุดแข็งคือความอุ่นใจในการบริหารกระแสเงินสด พร้อมรับมือกับทุกพายุด้วยความใจเย็น",
    motto: "ความเสี่ยงต่ำคือเซฟโซน ความสบายใจคือกำไรที่ประเมินค่าไม่ได้",
    bestPartner: { name: "📱 บัญชีเงินฝากดิจิทัล & กองทุนตลาดเงิน", desc: "เหมาะกับการพักเงินที่ให้ดอกเบี้ยสูงกว่าออมทรัพย์ปกติ แต่ยังคงความถอนง่ายใช้คล่อง ตอบโจทย์ความต้องการสภาพคล่องระดับสุดยอด" },
    kryptonite: { name: "อาการเสียดายเงินที่หายไปเพียงเล็กน้อย (Loss Aversion) ⚡", desc: "ความกังวลเมื่อตัวเลขติดลบแม้เพียงนิดเดียวอาจปิดกั้นโอกาสทองในการลงทุนระยะยาว การยึดติดกับความปลอดภัย 100% คือการยอมเสียโอกาส" }
  },
  HIGH_RISK_LOW_DISC: {
    title: "ดมกาวสุดกราฟ", subtitle: "The Degen Gambler", color: "bg-red-600", barColor: "bg-red-500", emoji: "🚀", titleColor: "text-red-600",
    desc: "คุณมองเงินเป็นตั๋วเปลี่ยนชีวิตที่ต้องเดิมพันให้สุดในจังหวะที่ใช่ จุดแข็งคือความกล้าที่ไม่มีใครเทียบได้ และวิสัยทัศน์ที่มองเห็นโอกาสในขณะที่คนอื่นกลัว",
    motto: "เงินน่ะหาใหม่ได้ แต่โอกาสเปลี่ยนชีวิตมันไม่ได้มีมาบ่อยๆ",
    bestPartner: { name: "👽 เหรียญมีมสุดกาว & สินทรัพย์ทางเลือก", desc: "เหมาะกับการเก็งกำไรความเสี่ยงสูงปรี๊ด แนะนำให้ใช้กลยุทธ์แบ่งเงินก้อนเล็กไปซิ่งเพื่อลุ้นเปลี่ยนชีวิตโดยไม่กระทบเงินกินข้าว" },
    kryptonite: { name: "ความเชื่อมั่นในข่าวลือและการแห่ตามกระแส (FOMO) ⚡", desc: "การใช้สัญชาตญาณโดยปราศจากข้อมูลคือการพนัน การ All-in ตามกลุ่มไลน์โดยไม่ศึกษาเองคือจุดตายที่มักจะพาไปจบที่การสูญเสียเงินก้อนใหญ่" }
  },
  MID_RISK_LOW_DISC: {
    title: "ตัวตึงสายเปย์", subtitle: "The Lifestyle Spender", color: "bg-pink-500", barColor: "bg-pink-400", emoji: "🛍️", titleColor: "text-pink-500",
    desc: "คุณมองเงินเป็นรางวัลของการใช้ชีวิตที่ต้องได้สัมผัส จุดแข็งคือความสามารถในการสร้างความสุข รวยในบัญชีสู้รวยประสบการณ์วันนี้ไม่ได้",
    motto: "ความมั่งคั่งคือภาพลวงตา แต่ของที่กดลงตะกร้าคือของจริง",
    bestPartner: { name: "💳 กองทุนลดหย่อนภาษี (ตัดบัตรอัตโนมัติ) & ซื้อทองคำ", desc: "เหมาะกับสินทรัพย์ที่จับต้องได้ หรือใช้วิธีบังคับหักเงินไปลงทุนทันทีที่เงินเดือนออก เพื่อเปลี่ยนความชอบเปย์ให้กลายเป็นสินทรัพย์" },
    kryptonite: { name: "กับดักความสุขชั่วคราว (Lifestyle Creep) ⚡", desc: "เมื่อรายได้เพิ่ม รายจ่ายมักวิ่งตามทันเสมอ การใช้เงินผ่านบัตรเครดิตหรือผ่อนชำระคือหลุมพรางที่จะดึงกระแสเงินสดในอนาคตไปใช้จนไม่เหลือสร้างความมั่งคั่ง" }
  },
  LOW_RISK_LOW_DISC: {
    title: "ผู้ประสบภัยวัยกลางคน", subtitle: "The Survivor", color: "bg-slate-500", barColor: "bg-slate-400", emoji: "🛶", titleColor: "text-slate-600",
    desc: "คุณมองเงินเป็นเกราะประคองชีวิตที่ต้องบริหารให้ผ่านไปได้ จุดแข็งคือทักษะการเอาตัวรอดที่เป็นเลิศ แม้วันนี้จะเหนื่อย แต่หัวใจนักสู้จะพาไปเจอวันที่ดีกว่า",
    motto: "นักสู้วันต่อวัน แค่หมุนเงินรอดไปได้อีกเดือนก็คือชัยชนะแล้ว",
    bestPartner: { name: "🛠️ คอร์สอัพสกิลรายได้ & เงินสำรองฉุกเฉิน", desc: "การลงทุนที่ดีที่สุดตอนนี้ไม่ใช่หุ้น แต่คือการเพิ่มทักษะ (Skill Up) เพื่อหารายได้ทางที่สอง พร้อมกับโปะหนี้ดอกเบี้ยสูงให้ไวที่สุด" },
    kryptonite: { name: "วงจรหนี้สะสมจากการแก้ปัญหาเฉพาะหน้า ⚡", desc: "การจ่ายเพียงขั้นต่ำหรือกู้หนี้ใหม่มาปิดหนี้เก่าคือการสร้างพายุลูกใหญ่ ความกดดันรายวันอาจทำให้มองข้ามดอกเบี้ยทบต้นฝั่งลบที่จะทำให้ฟื้นตัวยาก" }
  }
};

// 💡 เพิ่มข้อมูล DISC ใหม่ที่นี่
export const DISC_DATA: Record<string, any> = {
  D: {
    rpgTitle: "เดอะแบกสายบวก", discTitle: "มนุษย์กลุ่ม D (Dominance)", color: "bg-red-600", barColor: "bg-red-500", emoji: "🚀", titleColor: "text-red-600",
    desc: "คุณคือเครื่องจักรปั่นงาน! ชอบความท้าทาย ตัดสินใจไว เด็ดขาด มั่นใจสูง งานด่วนงานไฟไหม้ขอให้บอก พร้อมบวกเสมอไม่ว่าหน้าไหน!",
    warning: "ระวังหัวร้อนจนเผลอวีน หรือเร่งงานเพื่อนในทีมจนหายใจไม่ทัน ใจร่มๆ บ้างนะลูกพี่!",
    bestPartner: { type: "C", name: "Type C - มนุษย์ Checklist 🧐", desc: "เพื่อนซี้สายซัพ! C จะช่วยอุดรูรั่วหลังบ้าน ให้คุณพุ่งชนเป้าหมายได้เต็มที่" },
    kryptonite: { type: "D", name: "Type D - เดอะแบกสายบวก 🚀", desc: "เสือสองตัวอยู่ถ้ำเดียวกันไม่ได้! พร้อมบวกแย่งกันเป็นผู้นำตลอดเวลา" }
  },
  I: {
    rpgTitle: "รมต. เอนเตอร์เทน", discTitle: "มนุษย์กลุ่ม I (Influence)", color: "bg-orange-500", barColor: "bg-orange-400", emoji: "💃", titleColor: "text-orange-500",
    desc: "คุณคือสีสันของแผนก! มนุษย์โลกสวย ชอบเข้าสังคม สร้างบรรยากาศดีๆ ใครอยู่ใกล้ก็อารมณ์ดี เรื่องงานอาจจะชิว แต่เรื่องปาร์ตี้เราจริงจัง!",
    warning: "รับปากเก่งจนงานล้นมือ ดีเทลตกหล่นบ่อยเพราะมัวแต่เมาท์เพลิน โฟกัสหน่อยนะคุณน้า!",
    bestPartner: { type: "S", name: "Type S - กาวใจประจำออฟฟิศ 🛡️", desc: "ผู้ฟังที่ดี! S จะคอยซัพพอร์ตไอเดียฟุ้งๆ และฟังเรื่องเมาท์ของคุณได้ทั้งวัน" },
    kryptonite: { type: "C", name: "Type C - มนุษย์ Checklist 🧐", desc: "คู่ปรับสายเป๊ะ! C ถามหาแต่ตัวเลขและแผนงาน ซึ่งคุณเกลียดงานเอกสารสุดๆ" }
  },
  S: {
    rpgTitle: "กาวใจประจำออฟฟิศ", discTitle: "มนุษย์กลุ่ม S (Steadiness)", color: "bg-emerald-600", barColor: "bg-emerald-500", emoji: "🛡️", titleColor: "text-emerald-600",
    desc: "คุณคือเซฟโซนของทุกคน! ใจเย็น เป็นผู้ฟังที่ดี ใครมีปัญหาอะไรก็ชอบมาปรึกษา เน้นประนีประนอม รักสงบ เกลียดการเปลี่ยนแปลงกะทันหันสุดๆ",
    warning: "ขี้เกรงใจเกินร้อย ยอมแบกงานคนอื่นไว้เองหมดจนตัวเองหลังหัก หัดเซย์โนบ้างนะ!",
    bestPartner: { type: "I", name: "Type I - รมต. เอนเตอร์เทน 💃", desc: "คนเติมไฟ! I จะช่วยดึงคุณออกจากเซฟโซนมาสนุกกับชีวิตออฟฟิศมากขึ้น" },
    kryptonite: { type: "D", name: "Type D - เดอะแบกสายบวก 🚀", desc: "ตัวทำลายความสงบ! D ชอบสั่งงานด่วนๆ แรงๆ ขัดกับสไตล์คุณที่ชอบทำเป็นสเต็ป" }
  },
  C: {
    rpgTitle: "มนุษย์ Checklist", discTitle: "มนุษย์กลุ่ม C (Compliance)", color: "bg-blue-600", barColor: "bg-blue-500", emoji: "🧐", titleColor: "text-blue-600",
    desc: "คุณคือเครื่องจับผิด! สายวิเคราะห์ รอบคอบ มีแผนเสมอ ทุกอย่างต้องมี Reference ผิดมิลลิเมตรเดียวก็ไม่ได้ เจ้าระเบียบยืนหนึ่ง!",
    warning: "ยึดติดความเป๊ะจนลืมดูเวลา มัวแต่จัดหน้ากระดาษและแก้ฟอนต์จนเกือบตกเดดไลน์!",
    bestPartner: { type: "D", name: "Type D - เดอะแบกสายบวก 🚀", desc: "คู่หูทำยอด! คุณวางแผนเป๊ะๆ ให้ ส่วน D จะเป็นคนฟาดฟันเอาผลลัพธ์มาเอง" },
    kryptonite: { type: "I", name: "Type I - รมต. เอนเตอร์เทน 💃", desc: "น่ารำคาญใจ! I ทำงานปุบปับ ไร้แบบแผน เปลี่ยนใจบ่อยจนแผนคุณพังหมด" }
  },
};

const categoryNames = ["สุขภาพ", "การเงิน", "การงาน", "ครอบครัว", "เพื่อนฝูง", "พัฒนาตนเอง", "จิตใจ", "ช่วยเหลือสังคม"];
export const QUEST_POOL = {
  WHEEL: {
    "สุขภาพ": [
      "ดื่มน้ำ 1 แก้วใหญ่ บริหารสมองให้ตื่นตัว",
      "ยืดเหยียด 2 นาที กระตุ้นพลังงานเข้าร่างกาย",
      "กำหนดเวลาวางมือถือ รับประกันการหลับ 7 ชม.",
      "จัดสรีระการทำงาน ปรับหลังตรงเพื่อบุคลิกภาพ",
      "ลุกเดิน 5 นาที รีเซ็ตสมาธิและสายตา",
      "มื้อถัดไปเน้นโปรตีนและผัก บริหารระดับพลังงาน",
      "พักสายตามองระยะไกล 1 นาที ลดความเครียดสมอง",
      "ทานอาหารแบบไม่เล่นมือถือ ฝึกสติอยู่กับปัจจุบัน",
      "เลือกเดินบันไดแทนลิฟต์ สะสมความอึดให้ร่างกาย",
      "หายใจลึก 5 ครั้ง เคลียร์ความวุ่นวายก่อนเริ่มงาน"
    ],
    "การเงิน": [
      "คัดกรองรายจ่ายสูงสุดวันนี้ จำเป็นหรือแค่ชั่วคราว",
      "ย้ายเงินเก็บส่วนเกิน ไปบัญชีดอกเบี้ยสูงทันที",
      "รวมยอดเงินทุกบัญชี ตรวจสอบสภาพความมั่งคั่ง",
      "ยกเลิกจ่ายรายเดือนที่ไม่ใช้ อุดรอยรั่วทางการเงิน",
      "คัดกรองสลิปโอนเงินเก่า คืนพื้นที่หน่วยความจำ",
      "ตรวจสอบแต้มสะสมที่มี วางแผนใช้ให้คุ้มค่าที่สุด",
      "บริหารงบใช้เงินพรุ่งนี้ และรักษาวินัยตามแผน",
      "เก็บเกี่ยวความรู้เศรษฐกิจ 1 เรื่องเพื่อวางแผนอนาคต",
      "จดลิสต์ของต้องซื้อ ป้องกันการจ่ายตามอารมณ์",
      "ตรวจสอบเงินออมเดือนนี้ ขยับใกล้เป้าแค่ไหน"
    ],
    "การงาน": [
      "คัดเลือก 1 งานสำคัญที่สุด ที่ต้องจบในวันพรุ่งนี้",
      "คัดกรองไฟล์ขยะหน้าจอ คืนความเร็วให้เครื่อง",
      "จัดการข้อความหรือเมลค้างคาให้จบ 5 รายการ",
      "จัดระเบียบพื้นที่ทำงานส่วนที่มือเอื้อมถึงให้ว่าง",
      "จด 1 ความสำเร็จวันนี้ สร้างแรงจูงใจให้ตัวเอง",
      "บริหารเวลาทำงานจดจ่อ 15 นาที โดยปิดแจ้งเตือน",
      "สรุปประเด็นสำคัญที่จะพูด ก่อนเข้าประชุมครั้งหน้า",
      "ส่งสรุปงานสั้นๆ ให้ทีม ลดการตามงานซ้ำซ้อน",
      "คัดกรองขั้นตอนงานที่ล่าช้า และลองตัดออก 1 อย่าง",
      "เช็กตารางงานพรุ่งนี้ และเตรียมเครื่องมือให้พร้อม"
    ],
    "ครอบครัว": [
      "ส่งข้อความสั้นๆ ให้กำลังใจสมาชิกในครอบครัว",
      "งดใช้มือถือเมื่อทานข้าวร่วมกัน ฝึกความใส่ใจ",
      "กล่าวขอบคุณคนในบ้าน ในเรื่องที่เขาทำให้เป็นปกติ",
      "อาสาจัดการธุระในบ้านที่ค้างคาให้จบ 1 อย่าง",
      "แชร์เป้าหมายความสำเร็จสั้นๆ ให้คนในบ้านฟัง",
      "เตรียมของใช้ที่สมาชิกในบ้านจำเป็นติดมือไปฝาก",
      "แบ่งปันความรู้หรือเทคนิคดีๆ ที่เจอให้คนในบ้าน",
      "ตั้งใจฟังคนในบ้านเล่าเรื่อง 5 นาที โดยไม่พูดแทรก",
      "ช่วยคนในบ้านบริหารงบประมาณหรือทรัพยากร",
      "ชวนคนในบ้านวางแผนการเติบโตหรือทริปถัดไป"
    ],
    "เพื่อนฝูง": [
      "ทักทายคนรู้จักเก่า เพื่อรักษาเครือข่ายสัมพันธ์",
      "สนับสนุนผลงานเพื่อนในโซเชียล ด้วยคำชื่นชม",
      "แชร์โอกาสหรืองานที่เป็นประโยชน์ให้กลุ่มเพื่อน",
      "จดชื่อและความสนใจ เพื่อนใหม่ที่เพิ่งเจอ 1 คน",
      "ขอบคุณคนที่เคยให้คำปรึกษา หรือแนะนำโอกาสงาน",
      "นัดวันแลกเปลี่ยนความรู้ หรือกินข้าวล่วงหน้า",
      "แชร์บทความที่เพื่อนสนใจ และน่าจะได้ประโยชน์",
      "คุยเรื่องทิศทางสายอาชีพกับเพื่อน เพื่อเปิดมุมมอง",
      "ร่วมยินดีกับความสำเร็จของผู้อื่นจากใจจริง",
      "เช็กวันสำคัญของเพื่อนในสัปดาห์นี้และจดบันทึกไว้"
    ],
    "พัฒนาตนเอง": [
      "เก็บเกี่ยวความรู้จากสรุปหนังสือหรือบทความ 1 หน้า",
      "ฟังความรู้ที่เป็นประโยชน์ ช่วงรอยต่อของวัน 5 นาที",
      "ลองให้ AI ช่วยวางแผนหรือสรุปงานยากๆ ให้ 1 ครั้ง",
      "บันทึก 1 คำสั่ง AI (Prompt) ที่ใช้แล้วได้ผลดี",
      "เช็กข่าวเทคโนโลยีใหม่ 1 อย่าง ที่กระทบงานเรา",
      "จดบทเรียนจากข้อผิดพลาดวันนี้ เพื่อไม่ให้เกิดซ้ำ",
      "ทดลองใช้ฟีเจอร์ใหม่ ในเครื่องมือที่ทำงานประจำ",
      "กำหนด 1 เป้าหมายย่อย ที่ต้องจบภายในพรุ่งนี้",
      "ฝึกทักษะที่ช่วยเพิ่มรายได้ วันละ 5 นาที",
      "สะท้อนข้อดีของตัวเอง 1 ข้อที่พบจากการทำงานวันนี้"
    ],
    "จิตใจ": [
      "นั่งนิ่งสังเกตลมหายใจ 1 นาที เพื่อเรียกสมาธิ",
      "จดบันทึก 1 เรื่องที่รู้สึกขอบคุณหรือโชคดีวันนี้",
      "งดใช้หน้าจอก่อนนอน 15 นาที เพื่อคุณภาพการหลับ",
      "ยิ้มให้ตัวเองในกระจก ชื่นชมความพยายามวันนี้",
      "ฟังดนตรีที่ช่วยให้สมองมีสมาธิทำงานสูง 1 เพลง",
      "ให้อภัยตัวเองกับเรื่องที่คุมไม่ได้ และพลาดไป",
      "สำรวจอารมณ์ตัวเองตอนนี้ และยอมรับโดยไม่ตัดสิน",
      "งดรับข้อมูลลบหรือดราม่า ในระหว่างมื้ออาหาร",
      "เขียนเรื่องกังวลลงกระดาษ เพื่อลดภาระในสมอง",
      "จดจ่อกับสิ่งที่ทำตรงหน้า 100% เป็นเวลา 5 นาที"
    ],
    "ช่วยเหลือสังคม": [
      "เรียกชื่อพนักงานและขอบคุณ ด้วยความจริงใจ",
      "แชร์เทคนิคที่ช่วยให้คนอื่นประหยัดเวลาทำงาน",
      "ช่วยตอบคำถามหรือแก้ปัญหา ให้คนในกลุ่มออนไลน์",
      "ให้คำชมร้านค้าที่บริการดี เพื่อสนับสนุนคนทำงาน",
      "แยกประเภทขยะก่อนทิ้ง เพื่อสนับสนุนส่วนรวม",
      "ปิดไฟหรือเครื่องใช้ไฟฟ้าทันที เมื่อไม่ใช้งาน",
      "อุดหนุนร้านค้ารายย่อย หรือผู้ประกอบการในพื้นที่",
      "พกถุงผ้าหรือกระบอกน้ำ เพื่อลดขยะในวันนี้",
      "รักษามารยาทสังคมอย่างเคร่งครัด แม้ไม่มีใครมอง",
      "แนะนำโอกาสหรือช่องทางทำเงิน ให้คนที่มองหา"
    ]
  },

  DISC: {
    "D": [
      "ฝึกฟังจบก่อนแสดงความเห็น หรือเสนอไอเดียแย้ง",
      "กล่าวชมความตั้งใจ ของทีมงานหรือพาร์ทเนอร์",
      "มอบหน้าที่ให้คนอื่นทำ โดยไม่เข้าไปคุมรายละเอียด",
      "ถาม 'คุณคิดอย่างไร' ก่อนจะตัดสินใจสรุปงานเอง",
      "ทักทายเรื่องทั่วไปสั้นๆ ก่อนเริ่มบทสนทนางาน",
      "หยุดคิด 5 วินาทีก่อนตัดสินใจ เรื่องที่ใช้อารมณ์",
      "แสดงความรับผิดชอบ และเสนอทางแก้เมื่อทำงานพลาด",
      "ใช้น้ำเสียงที่ซอฟต์ลง เมื่อต้องตามงานที่เร่งด่วน",
      "ชมข้อดีก่อนแนะนำจุดแก้ไข ให้คนทำงานด้วย",
      "เปิดใจรับไอเดียต่าง เพื่อหาจุดตกลงที่วิน-วิน"
    ],
    "I": [
      "บริหารเวลาทำงานจดจ่อ 20 นาที โดยไม่แตะมือถือ",
      "คัดกรองประเด็นที่จะพูด ให้กระชับก่อนเริ่มงาน",
      "เช็กความถูกต้องของข้อมูล ก่อนส่งงานเสมอ",
      "ปฏิเสธนัดที่ไม่เกี่ยวกับเป้าหมายหลักวันนี้",
      "จดสรุปสิ่งที่ตกลงกัน ทันทีหลังจบการสนทนา",
      "งดคุยเล่นชั่วคราว เพื่อเร่งงานสำคัญให้จบตามนัด",
      "จัดระเบียบไฟล์งาน เพื่อให้ทีมคนอื่นหาเจอง่าย",
      "รักษาวินัยเรื่องเวลา ในทุกนัดหมายอย่างเคร่งครัด",
      "ทำงานให้จบทีละอย่าง ไม่ทำหลายงานพร้อมกัน",
      "ฝึกเล่าใจความสำคัญของงาน ให้จบภายใน 1 นาที"
    ],
    "S": [
      "ตัดสินใจเลือกสิ่งที่ต้องการทันที โดยไม่ลังเล",
      "ลองเสนอ 1 ความเห็นที่แตกต่าง ในระหว่างคุยงาน",
      "ปฏิเสธงานนอกหน้าที่ ถ้าคุณประเมินว่าทำไม่ไหว",
      "เป็นฝ่ายเริ่มทักทายหรือชวนคุย ก่อนเข้าเรื่องงาน",
      "บอกความต้องการจริงๆ เมื่อต้องตัดสินใจร่วมกัน",
      "ขยายขอบเขตความคุ้นเคย ด้วยการทำสิ่งใหม่ 1 อย่าง",
      "อาสารับหน้าที่ใหม่ที่ท้าทาย เพื่ออัปเกรดตัวเอง",
      "ให้ Feedback จุดที่ต้องแก้ อย่างตรงไปตรงมาและสุภาพ",
      "แสดงความมั่นใจในทักษะที่คุณถนัด ให้คนอื่นเห็น",
      "อาสาเป็นคนตัดสินใจเรื่องเล็กๆ แทนคนอื่นในกลุ่ม"
    ],
    "C": [
      "ส่งงานตามกำหนด แม้ยังไม่สมบูรณ์ร้อยเปอร์เซ็นต์",
      "ชวนเพื่อนร่วมงานคุยเรื่องทั่วไป เพื่อสร้างสัมพันธ์",
      "ยอมรับการเปลี่ยนแผนงานทันที โดยไม่หงุดหงิด",
      "มองผลลัพธ์ภาพรวมงาน มากกว่าจับผิดจุดเล็กน้อย",
      "สื่อสารความกังวลหรือปัญหาที่มี ออกมาตรงๆ",
      "ลดเวลาจัดรูปแบบงาน เน้นเนื้อหาสำคัญให้มากขึ้น",
      "ลองวิธีทำงานใหม่ ที่ต่างจากขั้นตอนเดิมเป๊ะๆ",
      "ตัดสินใจจากข้อมูลที่มีตอนนี้ ไม่รอจนครบถ้วนที่สุด",
      "ยิ้มและสบตาขณะคุยงาน สร้างบรรยากาศเชิงบวก",
      "ให้อภัยข้อผิดพลาดเล็กๆ ของตัวเองและทีม"
    ]
  },

  MONEY: {
    "HIGH_RISK_HIGH_DISC": [
      "ประเมินตรรกะในแผนลงทุน ว่ายังตรงกลยุทธ์ไหม",
      "รักษาวินัยตามแผน โดยไม่ใช้อารมณ์ตัดสินใจ",
      "จด 1 เหตุผลที่แท้จริง ที่เลือกซื้อหรือขายล่าสุด",
      "ตรวจสอบระบบอัตโนมัติ ว่ายังทำงานได้เป๊ะตามแผน",
      "วิเคราะห์จุดอ่อนแผนการเงิน และวางแนวทางแก้ไข",
      "เช็กค่าธรรมเนียมพอร์ต ว่ายังอยู่ในระดับที่เหมาะสม",
      "จดสถานการณ์แย่สุด ที่แผนการเงินยังรับไหว",
      "ยืนยันจุดตัดขาดทุน และทำทันทีถ้าถึงจุดนั้น",
      "ศึกษาที่มาสินทรัพย์ใหม่ 5 นาทีก่อนคิดลงทุน",
      "หยุดดูราคาตลาด 2 ชั่วโมง ฝึกความนิ่งของจิตใจ"
    ],
    "MID_RISK_HIGH_DISC": [
      "คำนวณเงินที่จะโตใน 5 ปี ถ้าออมสม่ำเสมอแบบนี้",
      "รักษาวินัยการออมตามกำหนดเดิม โดยห้ามมีข้ออ้าง",
      "ซื้อสินทรัพย์พื้นฐานดี สะสมเพิ่มทีละนิดในวันนี้",
      "อ่านแนวคิดลงทุนระยะยาว ยึดมั่นในแผนวินัยเดิม",
      "เช็กการกระจายความเสี่ยงพอร์ต ว่าสมดุลดีไหม",
      "อัปเดตยอดเงินรวมทุกบัญชี ลงในบันทึกส่วนตัว",
      "เช็กผลตอบแทนล่าสุด ว่าตรงตามเป้าที่วางไว้ไหม",
      "อ่านบทวิเคราะห์การเงินที่เชื่อถือได้ ย้ำความเชื่อมั่น",
      "ตั้งเป้าหมายการเงินที่ชัดเจน สำหรับ 3 เดือนข้างหน้า",
      "ตรวจสอบว่าเดือนที่ผ่านมา ทำได้ตามแผนที่วางไว้ไหม"
    ],
    "LOW_RISK_HIGH_DISC": [
      "เช็กดอกเบี้ยเงินฝาก ที่ไหนให้ผลตอบแทนสูงสุด",
      "ตรวจสอบความมั่นคงธนาคารหรือแอป ที่ฝากเงินอยู่",
      "คำนวณว่าตอนนี้ของแพงขึ้น มีผลกับอำนาจซื้อแค่ไหน",
      "มองหาแหล่งฝากเงินหรือพันธบัตร ที่ปลอดภัยเพิ่ม 1 แห่ง",
      "เช็กวันครบกำหนดเงินฝากประจำ หรือพันธบัตร",
      "ตรวจสอบความน่าเชื่อถือ สินทรัพย์ปลอดภัยที่ถืออยู่",
      "วางแผนเรื่องภาษีจากผลตอบแทน ให้คุ้มค่าที่สุด",
      "จดเป้าหมายรักษาเงินต้น ให้ปลอดภัยในระยะยาว",
      "เช็กวิธีประหยัดภาษีที่เป็นช่องทางใหม่ สำหรับคุณ",
      "ยืนยันว่าเงินสำรองอยู่ในที่ปลอดภัย และถอนง่าย"
    ],
    "HIGH_RISK_MID_DISC": [
      "กำหนดจุดขายทำกำไรชัดเจน และรักษาวินัยเมื่อถึงเป้า",
      "งดการลงทุนเพิ่ม เพียงเพื่อหวังจะแก้มือจากที่เคยพลาด",
      "จดความรู้สึกตัวเอง ก่อนตัดสินใจลงทุนในของเสี่ยง",
      "ปิดแอปดูราคาตลาด 1 ชั่วโมง เพื่อลดความฟุ้งซ่าน",
      "แบ่งกำไรไปเก็บในบัญชีเงินออม ที่ปลอดภัยทันที",
      "เช็กข่าวที่ส่งผลกระทบ กับสิ่งที่คุณลงทุนอยู่",
      "ประเมินว่าสินทรัพย์ในมือ เปลี่ยนเป็นเงินสดได้ไวไหม",
      "หาจุดพลาดจากการตัดสินใจล่าสุด จดไว้เตือนใจตัวเอง",
      "ตั้งเตือนราคาแทนการจ้องหน้าจอราคา ตลอดเวลา",
      "เช็กยอดขาดทุนสูงสุดที่รับได้ ว่ายังโอเคไหม"
    ],
    "MID_RISK_MID_DISC": [
      "คำนวณรายจ่ายเพื่อความสุขวันนี้ เทียบเงินออมอนาคต",
      "ตรวจสอบผลงานพอร์ต ว่าทำได้ดีตามเป้าหมายไหม",
      "ตั้งเป้าหมายขยับฐานะทางการเงิน ให้เก่งขึ้นอีก 1 ขั้น",
      "กันเงินเล็กน้อยเรียนทักษะใหม่ ที่ช่วยสร้างรายได้เพิ่ม",
      "วิเคราะห์ว่าถ้าเกิดเหตุไม่คาดฝัน แผนเราจะยังรอดไหม",
      "เช็กยอดรายได้เดือนนี้ ว่าครบถ้วนตามจริงไหม",
      "ศึกษาการลงทุนแบบใหม่ ที่ไม่เสี่ยงเกินไป 1 อย่าง",
      "เช็กความคุ้มค่าประกัน ว่าเบี้ยคุ้มกับความเสี่ยงไหม",
      "หาค่าใช้จ่ายไม่จำเป็น 1 อย่าง และตัดทิ้งทันที",
      "ดูความคืบหน้าเป้าหมายการเงินใหญ่ ของตัวเอง"
    ],
    "LOW_RISK_MID_DISC": [
      "เช็กเงินสำรองฉุกเฉิน ว่าพอใช้ไปอีก 6-12 เดือนไหม",
      "หาที่ฝากเงินดอกเบี้ยสูง ความเสี่ยงต่ำเพิ่ม 1 แห่ง",
      "ดูว่าสินทรัพย์ที่มี เปลี่ยนเป็นเงินสดได้ภายในกี่วัน",
      "แบ่งเงิน 5-10% ไปลงทุนในสิ่งที่ให้ผลตอบแทนสูงขึ้น",
      "จัดระเบียบแอปธนาคารให้ใช้ง่าย ค้นหาข้อมูลได้ไว",
      "ตรวจสอบยอดเงินออม ที่พร้อมหยิบมาใช้ได้ทันที",
      "เช็กค่าธรรมเนียมที่ไม่ได้ใช้ และยกเลิกทิ้งทันที",
      "จดรายจ่ายจำเป็นสุด 5 อย่าง เตรียมรับมือเหตุฉุกเฉิน",
      "ประเมินความมั่นคงรายได้ ท่ามกลางเศรษฐกิจเปลี่ยน",
      "เช็กยอดเงินคงเหลือ ในแอปกระเป๋าเงินออนไลน์ทุกแอป"
    ],
    "HIGH_RISK_LOW_DISC": [
      "แยกเงินเสี่ยงออกจากเงินใช้ชีวิต อย่างเด็ดขาด",
      "งดการตัดสินใจซื้อตามกระแส โดยไม่ศึกษาเอง 1 วัน",
      "จด 1 เหตุผลจริงที่เลือกลงทุน (ห้ามใช้อารมณ์)",
      "ตั้งเป้ากำไรแล้วถอนเงินต้นออกมาเก็บ เมื่อถึงจุดนั้น",
      "ประเมินว่าความเสี่ยงตอนนี้ คุ้มผลตอบแทนที่ได้ไหม",
      "เช็กความปลอดภัยรหัสผ่าน และบัญชีการเงินต่างๆ",
      "ถามตัวเองว่าถ้าเงินก้อนนี้หายหมด เรายังรอดไหม",
      "หาข้อมูลสิ่งที่คุณลงทุน ให้เข้าใจลึกซึ้งกว่าเดิม",
      "เลิกดูโซเชียลที่อวดกำไร เพื่อรักษาสภาวะจิตใจ",
      "ดูว่ากำไรสะสมในพอร์ตตอนนี้ มากกว่าเงินต้นหรือยัง"
    ],
    "MID_RISK_LOW_DISC": [
      "ตั้งระบบหักเงินไปออมอัตโนมัติ ทันทีที่รายได้ออก",
      "จ่ายหนี้บัตรเครดิตให้เหลือน้อยที่สุด เลี่ยงดอกแพง",
      "ทิ้งของในรถเข็นออนไลน์ 24 ชม. ก่อนตัดสินใจซื้อ",
      "เปลี่ยนงบของฟุ่มเฟือย มาซื้อทองหรือสินทรัพย์สะสม",
      "จดรายจ่ายวันนี้ ดูว่าหมดเงินไปกับสิ่งของเท่าไหร่",
      "ยกเลิกแอปเสียเงินที่ไม่ได้ใช้ เกิน 1 เดือน",
      "คำนวณว่าของที่อยากได้ ต้องแลกกับชั่วโมงทำงานเท่าไหร่",
      "เช็กแต้มบัตรเครดิต และใช้สิทธิพิเศษที่คุ้มที่สุด",
      "ลดรายจ่ายประจำในบ้าน ที่สามารถทำได้ทันที",
      "ตั้งเป้าหมายออมเงินซื้อของชิ้นใหญ่ ที่อยากได้จริง"
    ],
    "LOW_RISK_LOW_DISC": [
      "จด 3 ทักษะที่ตัวเองเก่ง และใช้หารายได้เสริมได้ทันที",
      "วางแผนจ่ายหนี้ที่มีดอกเบี้ยแพงที่สุด ก่อนอันดับแรก",
      "จดรายรับรายจ่ายทันที ที่เกิดการใช้จ่ายขึ้นในวันนี้",
      "เช็กวิธีลดภาษีหรือสิทธิที่รัฐช่วย ซึ่งเรายังไม่ใช้",
      "เก็บเงินสำรองก้อนเล็ก 1,000 บาทแรก ให้ได้ในเดือนนี้",
      "เปรียบเทียบราคาสินค้าจำเป็น จาก 2 ร้านก่อนซื้อ",
      "เช็กวันสุดท้ายจ่ายบิล เพื่อเลี่ยงค่าปรับสะสม",
      "หาทางประหยัดค่ากินหรือเดินทางวันนี้ ให้ได้ 20 บาท",
      "ดูว่าทักษะที่มีอยู่ ตลาดต้องการและให้ค่าตัวเท่าไหร่",
      "จดรายการของจำเป็น ที่ต้องรอซื้อช่วงจัดโปรโมชั่น"
    ]
  },

  WILDCARD: [
    "คัดกรองยกเลิกรับเมลโฆษณา 3 แห่ง คืนพื้นที่สมอง",
    "ลบรูปภาพหรือแอปไม่ใช้ 10 อย่าง คืนความเร็วเครื่อง",
    "ยิ้มและปรับบุคลิกหน้ากระจก เรียกความมั่นใจเริ่มวัน",
    "เดินขึ้นบันไดแทนลิฟต์ 1 ชั้น กระตุ้นพลังงานร่างกาย",
    "ทานมื้ออาหารโดยไม่เปิดดูหน้าจอ ฝึกสมาธิจดจ่อ",
    "จัดระเบียบของรกบนพื้นที่ทำงาน 1 อย่าง ให้เข้าที่",
    "สูดลมหายใจลึก 3 ครั้ง ก่อนเริ่มต้นงานชิ้นใหม่",
    "สั่งเครื่องดื่มไม่ใส่น้ำตาล เพื่อคุมระดับพลังงาน",
    "เปลี่ยนภาพหน้าจอมือถือ เป็นรูปเป้าหมายที่อยากสำเร็จ",
    "จัดระเบียบสายชาร์จหรือสายไฟ ไม่ให้รกสายตา",
    "จดบันทึกขอบคุณตัวเองสั้นๆ 1 ประโยคลงในแอป",
    "ลบแอปที่ไม่ได้เปิดใช้ เกิน 30 วันทิ้งไป",
    "รวมแอปการเงินไว้ในโฟลเดอร์เดียว เพื่อความปลอดภัย",
    "ล้างแก้วน้ำหรือจานที่ใช้เสร็จทันที ฝึกวินัยการจบงาน",
    "ปิดไฟหรือถอดปลั๊กอุปกรณ์ที่ไม่ใช้ ประหยัดทรัพยากร",
    "ลบไฟล์ที่โหลดมาใช้งาน ครั้งเดียวทิ้งให้หมด",
    "จด 3 งานสำคัญที่ต้องทำให้สำเร็จ ในวันพรุ่งนี้",
    "เช็กและเช็ดหน้าจอมือถือ ให้สะอาดใสไร้คราบ",
    "จดบันทึก 1 เรื่องดีๆ ที่ทำให้คุณมีความสุขวันนี้",
    "จัดระเบียบโฟลเดอร์งานในคอม ให้ค้นหาไฟล์ง่ายขึ้น"
  ],

  CHALLENGE: [
    "ประกาศเป้าหมายสั้นๆ 1 อย่าง ให้เพื่อนหรือคนใกล้ตัวรู้",
    "รีเช็กเป้าหมาย 1 ปีที่ตั้งไว้ ว่ายังใช่ทางเดิมอยู่ไหม",
    "จดสิ่งที่ทำพลาดวันนี้ และวิธีที่จะไม่พลาดซ้ำพรุ่งนี้",
    "เตรียม 3 เหตุผล เพื่อโน้มน้าวใจในไอเดียของคุณ",
    "ลองเล่าไอเดียใหม่ให้เพื่อนฟัง แบบสรุปใจความง่าย",
    "ฟังแล้วทวนสิ่งที่อีกฝ่ายต้องการจริงๆ เพื่อรีเช็กความเข้าใจ",
    "ขอคำแนะนำจากคนที่เก่งกว่า ในเรื่องที่อยากพัฒนา",
    "ลองแก้ปัญหาความไม่เข้าใจกัน ด้วยเหตุผลแทนอารมณ์",
    "ฝึกควบคุมอารมณ์ให้สงบ ในสถานการณ์ที่กดดัน",
    "ฝึกพูดสรุปงานสำคัญ ให้ชัดเจนภายในเวลา 2 นาที",
    "ทักทายทำความรู้จักคนเก่งในสายงาน เพื่อเปิดมุมมอง",
    "ลองแก้ปัญหาที่เจอ ด้วยวิธีใหม่ที่คุณไม่เคยทำมาก่อน",
    "เลือกตัดงานไม่สำคัญทิ้ง โฟกัสงานที่สร้างผลลัพธ์จริง",
    "ลองพยายามทำความเข้าใจ มุมมองคนที่เห็นต่างจากคุณ",
    "อาสานำการคุยหรือตัดสินใจ ในกลุ่มงานสั้นๆ 1 อย่าง",
    "วิเคราะห์จุดแข็งจุดอ่อน ของแผนงานที่ใช้อยู่ปัจจุบัน",
    "ลองตั้งคำถามใหม่ๆ เพื่อมองปัญหาเดิมในมุมที่ต่างออกไป",
    "บริหารเวลาแบบทำงาน 25 นาที สลับพัก 5 นาที",
    "อาสาสอนทักษะหรืองานที่คุณถนัด ให้เพื่อนร่วมทีม",
    "ตัดสินใจเรื่องสำคัญ โดยเขียนข้อดีข้อเสียเปรียบเทียบกัน",
    "ลองเปลี่ยนวิธีทำงานเดิม ไปใช้วิธีใหม่ที่ดีและไวกว่า",
    "ฝึกตั้งคำถามกับข้อมูลที่ได้รับ ก่อนจะเชื่อในทันที",
    "ตรวจสอบดูว่าเป้าหมายเดือนนี้ สำเร็จไปกี่เปอร์เซ็นต์แล้ว"
  ]
};


// 💡 ฟังก์ชันแปลงข้อความ AI ให้สวยงาม (ไฮไลต์คำ, ใส่กรอบ, จัดบรรทัด)
const formatAnalysisText = (text: string) => {
  if (!text) return null;

  return text.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine === '') return <div key={index} className="h-2"></div>;

    // เช็กว่าบรรทัดนี้คือหัวข้อหรือไม่ (ขึ้นต้นด้วย Emoji พวกนี้)
    const isHeaderLine = trimmedLine.match(/^(📌|💡|📅|🔥)/);
    const isListItem = trimmedLine.startsWith('-');
    
    let contentToProcess = trimmedLine;
    let headerElement = null;

    if (isHeaderLine) {
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex !== -1 && colonIndex < 40) { 
        const headerPart = trimmedLine.substring(0, colonIndex + 1);
        contentToProcess = trimmedLine.substring(colonIndex + 1).trim();
        headerElement = (
          <div className="mt-4 mb-2 pb-1 border-b border-dashed border-red-200 text-red-800 text-[15px] font-bold text-left">
            {headerPart.replace(/\*\*/g, '')}
          </div>
        );
      } else {
        return (
          <div key={index} className="mt-4 mb-2 pb-1 border-b border-dashed border-red-200 text-red-800 text-[15px] font-bold text-left">
            {trimmedLine.replace(/\*\*/g, '')}
          </div>
        );
      }
    }

    // ฟังก์ชันย่อยสำหรับทำไฮไลต์พื้นหลังสีแดงอ่อน ตอนเจอ **ข้อความ**
    const renderContent = (textToRender: string) => {
      const parts = textToRender.split('**');
      return parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-red-800 bg-red-50 px-1.5 py-0.5 rounded-md font-semibold mx-0.5 inline-block leading-tight">
            {part}
          </span>
        ) : (
          <span key={i} className="font-light">{part}</span>
        )
      );
    };

    return (
      <div key={index} className="text-left">
        {headerElement}
        {contentToProcess && (
          <div className={`mb-2 leading-relaxed text-[13px] text-slate-700 ${isListItem ? 'pl-4' : ''}`}>
            {renderContent(contentToProcess)}
          </div>
        )}
      </div>
    );
  });
};

export default function DashboardPage() {
 useEffect(() => {
  window.scrollTo(0, 0);
}, []);
 
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [lastWheel, setLastWheel] = useState<any>(null);
  const [lastQuote, setLastQuote] = useState<any>(null);
  const [lastDisc, setLastDisc] = useState<any>(null);
  const [lastMoney, setLastMoney] = useState<any>(null);

  const [completedQuests, setCompletedQuests] = useState<number[]>([]);
  const [totalXP, setTotalXP] = useState<number>(0);
  const [showLevelInfo, setShowLevelInfo] = useState(false);

  const [infoModal, setInfoModal] = useState<{isOpen: boolean, title: string, content: string | React.ReactNode} | null>(null);
  const [showLevelUp, setShowLevelUp] = useState<{isOpen: boolean, newLevel: number} | null>(null);

  const [hasClaimedQuoteToday, setHasClaimedQuoteToday] = useState(false); // 💡 เพิ่มบรรทัดนี้
    const [isGoalExpanded, setIsGoalExpanded] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);

      // --- 1. ดึงข้อมูลประเมินทั้งหมด ---
      let wheelData = null;
      let discData = null;
      let moneyData = null;

      try {
        const authWheelRef = collection(db, "users", currentUser.uid, "assessments");
        const authWheelSnap = await getDocs(query(authWheelRef, orderBy("createdAt", "desc"), limit(1)));
        if (!authWheelSnap.empty) wheelData = authWheelSnap.docs[0].data();
        setLastWheel(wheelData);

        const discSnap = await getDocs(query(collection(db, "discResults"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1)));
        if (!discSnap.empty) {
          discData = discSnap.docs[0].data();
          setLastDisc(discData);
        }

        const moneySnap = await getDocs(query(collection(db, "quiz_results"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1)));
        if (!moneySnap.empty) {
          moneyData = moneySnap.docs[0].data();
          setLastMoney(moneyData);
        }

        const quoteSnap = await getDocs(query(collection(db, "quotes"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1)));
        if (!quoteSnap.empty) setLastQuote(quoteSnap.docs[0].data());
      } catch (error) { console.error("Error fetching assessment data:", error); }

      // --- 2. ดึง User Profile และเช็ก XP เก็บตก (First-Time XP) ---
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const todayStr = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Bangkok'});
          
          let xpToClaim = 0;
          let xpUpdates: any = {};

          // เช็ก Wheel of Life XP (50 XP)
          if (wheelData && !userData.hasWheelXP) {
            xpToClaim += 50;
            xpUpdates.hasWheelXP = true;
          }
          // เช็ก DISC XP (50 XP)
          if (discData && !userData.hasDiscXP) {
            xpToClaim += 50;
            xpUpdates.hasDiscXP = true;
          }
          // เช็ก Money Avatar XP (50 XP)
          if (moneyData && !userData.hasMoneyXP) {
            xpToClaim += 50;
            xpUpdates.hasMoneyXP = true;
          }

          // ถ้ามี XP ที่ยังไม่ได้กดรับ ให้บวกเข้า DB ทันที
          if (xpToClaim > 0) {
            await setDoc(userDocRef, {
              ...xpUpdates,
              totalXP: increment(xpToClaim)
            }, { merge: true });
            setTotalXP((userData.totalXP || 0) + xpToClaim);
            console.log(`🎉 ระบบตามเก็บ XP ให้คุณแล้ว: +${xpToClaim} XP`);
          } else {
            setTotalXP(userData.totalXP || 0);
          }

          // จัดการ Daily Quest สถานะ
          if (userData.lastQuestDate === todayStr) {
            setCompletedQuests(userData.completedQuestIds || []);
          } else {
            setCompletedQuests([]);
          }

          if (userData.lastQuoteDate === todayStr) {
            setHasClaimedQuoteToday(true);
          } else {
            setHasClaimedQuoteToday(false);
          }
        }
      } catch (error) { console.error("Error updating XP profile:", error); }

    } else { 
      router.push("/"); 
    }
    setLoading(false);
  });
  return () => unsubscribe();
}, [router]);

  const handleLogout = async () => {
    try { await signOut(auth); router.push("/"); } catch (error) { console.error(error); }
  };

const handleResetAllData = async () => {
    if (!user) return;
    
    // 🚨 ถามให้ชัวร์ก่อนลบ
    const confirmReset = window.confirm(
      "⚠️ คุณแน่ใจหรือไม่ว่าจะ 'รีเซ็ตข้อมูลทั้งหมด' ?\n\n(XP, Level, ผลประเมิน DISC, สไตล์การเงิน, Wheel of Life และ คำคม จะหายไปทั้งหมด และไม่สามารถกู้คืนได้)"
    );
    
    if (!confirmReset) return;

    try {
      setLoading(true);
      const batch = writeBatch(db);

      // 1. รีเซ็ต User Profile (เพิ่มการลบ lastQuoteDate ด้วย)
      const userRef = doc(db, "users", user.uid);
      batch.set(userRef, {
        totalXP: 0,
        hasWheelXP: false,
        hasDiscXP: false,
        hasMoneyXP: false,
        completedQuestIds: [],
        lastQuestDate: null,
        lastQuoteDate: null // ✅ ลบประวัติการกดรับคำคมรายวัน
      }, { merge: true });

      // 2. ลบประวัติ Wheel of Life
      const wheelSnap = await getDocs(query(collection(db, "users", user.uid, "assessments")));
      wheelSnap.forEach((doc) => batch.delete(doc.ref));

      // 3. ลบประวัติ DISC
      const discSnap = await getDocs(query(collection(db, "discResults"), where("userId", "==", user.uid)));
      discSnap.forEach((doc) => batch.delete(doc.ref));

      // 4. ลบประวัติ Money Avatar
      const moneySnap = await getDocs(query(collection(db, "quiz_results"), where("userId", "==", user.uid)));
      moneySnap.forEach((doc) => batch.delete(doc.ref));

      // ✅ 5. ลบประวัติคำคม (คมสัดสัด)
      const quoteSnap = await getDocs(query(collection(db, "quotes"), where("userId", "==", user.uid)));
      quoteSnap.forEach((doc) => batch.delete(doc.ref));

      // 💥 สั่งประหาร! (Execute)
      await batch.commit();

      // 6. เคลียร์ State หน้าจอทั้งหมดให้เป็นหน้าว่าง
      setTotalXP(0);
      setLastWheel(null);
      setLastDisc(null);
      setLastMoney(null);
      setLastQuote(null); // ✅ เคลียร์ข้อความคำคมหน้าจอ
      setCompletedQuests([]);
      setHasClaimedQuoteToday(false); // ✅ เคลียร์สถานะการกดรับ XP คำคม
      
      alert("♻️ รีเซ็ตข้อมูลเรียบร้อย! คลีนสุดๆ เริ่มต้นใหม่ได้เลยครับ 🚀");
    } catch (error) {
      console.error("Error resetting data:", error);
      alert("เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล ลองใหม่อีกครั้งนะครับ");
    } finally {
      setLoading(false);
    }
  };

  const openInfo = (e: React.MouseEvent, title: string, content: string | React.ReactNode) => {
    e.preventDefault(); 
    e.stopPropagation();
    setInfoModal({ isOpen: true, title, content });
  };

// 💡 Popup สำหรับ Money Avatar (เวอร์ชันสวยขึ้น)
  const openMoneyInfo = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!lastMoney) return;

    const main = MONEY_DATA[lastMoney.resultKey];
    const sec = lastMoney.secondaryKey ? MONEY_DATA[lastMoney.secondaryKey] : null;

    const content = (
      <div className="space-y-6 text-left -mt-2">
        {/* การ์ดตัวตนหลัก */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 overflow-hidden shadow-sm">
          <div className="absolute right-[-10px] bottom-[-20px] text-8xl opacity-10 pointer-events-none">{main.emoji}</div>
          <div className="relative z-10">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-white px-2.5 py-1 rounded-md shadow-sm mb-3 inline-block">ตัวตนหลัก</span>
            <h4 className="font-black text-2xl text-slate-800 mb-1">{main.title}</h4>
            <p className="text-sm font-bold text-amber-600 mb-3">"{main.motto}"</p>
            <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">{main.desc}</p>
            
            <div className="space-y-2.5">
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-green-100 shadow-sm flex gap-3 items-start">
                <div className="p-1.5 bg-green-100 rounded-lg text-green-600 shrink-0"><CheckCircle2 size={16} /></div>
                <div>
                  <span className="font-black text-green-700 text-xs block mb-0.5">คู่หูการลงทุน</span>
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">{main.bestPartner.name} - {main.bestPartner.desc}</span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-red-100 shadow-sm flex gap-3 items-start">
                <div className="p-1.5 bg-red-100 rounded-lg text-red-500 shrink-0"><AlertCircle size={16} /></div>
                <div>
                  <span className="font-black text-red-700 text-xs block mb-0.5">จุดอ่อน</span>
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">{main.kryptonite.name} - {main.kryptonite.desc}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* การ์ดตัวตนรอง (ถ้ามี) */}
        {sec && (
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-10px] text-6xl opacity-[0.03] pointer-events-none">{sec.emoji}</div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2.5 py-1 rounded-md border border-slate-100 mb-3 inline-block">ตัวตนรอง (ซ่อนอยู่)</span>
            <h4 className="font-black text-lg text-slate-800 flex items-center gap-2 mb-2"><span className="text-xl">{sec.emoji}</span> {sec.title}</h4>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed font-medium">{sec.desc}</p>
            <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs flex gap-2">
              <span className="text-amber-500"><Sparkles size={14}/></span>
              <span className="text-slate-500 font-medium leading-relaxed"><span className="font-bold text-slate-700">ทริคเสริมพลัง:</span> {sec.bestPartner.desc}</span>
            </div>
          </div>
        )}
      </div>
    );
    setInfoModal({ isOpen: true, title: "ถอดรหัสสไตล์การเงิน", content });
  };
const openDiscInfo = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!lastDisc) return;
    
    const typeKey = (lastDisc.finalResult || lastDisc.result || "C").charAt(0) as 'D' | 'I' | 'S' | 'C';
    const data = DISC_DATA[typeKey];
    if (!data) return;

    // 🏷️ Mapping ชื่อเต็มของ DISC
    const fullNames = {
      D: "Dominance",
      I: "Influence",
      S: "Steadiness",
      C: "Conscientiousness"
    };

    // 🎨 Theme สีเดิมที่จี๊ดจ๊าดตามสไตล์
    const theme = {
      D: { bg: "from-red-50 to-orange-50", border: "border-red-100", text: "text-red-600", badge: "bg-red-100 text-red-700" },
      I: { bg: "from-amber-50 to-yellow-50", border: "border-amber-100", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
      S: { bg: "from-green-50 to-emerald-50", border: "border-green-100", text: "text-green-600", badge: "bg-green-100 text-green-700" },
      C: { bg: "from-blue-50 to-indigo-50", border: "border-blue-100", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" }
    }[typeKey];

    const content = (
      <div className="space-y-5 text-left -mt-2">
        <div className={`relative p-6 rounded-[2.5rem] bg-gradient-to-br ${theme.bg} border ${theme.border} overflow-hidden shadow-sm`}>
          {/* Background Decor */}
          <div className="absolute right-[-10px] bottom-[-20px] text-8xl opacity-10 pointer-events-none">{data.emoji}</div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
               {/* 🏷️ Badge แบบใหม่: โชว์ชื่อเต็ม Dominance, Influence, etc. */}
               <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full shadow-sm border border-white/50 ${theme.badge}`}>
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-black text-[10px] shadow-sm">
                    {typeKey}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {fullNames[typeKey]} Style
                  </span>
               </div>
               
               {/* ตัวอักษรตัวใหญ่แบบโปร่งแสงนิดๆ */}
               <div className={`hidden sm:flex w-10 h-10 rounded-xl bg-white/50 backdrop-blur-sm items-center justify-center font-black text-xl border ${theme.border} ${theme.text}`}>
                  {typeKey}
               </div>
            </div>

            <h4 className="font-black text-2xl text-slate-800 mb-2 flex items-center gap-2">
               {data.rpgTitle}
            </h4>
            <p className="text-[14px] text-slate-600 leading-relaxed font-medium mb-6">
              {data.desc}
            </p>
            
            <div className="space-y-4">
              {/* Box: ข้อควรระวัง */}
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-sm flex gap-3 items-start">
                <div className="text-amber-500 shrink-0 mt-0.5"><AlertCircle size={20} /></div>
                <div>
                  <span className="font-black text-amber-700 text-[11px] uppercase tracking-wider block mb-0.5">ข้อควรระวัง (Warning)</span>
                  <span className="text-xs text-slate-600 font-bold leading-relaxed">{data.warning}</span>
                </div>
              </div>
              
              {/* Grid: คู่หู & คู่ปรับ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white/90 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="font-black text-blue-600 text-[10px] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={14}/> คู่หูส่งเสริมกัน
                  </span>
                  <span className="text-[13px] text-slate-800 font-black block mb-1">{data.bestPartner.name}</span>
                  <span className="text-[11px] text-slate-500 font-medium leading-snug">{data.bestPartner.desc}</span>
                </div>

                <div className="bg-white/90 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="font-black text-red-500 text-[10px] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Target size={14}/> คู่ปรับที่ต้องระวัง
                  </span>
                  <span className="text-[13px] text-slate-800 font-black block mb-1">{data.kryptonite.name}</span>
                  <span className="text-[11px] text-slate-500 font-medium leading-snug">{data.kryptonite.desc}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    setInfoModal({ isOpen: true, title: "DISC STYLE", content });
  };

  const aiWheelSummary = lastWheel?.analysis || "ระบบกำลังประมวลผลข้อมูล... กรุณาประเมินใหม่อีกครั้งเพื่อรับคำแนะนำจาก AI";

  const focusAreas = useMemo(() => {
    const areas = [];
    if (lastWheel?.currentScores) {
      const scoresWithLabels = lastWheel.currentScores.map((score: number, i: number) => ({ score, label: categoryNames[i] }));
      const lowestThree = scoresWithLabels.sort((a: any, b: any) => a.score - b.score).slice(0, 3);
      const labelsWithScores = lowestThree.map((item: any) => `${item.label} (${item.score}/10)`).join(", ");
      areas.push({ type: 'wheel', title: 'Wheel of Life', desc: `ช่วงนี้ลองจัดเวลาโฟกัสและดูแลด้าน ${labelsWithScores} เพิ่มขึ้นอีกนิดนะครับ`, color: 'bg-red-500', textColor: 'text-red-400' });
    }

    if (lastDisc) {
      const typeKey = (lastDisc.finalResult || lastDisc.result || "C").charAt(0);
      let discWarning = DISC_DATA[typeKey]?.warning || lastDisc?.resultData?.warning || lastDisc?.warning || "ระวังการมองข้ามรายละเอียดเล็กๆ น้อยๆ";
      areas.push({ type: 'disc', title: 'จุดระวัง (DISC)', desc: discWarning, color: 'bg-blue-500', textColor: 'text-blue-400' });
    }

    if (lastMoney) {
      const risk = lastMoney.resultKey;
      let moneyKryptonite = lastMoney?.resultData?.kryptonite?.desc || lastMoney?.kryptonite || MONEY_DATA[risk]?.kryptonite.desc || "ระวังการใช้จ่ายตามอารมณ์ ควรจัดสรรเงินสำรองฉุกเฉินให้เพียงพอเสมอ";
      areas.push({ type: 'money', title: 'หลุมพรางการเงิน', desc: moneyKryptonite, color: 'bg-amber-500', textColor: 'text-amber-400' });
    }
    return areas;
  }, [lastWheel, lastDisc, lastMoney]);

const dailyQuests = useMemo(() => {
    const dayIndex = new Date().getDate();
    
    // ฟังก์ชันช่วยดึงคำถามแบบไม่ซ้ำ
    const getUniqueQuest = (pool: string[], existingTitles: string[], startIndex: number) => {
      let currentIndex = startIndex;
      let selectedQuest = pool[currentIndex % pool.length];
      while (existingTitles.some(title => title.includes(selectedQuest.substring(0, 5)))) {
        currentIndex++;
        selectedQuest = pool[currentIndex % pool.length];
      }
      return selectedQuest;
    };

    // ล้างค่า Default ออก ปล่อยว่างไว้ก่อน
    const qList = [
      { id: 1, type: "WHEEL", title: "", xp: 15 },
      { id: 2, type: "DISC", title: "", xp: 15 },
      { id: 3, type: "MONEY", title: "", xp: 20 },
      { id: 4, type: "WILDCARD", title: "", xp: 10 },
      { id: 5, type: "CHALLENGE", title: "", xp: 25 },
    ];

    // ✅ 1. ดึงจาก Wheel (ถ้ายังไม่เคยทำ ให้ดึงจากหมวด "การงาน" มาก่อน)
    const wheelArea = lastWheel?.currentScores 
      ? categoryNames[lastWheel.currentScores.indexOf(Math.min(...lastWheel.currentScores))] 
      : "การงาน";
    qList[0].title = QUEST_POOL.WHEEL[wheelArea as keyof typeof QUEST_POOL.WHEEL][dayIndex % QUEST_POOL.WHEEL[wheelArea as keyof typeof QUEST_POOL.WHEEL].length];

    // ✅ 2. ดึงจาก DISC (ถ้ายังไม่เคยทำ ให้ใช้สไตล์ "C" เป็นเควสให้ทำไปก่อน)
    const discMainChar = lastDisc 
      ? (lastDisc.finalResult || lastDisc.result || "C").charAt(0) 
      : "C";
    qList[1].title = QUEST_POOL.DISC[discMainChar as keyof typeof QUEST_POOL.DISC][dayIndex % QUEST_POOL.DISC[discMainChar as keyof typeof QUEST_POOL.DISC].length];

// ✅ 3. ดึงจาก Money (ปรับให้รองรับ 9 Roles และแก้ TypeScript Error)
const moneyKey = (lastMoney?.resultKey || "MID_RISK_MID_DISC") as keyof typeof QUEST_POOL.MONEY;

// ป้องกันกรณี Key ใน DB ไม่ตรงกับใน QUEST_POOL (Safety Fallback)
const moneyPool = QUEST_POOL.MONEY[moneyKey] || QUEST_POOL.MONEY["MID_RISK_MID_DISC"];

qList[2].title = moneyPool[dayIndex % moneyPool.length];

    // 4. สุ่ม Wildcard & Challenge แบบไม่ซ้ำ
    const currentTitles = [qList[0].title, qList[1].title, qList[2].title];
    qList[3].title = getUniqueQuest(QUEST_POOL.WILDCARD, currentTitles, dayIndex + 2);
    currentTitles.push(qList[3].title);
    qList[4].title = getUniqueQuest(QUEST_POOL.CHALLENGE, currentTitles, dayIndex + 3);

    return qList;
  }, [lastWheel, lastDisc, lastMoney]);

  const dailyXPGained = completedQuests.reduce((sum, id) => {
    const quest = dailyQuests.find(q => q.id === id);
    return sum + (quest?.xp || 0);
  }, 0);

  const currentLevel = Math.floor(totalXP / 100) + 1;
  const currentLevelXP = totalXP % 100;
  
  const getLevelTitle = (level: number) => {
    if (level < 10) return "Rookie Upskiller (ผู้เริ่มต้น)";
    if (level < 20) return "Habit Master (เซียนสร้างนิสัย)";
    return "Life Architect (สถาปนิกออกแบบชีวิต)";
  };

const toggleQuest = async (id: number, xp: number) => {
    if (!user) return;
    const isDone = completedQuests.includes(id);
    
    // ✅ ล็อกโควตา 3 ข้อ
 if (!isDone && completedQuests.length >= 3) {
  setShowLimitModal(true); // เปลี่ยนจาก alert เป็นตัวนี้
  return;
}

    const todayStr = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Bangkok'});
    const userRef = doc(db, "users", user.uid);
    const oldLevel = Math.floor(totalXP / 100) + 1;
    let newCompleted = isDone ? completedQuests.filter(qId => qId !== id) : [...completedQuests, id];
    let xpChange = isDone ? -xp : xp;

    setCompletedQuests(newCompleted);
    setTotalXP(prev => prev + xpChange);

    const newLevel = Math.floor((totalXP + xpChange) / 100) + 1;
    if (newLevel > oldLevel && xpChange > 0) {
      setShowLevelUp({ isOpen: true, newLevel });
      setTimeout(() => setShowLevelUp(null), 4000); 
    }

    try {
      await setDoc(userRef, {
        totalXP: increment(xpChange),
        completedQuestIds: newCompleted,
        lastQuestDate: todayStr
      }, { merge: true });
    } catch (error) {}
  };

  const renderRadarChart = (scores: number[]) => {
    const size = 280; 
    const center = size / 2;
    const radius = size / 2 - 40; 
    const getCoordinates = (val: number, index: number) => {
      const angle = (Math.PI * 2 * index) / 8 - Math.PI / 2;
      const r = radius * (val / 10);
      return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    };
    const points = scores.map((s, i) => `${getCoordinates(s, i).x},${getCoordinates(s, i).y}`).join(" ");

    return (
      <div className="relative w-full max-w-[340px] aspect-square mx-auto flex items-center justify-center pt-4 md:pt-0">
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {[2, 4, 6, 8, 10].map(l => <circle key={l} cx={center} cy={center} r={radius * (l / 10)} fill="none" stroke="#f1f5f9" strokeWidth="1" />)}
          {scores.map((_, i) => <line key={i} x1={center} y1={center} x2={getCoordinates(10, i).x} y2={getCoordinates(10, i).y} stroke="#f1f5f9" strokeWidth="1" />)}
          {scores.map((_, i) => {
             const { x, y } = getCoordinates(13.5, i); 
             return <text key={`label-${i}`} x={x} y={y} fontSize="11" fill="#94a3b8" textAnchor="middle" dominantBaseline="middle" className="font-bold">{categoryNames[i]}</text>
          })}
          <polygon points={points} fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" className="transition-all duration-500" />
          {scores.map((s, i) => {
             const pos = getCoordinates(s, i);
             const labelPos = getCoordinates(s + 2.5, i); 
             return (
               <g key={`point-${i}`}>
                 <circle cx={pos.x} cy={pos.y} r="5" fill="#ef4444" className="hover:r-7 transition-all" />
                 <text x={labelPos.x} y={labelPos.y} fontSize="12" fill="#dc2626" textAnchor="middle" dominantBaseline="middle" className="font-black drop-shadow-sm">{s}</text>
               </g>
             )
          })}
        </svg>
      </div>
    );
  };

  const currentDiscType = lastDisc?.finalResult || lastDisc?.result || "C";
  const discMainChar = currentDiscType.charAt(0);
  
  // สีพื้นฐานของกรอบ DISC
  const getDiscColors = (type: string = "C") => {
    if (type.includes("D")) return { main: "bg-red-600", light: "bg-red-50", border: "border-red-100", text: "text-red-700", hover: "group-hover:border-red-300" };
    if (type.includes("I")) return { main: "bg-amber-500", light: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", hover: "group-hover:border-amber-300" };
    if (type.includes("S")) return { main: "bg-green-500", light: "bg-green-50", border: "border-green-100", text: "text-green-700", hover: "group-hover:border-green-300" };
    return { main: "bg-blue-600", light: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", hover: "group-hover:border-blue-300" }; 
  };
  const discColors = getDiscColors(currentDiscType);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold text-sm">กำลังโหลด Dashboard ของคุณ...</p>
      </div>
    );
  }

  // 💡 เช็กว่ายังขาดแบบประเมินอันไหนบ้าง
  const missingAssessments = [];
  if (!lastWheel) missingAssessments.push("Wheel of Life");
  if (!lastDisc) missingAssessments.push("DISC");
  if (!lastMoney) missingAssessments.push("Money Avatar");

const quoteText = lastQuote?.quote || "ยังไม่มีคำคมสะสมไว้ ลองไปกดสุ่ม 'คมสัดสัด' ดูสิ!";

const getQuoteFontSize = (text: string) => {
  if (text.length > 200) return "text-[14px] leading-tight";      // ยาวมาก (บีบฟอนต์ + ชิดบรรทัด)
  if (text.length > 120) return "text-base md:text-lg leading-snug"; // ค่อนข้างยาว
  if (text.length > 60) return "text-lg md:text-[19px] leading-relaxed"; // ความยาวปกติ (เดิม)
  return "text-xl md:text-2xl leading-relaxed"; // สั้นๆ (เน้นให้ใหญ่กระแทกตา)
};

  return (
<div className="min-h-screen bg-transparent p-4"> 
      <div className="max-w-7xl mx-auto">
        
{/* --- 🧭 1. Top Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
         <header className="lg:col-span-2 bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative flex flex-col justify-between group transition-all duration-500 hover:shadow-[0_20px_60px_rgba(59,130,246,0.2)] border border-slate-800 hover:border-slate-700">
            
            {/* 💡 ย้ายเส้นขอบสีและพื้นหลังทั้งหมด มาไว้ในกรอบ overflow-hidden ตรงนี้ เพื่อให้มันตัดขอบโค้งเป๊ะๆ */}
            <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none z-0">
              
              {/* ✨ เส้นขอบสีด้านบน (ย้ายเข้ามาอยู่ข้างในแล้ว และเอา rounded-t-[2.5rem] ออก) */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70 group-hover:h-3 transition-all duration-300" />

              {/* ✨ แสงฟุ้ง (Glowing Blobs) */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-[100px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 blur-[80px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />

              <div className="absolute top-10 -right-20 opacity-10 rotate-12 hidden md:block transition-transform duration-700 group-hover:rotate-45 group-hover:scale-110">
                <BrainCircuit size={300} strokeWidth={1} />
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-start">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
                ยินดีต้อนรับกลับมา <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-extrabold">{user?.displayName?.split(' ')[0]} 🚀</span>
              </h1>
              <p className="text-slate-300 font-medium max-w-lg">เช็กภาพรวมและอัพเดตเป้าหมายชีวิตของคุณ เพื่อการเติบโตในทุกๆ วัน</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 relative z-20 w-full max-w-2xl">
              <div className="flex items-center justify-between bg-white/5 p-3 px-4 rounded-full border border-white/10 backdrop-blur-sm shadow-xl w-full hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={user?.photoURL || "/default-avatar.png"} alt="Profile" referrerPolicy="no-referrer" className="w-12 h-12 rounded-full border-2 border-slate-50 shadow-md shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-black text-white truncate">{user?.displayName}</p>
                    <p className="text-xs text-slate-400 font-medium truncate">{user?.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="ml-2 p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all group/btn shrink-0">
                  <LogOut size={18} className="group-hover/btn:-translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="flex items-center gap-4 bg-slate-800/80 p-3 px-5 rounded-full border border-slate-600 backdrop-blur-sm shadow-xl relative w-full hover:border-yellow-500/50 transition-colors">
                <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.3)] shrink-0 group-hover:scale-110 transition-transform">
                  <Trophy size={20} className="fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-white">LV.{currentLevel}</span>
                    <button onClick={() => setShowLevelInfo(!showLevelInfo)} className="text-slate-400 hover:text-yellow-400 transition-colors shrink-0">
                      <Info size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest leading-none mt-1 truncate">{getLevelTitle(currentLevel)}</p>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden flex items-center relative group/xp">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 relative" style={{ width: `${currentLevelXP}%` }}>
                      <div className="absolute inset-0 bg-white/20 w-full h-[50%] top-0" />
                    </div>
                    <span className="absolute right-0 top-3 text-[9px] text-slate-400 font-bold opacity-0 group-hover/xp:opacity-100 transition-opacity">{currentLevelXP}/100 XP</span>
                  </div>
                </div>

                <AnimatePresence>
                  {showLevelInfo && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 md:left-auto md:right-0 mt-4 w-72 bg-slate-800 border border-slate-600 p-5 rounded-2xl shadow-2xl z-[100] text-left">
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Sparkles size={14} className="text-yellow-400"/> ระบบ Level การเรียนรู้</h4>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">ทุกๆ 100 XP ที่สะสมจากการทำภารกิจรายวัน จะถูกนำมาอัพ Level การเรียนรู้ของคุณ!</p>
                      <ul className="text-[11px] font-medium space-y-2.5 text-slate-300">
                        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-sm"/> LV 1-9 : Rookie Upskiller</li>
                        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm"/> LV 10-19 : Habit Master</li>
                        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"/> LV 20+ : Life Architect</li>
                      </ul>
                      <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Total XP สะสม</span>
                        <span className="text-sm font-black text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg border border-yellow-500/20">{totalXP} XP</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          <div className="lg:col-span-1 bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center border border-slate-700 group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(239,68,68,0.15)] hover:border-slate-600">
            {/* ✨ แสงฟุ้ง (Glowing Blobs) */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-500/20 to-orange-500/10 blur-[80px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-rose-500/10 to-pink-500/10 blur-[60px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            
            {/* เส้นขอบสีด้านบน */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500 opacity-70 group-hover:h-3 transition-all duration-300" />

            <div className="absolute -right-10 -bottom-10 opacity-5 text-red-400 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12">
              <Target size={180} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                  <AlertCircle size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-white tracking-wide">จุดที่ควรโฟกัส</h2>
              </div>

              {focusAreas.length > 0 ? (
                <ul className="space-y-5">
                  {focusAreas.map((area, idx) => (
                    <li key={idx} className="flex gap-4 items-start group/item">
                      <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${area.color} shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover/item:scale-150 transition-transform`} />
                      <div>
                        <span className={`text-[11px] font-black uppercase tracking-wider ${area.textColor}`}>{area.title}</span>
                        <p className="text-sm font-medium text-slate-300 mt-1 leading-relaxed group-hover/item:text-white transition-colors">{area.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 leading-relaxed font-medium">ทำแบบทดสอบด้านล่างเพื่อให้ระบบวิเคราะห์จุดที่ควรโฟกัสให้นะครับ 🎯</p>
              )}
            </div>
          </div>

        </div>

{/* --- 🎮 2. Daily Quests Section --- */}
        <div className="mb-8 bg-white border border-slate-100 hover:border-orange-100 rounded-[2.5rem] p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.08)] relative overflow-hidden group transition-all duration-500">
          
          {/* ✨ แสงฟุ้งตกแต่งพื้นหลัง */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-yellow-400/10 blur-[100px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tl from-red-400/5 to-orange-400/5 blur-[100px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          
          {/* เส้นขอบสีด้านบน */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-red-500 opacity-90 group-hover:h-3 transition-all duration-300" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] group-hover:scale-110 transition-transform duration-300">
                <Flame size={28} strokeWidth={2.5} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daily Quests 🎯</h2>
                <p className="text-sm text-slate-500 font-bold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-orange-400" /> เลือกทำ 3 จาก 5 ข้อ เพื่อรับ XP ในวันนี้
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-[1.5rem] border border-slate-100 shadow-inner group/reward transition-all hover:bg-white hover:border-yellow-200 hover:shadow-md">
              <div className="p-2 bg-gradient-to-br from-yellow-300 to-yellow-500 text-white rounded-full shadow-sm group-hover/reward:rotate-12 group-hover/reward:scale-110 transition-all duration-300">
                <Trophy size={20} className="fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Reward Today</span>
                <span className="text-xl font-black text-slate-800">+{dailyXPGained} <span className="text-xs font-bold text-slate-400">XP</span></span>
              </div>
            </div>
          </div>

          {/* Progress Bar ทรงพรีเมียม */}
          <div className="mb-10 bg-slate-50/80 backdrop-blur-sm p-5 rounded-3xl border border-slate-100 shadow-inner relative z-10">
            <div className="flex justify-between items-center mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-ping ${completedQuests.length >= 3 ? 'bg-green-500' : 'bg-orange-500'}`} />
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Mission Progress</span>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${completedQuests.length >= 3 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                {completedQuests.length} / 3 COMPLETED
              </span>
            </div>
            <div className="w-full h-4 bg-slate-200/50 rounded-full overflow-hidden p-1 border border-white shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(Math.min(completedQuests.length, 3) / 3) * 100}%` }}
                transition={{ type: "spring", stiffness: 100 }}
                className={`h-full rounded-full transition-all duration-500 relative ${
                  completedQuests.length >= 3 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-gradient-to-r from-orange-400 to-red-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                }`}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-[50%] top-0" /> 
              </motion.div>
            </div>
          </div>

          {/* 3. รายการ Quests (Card ดีไซน์ใหม่) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {dailyQuests.map((quest, index) => {
              const isDone = completedQuests.includes(quest.id);
              const isLocked = !isDone && completedQuests.length >= 3;
                
              const getTypeStyles = (type: string) => {
                switch(type) {
                  case 'WHEEL': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', icon: <PieChart size={18}/> };
                  case 'DISC': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: <Users size={18}/> };
                  case 'MONEY': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Wallet size={18}/> };
                  case 'CHALLENGE': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: <Target size={18}/> };
                  default: return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', icon: <Sparkles size={18}/> };
                }
              };
              const styles = getTypeStyles(quest.type);

              return (
                <motion.div 
                  key={quest.id} 
                  whileHover={!isLocked && !isDone ? { y: -3, scale: 1.01 } : {}}
                  className={`group/card relative flex items-center gap-5 p-5 rounded-[1.8rem] border-2 transition-all duration-300 
                    ${index === 4 ? 'md:col-span-2' : ''} 
                    ${isDone ? 'bg-green-50 border-green-200 shadow-sm' : 
                      isLocked ? 'bg-slate-50 border-slate-100 opacity-40 grayscale' : 
                      'bg-white border-slate-50 hover:border-orange-200 cursor-pointer shadow-[0_5px_15px_rgba(0,0,0,0.02)] hover:shadow-lg'}
                  `}
                  onClick={() => toggleQuest(quest.id, quest.xp)}
                >
                  <div className="shrink-0 relative">
                    {isDone ? (
                      <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg shadow-green-200">
                        <CheckCircle2 size={24} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${isLocked ? 'border-slate-200' : 'border-slate-200 group-hover/card:border-orange-400 bg-white'}`}>
                        {isLocked ? <Lock size={14} className="text-slate-300" /> : <Circle size={18} className="text-slate-100 group-hover/card:text-orange-100" />}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                       <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${isDone ? 'bg-green-100 text-green-600' : `${styles.bg} ${styles.text}`}`}>
                         {quest.type}
                       </span>
                    </div>
                  <p className={`text-[15px] font-bold leading-tight ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
  {quest.title}
</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl border shadow-sm transition-all
                      ${isDone 
                        ? 'bg-slate-100 border-slate-200 text-slate-400' 
                        : 'bg-white border-orange-100 text-orange-500 group-hover/card:bg-gradient-to-r group-hover/card:from-orange-400 group-hover/card:to-red-500 group-hover/card:text-white group-hover/card:border-transparent group-hover/card:shadow-[0_5px_15px_rgba(249,115,22,0.3)]'
                      }`}>
                      +{quest.xp} XP
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ✨ กล่องข้อความเตือนทำแบบประเมิน ✨ */}
          {missingAssessments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex items-start sm:items-center gap-3 shadow-sm relative z-10"
            >
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full shrink-0 mt-0.5 sm:mt-0">
                <Sparkles size={16} />
              </div>
              <p className="text-xs font-medium text-blue-800 leading-relaxed">
                <span className="font-bold">💡 ทริคอัพสกิล:</span> ภารกิจวันนี้ยังเป็นแบบสุ่มพื้นฐานอยู่ 
                อย่าลืมไปทำแบบประเมิน <span className="font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-2">({missingAssessments.join(", ")})</span> ด้านล่างให้ครบ เพื่อรับภารกิจที่ตรงกับตัวคุณที่สุดนะครับ!
              </p>
            </motion.div>
          )}

        </div>
      {/* --- 📦 3. Bento Grid --- */}
        
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 🌟 1. Wheel of Life */}
          <Link href="/tools/wheel-of-life" className="md:col-span-2 group block h-full relative">
            
            {lastWheel && (
               <button 
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    const rawText = lastWheel.analysis || "ยังไม่มีข้อมูลประมวลผล";
                    let beforePlan = rawText;
                    let actionPlan = "";
                    let afterPlan = "";

                    const planIndex = rawText.indexOf('📅');
                    const fireIndex = rawText.indexOf('🔥', planIndex);

                    if (planIndex !== -1) {
                        beforePlan = rawText.substring(0, planIndex);
                        actionPlan = fireIndex !== -1 ? rawText.substring(planIndex, fireIndex) : rawText.substring(planIndex);
                        afterPlan = fireIndex !== -1 ? rawText.substring(fireIndex) : "";
                    }

                    const formattedContent = (
                      <div className="w-full">
                        {formatAnalysisText(beforePlan)}
                        {actionPlan && (
                          <div className="relative bg-white p-4 md:p-6 my-5 rounded-2xl border-2 border-dashed border-red-200">
                            {formatAnalysisText(actionPlan)}
                          </div>
                        )}
                        {formatAnalysisText(afterPlan)}
                      </div>
                    );
                    openInfo(e, "ผลวิเคราะห์ด้วย AI 🤖", formattedContent);
                  }} 
                  className="absolute top-6 right-6 z-20 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all bg-white shadow-sm border border-slate-100"
               >
                 <Info size={20} />
               </button>
            )}

            <motion.div 
              whileHover={{ y: -6, scale: 1.01 }} 
              className="h-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-red-50 relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-red-200 flex flex-col justify-center group"
            >

                 {!lastWheel && (
      <motion.div 
        initial={{ scale: 0, rotate: 10 }}
        animate={{ scale: 1, rotate: -5 }}
        className="absolute top-8 right-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-green-100 flex items-center gap-1 z-30"
      >
        <Zap size={10} className="fill-white" />
        +50 XP
      </motion.div>
    )}
              {/* ✨ แสงฟุ้ง (Glowing Blobs) */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-400/10 to-orange-400/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-400/10 to-rose-400/10 blur-2xl rounded-full -ml-10 -mb-10 pointer-events-none group-hover:scale-110 transition-transform duration-700" />

              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500 opacity-90 group-hover:h-3 transition-all duration-300" />
              
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10 pt-2 h-full">
                <div className="flex-1 w-full flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-red-50 text-red-600 rounded-full group-hover:bg-red-500 group-hover:text-white transition-colors border border-red-100 shadow-sm group-hover:scale-110 duration-300">
                        <PieChart size={28} className="fill-current/20" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800">Wheel of Life</h2>
                    </div>
                  </div>

                  {lastWheel ? (
                     <>
          <div className="mb-4">
  <p className="text-sm font-medium text-slate-500 mb-2">เป้าหมาย 1 ปีของคุณ</p>
  <div 
  onClick={(e) => {
    e.preventDefault();    // ✅ ป้องกัน Link ทำงาน (ถ้ามันอยู่ในแท็ก <a> หรือ <Link>)
    e.stopPropagation();   // ✅ ป้องกัน Event ไหลไปหา Parent
    setIsGoalExpanded(!isGoalExpanded);
  }}
    className="bg-gradient-to-r from-red-50 to-orange-50 px-4 py-3 rounded-xl border border-red-100 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300"
  >
    {/* โค้ดส่วนข้อความ ถ้า isGoalExpanded เป็น true จะเอา line-clamp-2 ออก */}
    <p className={`text-[15px] font-bold text-red-900 leading-normal break-words relative z-10 transition-all duration-300 ${isGoalExpanded ? "" : "line-clamp-2"}`}>
      🎯 {lastWheel?.goal || "ยังไม่ได้ตั้งเป้าหมาย ไปตั้งเป้าหมายแรกกันเถอะ!"}
    </p>

    {/* ปุ่ม อ่านเพิ่มเติม / ย่อลง (จะโชว์ก็ต่อเมื่อข้อความยาวเกิน 70 ตัวอักษร) */}
    {lastWheel?.goal?.length > 70 && (
      <div className="mt-2 text-right">
        <span className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
          {isGoalExpanded ? "ย่อข้อความ" : "อ่านเพิ่มเติม..."}
        </span>
      </div>
    )}
  </div>
</div>
                     </>
                  ) : (
                     <div className="mb-6">
                        <p className="text-slate-500 font-medium">ตั้งเป้าหมายและเช็กสมดุลชีวิตของคุณใน 8 ด้าน</p>
                     </div>
                  )}

               <div className={`inline-flex items-center gap-1.5 px-6 py-3 rounded-full border text-[13px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm w-fit 
  ${lastWheel 
    ? 'bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-200' 
    : 'bg-gradient-to-r from-red-500 to-orange-500 border-transparent text-white shadow-[0_8px_20px_-5px_rgba(239,68,68,0.4)] hover:shadow-[0_12px_25px_-5px_rgba(239,68,68,0.5)] hover:scale-[1.03]'
  }`}>
  
  {/* สลับไอคอนแบบนิ่งๆ ไม่มีการ animate */}
  {lastWheel ? (
    <RefreshCw size={14} />
  ) : (
    <Sparkles size={14} />
  )}
  
  <span>{lastWheel ? "ประเมินใหม่" : "เริ่มประเมินครั้งแรก (+50 XP)"}</span>
</div>
                </div>
                <div className="w-full md:w-1/2 flex justify-center items-center rounded-[3rem] p-2 aspect-square md:aspect-auto">
                  {lastWheel?.currentScores ? renderRadarChart(lastWheel.currentScores) : (
                    <div className="text-center p-8"><PieChart size={48} className="mx-auto text-slate-200 mb-3" /><p className="text-sm font-bold text-slate-400">ยังไม่มีข้อมูลกราฟ</p></div>
                  )}
                </div>
              </div>
            </motion.div>
          </Link>

          {/* 🌟 2. คมสัดสัด */}

          
          <Link href="/tools/khomsatsat" className="group block h-full">
            <motion.div 
              whileHover={{ y: -6, scale: 1.01 }} 
              className="h-full bg-white rounded-[2.5rem] shadow-sm border border-indigo-50 relative overflow-hidden flex flex-col group hover:shadow-xl hover:border-indigo-200 transition-all duration-500"
            >
              {/* ✨ แสงฟุ้ง (Glowing Blobs) */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 blur-2xl rounded-full -ml-10 -mb-10 pointer-events-none group-hover:scale-110 transition-transform duration-700" />

              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-90 group-hover:h-3 transition-all duration-300" />

              <div className="relative z-10 flex flex-col h-full p-8 md:p-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                      <Quote size={24} className="fill-current/20" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-0.5">Khomsatsat</span>
                      <h2 className="text-xl font-black text-slate-800 leading-none">คมสัดสัด</h2>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center relative my-6">
                  <Quote className="absolute -top-4 -left-2 text-indigo-100/50 rotate-180 transition-transform group-hover:-translate-y-2 group-hover:-translate-x-2" size={60} />
                  <Quote className="absolute -bottom-6 -right-2 text-purple-100/50 transition-transform group-hover:translate-y-2 group-hover:translate-x-2" size={60} />
                <p className={`${getQuoteFontSize(quoteText)} font-black italic relative z-10 text-center px-4 transition-all duration-300 break-words`}>
  <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-700 to-purple-700 drop-shadow-sm px-2 py-1 leading-normal inline-block">
    "{quoteText}"
  </span>
</p>
                </div>
                
                <div className="mt-auto flex justify-center">
                  <div className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm w-full
                    ${hasClaimedQuoteToday 
                      ? 'bg-slate-50 text-slate-500 border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-[0_8px_20px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_25px_-5px_rgba(79,70,229,0.5)] hover:scale-[1.03]'
                    }`}>
                    <Sparkles size={16} className={hasClaimedQuoteToday ? "" : "animate-pulse"} />
                    <span>{hasClaimedQuoteToday ? "สุ่มคำคมใหม่" : "สุ่มคำคมวันนี้ (+10 XP วันละครั้ง)"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>


{/* 🌟 3. DISC - Version "The Carry" (เพิ่มคำอธิบายใต้รูป) */}
<Link href="/tools/disc" className="group block h-full relative">
  {/* ปุ่ม Info (โชว์เมื่อมีข้อมูลแล้ว) */}
  {lastDisc && (
     <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDiscInfo(e); }} 
             className="absolute top-8 right-8 z-20 p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all bg-white/80 backdrop-blur-sm shadow-sm border border-slate-100">
       <Info size={18} />
     </button>
  )}
  
  <motion.div 
    whileHover={{ y: -6 }} 
    className="h-full bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:border-blue-200 relative overflow-hidden group"
  >
    {/* 🏷️ Floating XP Badge (Top 8 Right 8) */}
    {!lastDisc && (
      <motion.div 
        initial={{ scale: 0, rotate: 10 }}
        animate={{ scale: 1, rotate: -5 }}
        className="absolute top-8 right-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-green-100 flex items-center gap-1 z-30"
      >
        <Zap size={10} className="fill-white" /> +50 XP
      </motion.div>
    )}

    {/* ✨ Soft Glow & Blue Top Bar */}
    <div className={`absolute top-0 right-0 w-80 h-80 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none opacity-10 transition-colors duration-700 ${
      discMainChar === 'D' ? 'bg-red-400' : 
      discMainChar === 'I' ? 'bg-orange-400' : 
      discMainChar === 'S' ? 'bg-emerald-400' : 'bg-blue-400'
    }`} />
    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-300 via-blue-600 to-blue-300 opacity-80" />
    
    <div className="relative z-10 flex flex-col items-center h-full w-full">
      {lastDisc ? (
        <>
          <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-6"> DISC STYLE </h3>
          
          {/* 🛡️ Logo Container */}
          <div className="relative mb-6">
            <div className={`absolute inset-0 blur-3xl opacity-30 ${discColors.light}`} />
            <div className="relative w-24 h-24 rounded-full bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
              {DISC_DATA[discMainChar]?.emoji || "🎭"}
            </div>
          </div>

          {/* 📝 ส่วนคำอธิบายใต้รูป: ปรับให้พรีเมียมและอ่านง่าย */}
          <p className="text-[14px] font-medium text-slate-500 mb-6 px-4 leading-relaxed opacity-90 max-w-[280px]">
            {DISC_DATA[discMainChar]?.desc || "คุณคือส่วนผสมที่ลงตัวของการทำงานและการสื่อสาร"}
          </p>

          <div className="flex-1"></div>

          {/* 📊 Progress Bar & Legend */}
          <div className="w-full space-y-3 mb-6">
             <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-50">
                <motion.div initial={{ width: 0 }} animate={{ width: `${lastDisc.percentages?.D || 0}%` }} className="h-full bg-red-500" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${lastDisc.percentages?.I || 0}%` }} className="h-full bg-orange-500" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${lastDisc.percentages?.S || 0}%` }} className="h-full bg-emerald-500" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${lastDisc.percentages?.C || 0}%` }} className="h-full bg-blue-500" />
             </div>
             <div className="flex justify-center items-center gap-x-3 text-[11px] font-black">
                {['D','I','S','C'].map((label, idx) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className={idx===0?'text-red-500':idx===1?'text-orange-500':idx===2?'text-emerald-500':'text-blue-500'}>{label}</span>
                    <span className="text-slate-400">{lastDisc.percentages?.[label] || 0}%</span>
                  </div>
                ))}
             </div>
          </div>

          {/* 🏆 RPG Title & Label */}
          <div className="mb-8">
             <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-2 inline-block border ${discColors.light} ${discColors.border} ${discColors.text}`}>
                {discMainChar === 'D' ? 'Dominance' : 
                 discMainChar === 'I' ? 'Influence' : 
                 discMainChar === 'S' ? 'Steadiness' : 'Conscientiousness'}
             </span>
             <h2 className={`text-3xl font-black leading-tight tracking-tight ${DISC_DATA[discMainChar]?.titleColor || 'text-slate-900'}`}> 
               {DISC_DATA[discMainChar]?.rpgTitle || "จอมวางแผน"} 
             </h2>
          </div>
          
          {/* ปุ่มประเมินใหม่ */}
          <div className="w-full px-4">
            <div className="group/btn-start relative">
              <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-sky-400 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(56,189,248,0.4)] group-hover/btn-start:scale-[1.02] group-hover/btn-start:shadow-blue-300 active:scale-95">
                <RefreshCw size={16} className="text-white/80" />
                <span>ประเมินใหม่</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 🎁 Empty State เหมือนเดิม */
        <div className="flex flex-col items-center justify-center h-full py-10 relative w-full">
          <div className="relative mb-6 mt-4">
            <div className="absolute inset-0 bg-blue-100 blur-3xl opacity-20" />
            <div className="relative w-24 h-24 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Users size={36} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">วัดความตึง DISC</h3>
          <p className="text-slate-400 text-sm mb-8 font-medium">ค้นหาตัวตนและการสื่อสาร</p>
          <div className="w-full px-4">
            <div className="group/btn-start relative">
              <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-sky-400 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(56,189,248,0.4)] group-hover/btn-start:scale-[1.02] group-hover/btn-start:shadow-blue-300 active:scale-95">
                <Sparkles size={16} className="text-white/80" />
                <span>เริ่มประเมินครั้งแรก <span className="opacity-90">(+50 XP)</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </motion.div>
</Link>

<Link href="/tools/money-avatar" className="group block h-full relative">
  {lastMoney && (
     <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openMoneyInfo(e); }} 
             className="absolute top-8 right-8 z-20 p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-all bg-white/80 backdrop-blur-sm shadow-sm border border-slate-100">
       <Info size={18} />
     </button>
  )}
  <motion.div 
    whileHover={{ y: -6 }} 
    className="h-full bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:border-amber-100 relative overflow-hidden group"
  >
    {/* 🏷️ Floating XP Badge (ตำแหน่ง Top 8 Right 8 เท่ากันเป๊ะ) */}
    {!lastMoney && (
      <motion.div 
        initial={{ scale: 0, rotate: 10 }}
        animate={{ scale: 1, rotate: -5 }}
        className="absolute top-8 right-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-green-100 flex items-center gap-1 z-30"
      >
        <Zap size={10} className="fill-white" /> +50 XP
      </motion.div>
    )}

    {/* ✨ Ambient Light & Gold Top Bar */}
    <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-400/5 to-orange-400/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:from-amber-400/10 transition-colors duration-700" />
    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200 opacity-80" />
    
    <div className="relative z-10 flex flex-col items-center h-full w-full">
      {lastMoney ? (
        <>
          <div className="relative mb-6 mt-2">
            <div className="absolute inset-0 bg-amber-100 blur-3xl opacity-20" />
            <div className="relative w-24 h-24 rounded-full bg-white shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-slate-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
              {MONEY_DATA[lastMoney.resultKey]?.emoji || "💰"}
            </div>
          </div>

          <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-2.5"> MONEY AVATAR </h3>
          <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors"> 
            {MONEY_DATA[lastMoney.resultKey]?.title || "นักวางแผน"} 
          </h2>
          
          <div className="inline-flex items-center bg-amber-50 text-amber-700 text-[11px] font-black px-4 py-1.5 rounded-full mb-5 border border-amber-100/50 shadow-sm">
            Match {lastMoney.primaryMatch || 100}%
          </div>

          <p className="text-[14px] font-medium text-slate-500 mb-6 px-6 leading-relaxed opacity-80 max-w-[280px]"> 
            "{MONEY_DATA[lastMoney.resultKey]?.motto}" 
          </p>

          {/* 🎭 Secondary Persona */}
          {lastMoney.secondaryKey && MONEY_DATA[lastMoney.secondaryKey] && (
              <div className="mb-10 py-2.5 px-5 rounded-2xl bg-slate-50/50 border border-slate-100/80 flex items-center gap-3 relative group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                  <span className="text-xl shrink-0">{MONEY_DATA[lastMoney.secondaryKey].emoji}</span>
                  <div className="flex flex-col items-start leading-none gap-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ตัวตนรอง</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-slate-700">
                        {MONEY_DATA[lastMoney.secondaryKey].title}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 italic">
                        {lastMoney.secondaryMatch}%
                      </span>
                    </div>
                  </div>
              </div>
          )}
          
        <div className="w-full px-4">
  <div className="group/btn-start relative">
    <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] group-hover/btn-start:scale-[1.02] group-hover/btn-start:shadow-amber-300 active:scale-95">
      <RefreshCw size={16} className="text-white/80" />
      <span>
       ประเมินใหม่
      </span>
    </div>
  </div>
</div>
        </>
      ) : (
     <div className="flex flex-col items-center justify-center h-full py-10 relative w-full">
           <div className="relative mb-6 mt-4">
              <div className="absolute inset-0 bg-amber-200 blur-2xl opacity-20" />
              <div className="relative w-24 h-24 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all">
                 <Wallet size={36} />
              </div>
           </div>
           <h3 className="text-2xl font-black text-slate-800 mb-2">Money Avatar</h3>
           <p className="text-slate-400 text-sm font-medium mb-8">ถอดรหัสสไตล์การเงินของคุณ</p>
       <div className="w-full px-4">
  <div className="group/btn-start relative">
    <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] group-hover/btn-start:scale-[1.02] group-hover/btn-start:shadow-amber-300 active:scale-95">
      <Sparkles size={16} className="text-white/80" />
      <span>
        เริ่มประเมินครั้งแรก <span className="opacity-90">(+50 XP)</span>
      </span>
    </div>
  </div>
</div>
        </div>
      )}
    </div>
  </motion.div>
</Link>

{/* 🌟 5. Upskill Library - Premium Library Style */}
<Link 
  href={currentLevel >= 5 ? "/library" : "#"} 
  onClick={(e) => { if (currentLevel < 5) e.preventDefault(); }}
  className={`group block h-full relative ${currentLevel >= 5 ? 'cursor-pointer' : 'cursor-default'}`}
>
  <motion.div 
    whileHover={currentLevel >= 5 ? { y: -6 } : {}} 
    className={`h-full bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-500 relative overflow-hidden 
      ${currentLevel >= 5 ? 'hover:shadow-2xl hover:border-emerald-100' : 'opacity-90'}`}
  >
    
    {/* 🏷️ Status Badge (ตำแหน่ง Top 8 Right 8 เป๊ะ) */}
    <div className="absolute top-8 right-8 z-30">
      {currentLevel >= 5 ? (
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-emerald-100 flex items-center gap-1.5 uppercase tracking-wider"
        >
          <Unlock size={10} className="fill-white" /> Unlocked
        </motion.div>
      ) : (
        <div className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Lock size={10} /> LV.5 Required
        </div>
      )}
    </div>

    {/* ✨ Ambient Light & Emerald Top Bar */}
    <div className={`absolute top-0 right-0 w-72 h-72 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none transition-colors duration-700 
      ${currentLevel >= 5 ? 'bg-gradient-to-br from-emerald-400/5 to-teal-400/5 group-hover:from-emerald-400/10' : 'bg-slate-200/5'}`} 
    />
    <div className={`absolute top-0 left-0 w-full h-1.5 opacity-80 transition-all duration-500 
      ${currentLevel >= 5 ? 'bg-gradient-to-r from-emerald-300 via-teal-500 to-emerald-300' : 'bg-slate-200'}`} 
    />
    
    <div className="relative z-10 flex flex-col items-center h-full w-full">
      
      {/* 📖 Logo Container (w-24 h-24 เท่ากับ Money Avatar) */}
      <div className="relative mb-6 mt-2">
        <div className={`absolute inset-0 blur-3xl opacity-20 ${currentLevel >= 5 ? 'bg-emerald-100' : 'bg-slate-200'}`} />
        <div className={`relative w-24 h-24 rounded-full bg-white shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-slate-50 flex items-center justify-center text-6xl transition-transform duration-500 
          ${currentLevel >= 5 ? 'group-hover:scale-110' : 'grayscale'}`}>
          {currentLevel >= 5 ? "📚" : "🔒"}
        </div>
      </div>

      <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-2.5"> UPSKILL LIBRARY </h3>
      <h2 className={`text-3xl font-black mb-3 leading-tight tracking-tight transition-colors 
        ${currentLevel >= 5 ? 'text-slate-900 group-hover:text-emerald-600' : 'text-slate-400'}`}>
        คลังสมองอัพสกิล
      </h2>
      
      <p className="text-[14px] font-medium text-slate-500 mb-8 px-6 leading-relaxed opacity-80 max-w-[280px]">
        สรุปหนังสือและบทความเด็ดๆ <br/> ที่คัดมาเพื่อคุณโดยเฉพาะ
      </p>
      
      <div className="w-full px-4 mt-auto">
        <div className="group/btn-library relative">
          {currentLevel >= 5 ? (
            <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] group-hover/btn-library:scale-[1.02] group-hover/btn-library:shadow-emerald-300 active:scale-95">
              <BookOpen size={16} className="text-white/80" />
              <span>เปิดอ่านคลังสมอง</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-slate-100 text-slate-400 text-[13px] font-black uppercase tracking-widest border border-slate-200 cursor-not-allowed">
              <Lock size={16} />
              <span>ปลดล็อกที่ LV.5</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
</Link>
        </div>
        
        

      <div className="mt-16 text-center py-6 border-t border-slate-100 flex flex-col items-center">
  <p className="text-[10px] text-slate-400 font-bold mb-5 tracking-wide">© 2026 อัพสกิลกับฟุ้ย</p>
  
  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full px-6">
    {/* ปุ่ม Logout เดิม */}
    <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-white text-slate-500 font-black text-sm py-3 px-6 rounded-full shadow-sm hover:text-slate-800 hover:bg-slate-50 transition-colors border border-slate-100 active:scale-95 w-full sm:w-auto">
      <LogOut size={16} /> ออกจากระบบ
    </button>

    {/* 🚨 ปุ่มรีเซ็ตข้อมูล (ซ่อนตัวเนียนๆ เป็นสีแดงอ่อน) */}
    <button onClick={handleResetAllData} className="flex items-center justify-center gap-2 bg-transparent text-red-300 font-bold text-xs py-3 px-4 rounded-full hover:text-red-600 hover:bg-red-50 transition-all active:scale-95 w-full sm:w-auto">
      <RefreshCw size={14} /> เริ่มต้นใหม่ (Reset)
    </button>
  </div>
</div>

      </div>

      {/* --- 💡 Modals & Popups --- */}
      <AnimatePresence>
        
        {/* Info Popup (ใช้ร่วมกันหมด) */}
        {/* Info Popup (ฉบับแก้กรอบเป๊ะ ไม่เลยบนล่าง) */}
{infoModal?.isOpen && (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }} 
    className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm" 
    onClick={() => setInfoModal(null)}
  >
    <motion.div 
      initial={{ scale: 0.95, y: 20 }} 
      animate={{ scale: 1, y: 0 }} 
      exit={{ scale: 0.95, y: 20 }} 
      // 💡 ปรับตรงนี้: เปลี่ยน max-h เป็น 80vh และเพิ่ม flex flex-col
      className="bg-white rounded-[2.5rem] shadow-2xl relative max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden" 
      onClick={e => e.stopPropagation()}
    >
      {/* 💡 ส่วนหัว: ให้ปุ่ม X อยู่กับที่เสมอ */}
      <div className="p-6 pb-2 flex justify-between items-start sticky top-0 bg-white z-20">
        <h3 className="text-xl font-black text-slate-800 pr-8 leading-tight">{infoModal.title}</h3>
        <button 
          onClick={() => setInfoModal(null)} 
          className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2.5 rounded-full transition-all shrink-0"
        >
          <X size={20}/>
        </button>
      </div>

      {/* 💡 ส่วนเนื้อหา: เลื่อน Scroll ได้แค่ตรงนี้ */}
      <div className="px-6 py-2 overflow-y-auto custom-scrollbar flex-1 text-slate-600 font-medium leading-relaxed">
        {infoModal.content}
      </div>

      {/* 💡 ส่วนท้าย: ปุ่มกดอยู่กับที่ด้านล่าง */}
      <div className="p-6 pt-4 bg-white border-t border-slate-50">
        <button 
          onClick={() => setInfoModal(null)} 
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
        >
          เข้าใจแล้ว
        </button>
      </div>
    </motion.div>
  </motion.div>
)}

      {/* Level Up Popup */}
{showLevelUp?.isOpen && (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }} 
    // 🔥 แก้ 1: เปลี่ยนเป็น pointer-events-auto และเพิ่ม z-index ให้สูงขึ้น
    // 🔥 แก้ 2: ใส่ onClick เพื่อให้กดที่ว่างๆ แล้วปิดได้
    className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto p-4 bg-slate-900/60 backdrop-blur-sm"
    onClick={() => setShowLevelUp(null)}
  >
    <motion.div 
      initial={{ scale: 0.5, y: 50, rotate: -5 }} 
      animate={{ scale: 1, y: 0, rotate: 0, transition: { type: "spring", bounce: 0.6 } }} 
      exit={{ scale: 0.8, opacity: 0 }} 
      // 🔥 แก้ 3: ใส่ stopPropagation เพื่อไม่ให้คลิกโดนตัวการ์ดแล้วมันปิด
      onClick={(e) => e.stopPropagation()}
      className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-[2.5rem] p-1 shadow-[0_0_50px_rgba(250,204,21,0.5)] max-w-sm w-full text-center"
    >
        <div className="bg-white rounded-[2.4rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -top-20 -right-20 text-yellow-100 opacity-50">
              <Sparkles size={150}/>
            </motion.div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-inner border-4 border-white">
                  <Trophy size={40} className="fill-current"/>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-1">ยินดีด้วย!</h2>
                <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-widest">คุณอัพเลเวลแล้ว</p>
                
                <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl border-4 border-slate-800 shadow-xl mb-6">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">LV. {showLevelUp.newLevel}</span>
                </div>
                
                <p className="text-slate-600 font-medium text-sm mb-8">
                  สุดยอดเลยครับ! คุณคือ <span className="font-bold text-orange-500">{getLevelTitle(showLevelUp.newLevel)}</span> ตัวจริง ก้าวต่อไปนะครับ 🚀
                </p>

                {/* 🔥 เพิ่มปุ่มปิดให้ชัดเจน เผื่อ User หาที่กดไม่เจอ */}
                <button 
                  onClick={() => setShowLevelUp(null)}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg"
                >
                  ลุยต่อเลย!
                </button>
            </div>
        </div>
    </motion.div>
  </motion.div>
)}

      </AnimatePresence>
    </div>
  );
}