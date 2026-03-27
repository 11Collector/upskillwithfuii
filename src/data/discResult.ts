export type FinancialType = {
  title: string;
  subtitle: string;
  color: string;
  barColor: string;
  emoji: string;
  titleColor: string;
  desc: string;
  warning: string;
  bestPartner: { name: string; desc: string };
  kryptonite: { name: string; desc: string };
};

export const resultData: Record<string, FinancialType> = {
  // 🟢 วินัยสูง (High Discipline)
  HIGH_RISK_HIGH_DISC: {
    title: "นักลงทุนสายระบบ", subtitle: "The System Alpha", 
    color: "bg-gradient-to-r from-violet-600 to-purple-500", barColor: "bg-purple-500", emoji: "🧠", titleColor: "text-purple-700",
    desc: "คุณคือวิศวกรพอร์ตโฟลิโอ! บริหารความเสี่ยงเป๊ะ วางแผนเกษียณล่วงหน้า กล้าลุยในสินทรัพย์เติบโตสูง (US Tech, Crypto) แต่เข้าออกตามแผนและมีจุด Cut Loss เสมอ",
    warning: "ระวังตึงเครียดกับตัวเลขมากไปจนลืมใช้ชีวิต แวะเอาเงินไปซื้อประสบการณ์ให้ตัวเองบ้างนะ",
    bestPartner: { name: "เครื่องจักรปั้นพอร์ต 📈", desc: "ช่วยดึงสติให้คุณมีสินทรัพย์ปลอดภัย (Safe Haven) ไว้เป็นเบาะรองรับ" },
    kryptonite: { name: "สายกาว All-in 🦍", desc: "ทนดูไม่ได้เวลาเห็นใครเทรดแบบใช้แต่อารมณ์ ไร้ระบบ" }
  },
  MID_RISK_HIGH_DISC: {
    title: "เครื่องจักรปั้นพอร์ต", subtitle: "The Compounder", 
    color: "bg-gradient-to-r from-blue-600 to-cyan-500", barColor: "bg-blue-500", emoji: "📈", titleColor: "text-blue-700",
    desc: "ช้าๆ ได้พร้าเล่มงาม! คุณคือเจ้าพ่อ/เจ้าแม่ DCA เน้นสะสมหุ้นพื้นฐานดี ปันผลโตๆ ปล่อยให้พลังของดอกเบี้ยทบต้นทำงานแทนแบบเงียบๆ แต่มั่นคง",
    warning: "ปลอดภัยไว้ก่อนเป็นเรื่องดี แต่มูลค่าอาจโตไม่ทันใจ ลองเจียดงบ 5% ไปลงของซิ่งๆ เพื่อเปิดโอกาสใหม่ๆ ดูบ้าง",
    bestPartner: { name: "นักลงทุนสายระบบ 🧠", desc: "ช่วยเปิดโลกสินทรัพย์เติบโตสูง ให้พอร์ตคุณถึงเป้าหมายไวขึ้น" },
    kryptonite: { name: "สายเปย์ตามฟีล 🛍️", desc: "ปวดหัวและเสียดายเงินแทนทุกครั้งที่เห็นคนใช้เงินเกินตัว" }
  },
  LOW_RISK_HIGH_DISC: {
    title: "ผู้พิทักษ์เงินฝาก", subtitle: "The Vault Guardian", 
    color: "bg-gradient-to-r from-emerald-600 to-teal-500", barColor: "bg-emerald-500", emoji: "🛡️", titleColor: "text-emerald-700",
    desc: "วินัยการออมระดับเทพ! เงินต้นต้องอยู่ครบ หักเงินเก็บก่อนใช้เสมอ พอร์ตหลักคือสลากออมทรัพย์ เงินฝากประจำ และพันธบัตรรัฐบาล",
    warning: "เงินเฟ้อคือศัตรูที่มองไม่เห็น! ออมเก่งแล้ว ต้องเริ่มศึกษาการลงทุนความเสี่ยงต่ำที่เอาชนะเงินเฟ้อให้ได้นะ",
    bestPartner: { name: "มนุษย์สมดุล ⚖️", desc: "ช่วยแนะนำสัดส่วนการใช้เงินที่ทำให้ชีวิตยืดหยุ่นและมีความสุขขึ้น" },
    kryptonite: { name: "นักล่าเทรนด์ 🌊", desc: "ใจสั่นทุกครั้งที่ได้ยินคำว่า 'ความผันผวนสูง' หรือ 'ขาดทุน'" }
  },

  // 🟡 วินัยปานกลาง (Mid Discipline)
  HIGH_RISK_MID_DISC: {
    title: "นักล่าเทรนด์", subtitle: "The Trend Surfer", 
    color: "bg-gradient-to-r from-rose-500 to-orange-500", barColor: "bg-rose-500", emoji: "🏄‍♂️", titleColor: "text-rose-600",
    desc: "จมูกไวเรื่องหาเงิน! อะไรกำลังมาคุณรู้หมด กล้าเสี่ยง กล้าเข้าไวออกไว แต่บางทีก็แอบหลุดแผนเพราะโดนอารมณ์ตลาดพาไป",
    warning: "ระวังอาการ FOMO เล่นตามข่าวจนติดดอย ควรตั้งจุด Take Profit และ Cut Loss ให้เด็ดขาดขึ้น",
    bestPartner: { name: "นักลงทุนสายระบบ 🧠", desc: "ช่วยตบความคิดคุณให้กลับมาอยู่ในแผนและมีระบบระเบียบ" },
    kryptonite: { name: "ผู้พิทักษ์เงินฝาก 🛡️", desc: "คุยกันไม่ค่อยรู้เรื่อง เพราะอีกฝั่งกลัวความเสี่ยงจนไม่กล้าทำอะไรเลย" }
  },
  MID_RISK_MID_DISC: {
    title: "มนุษย์สมดุล", subtitle: "The Balanced One", 
    color: "bg-gradient-to-r from-amber-500 to-yellow-500", barColor: "bg-amber-500", emoji: "⚖️", titleColor: "text-amber-600",
    desc: "ทางสายกลางที่แท้ทรู! เก็บเงินบ้าง ใช้ชีวิตบ้าง ลงทุนนิดหน่อย ไม่ตึงไม่หย่อนเกินไป ชีวิตแฮปปี้ดีแต่พอร์ตอาจจะโตเรื่อยๆ ไม่หวือหวา",
    warning: "ความสมดุลเป็นเรื่องดี แต่ถ้าไม่มี 'เป้าหมายที่ชัดเจน' อาจจะเหนื่อยตอนอยากเกษียณนะ",
    bestPartner: { name: "เครื่องจักรปั้นพอร์ต 📈", desc: "ช่วยกระตุ้นให้คุณเริ่มลงทุนอย่างสม่ำเสมอเป็นระบบมากขึ้น" },
    kryptonite: { name: "สายกาว All-in 🦍", desc: "รำคาญความวู่วามเวลาอีกฝ่ายพอร์ตแตกแล้วมานั่งบ่น" }
  },
  LOW_RISK_MID_DISC: {
    title: "สายเก็บเผื่อฉุกเฉิน", subtitle: "The Safety Net", 
    color: "bg-gradient-to-r from-teal-500 to-cyan-400", barColor: "bg-teal-500", emoji: "🛟", titleColor: "text-teal-600",
    desc: "หามาได้ก็เก็บไว้ให้อุ่นใจ ไม่ชอบความวุ่นวายของการลงทุน มีเงินสำรองนะ แต่ชอบปล่อยเงินแช่ทิ้งไว้ในบัญชีออมทรัพย์เฉยๆ",
    warning: "เสียดายโอกาสที่เงินจะงอกเงย ลองแบ่งเงินก้อนนี้ไปใส่กองทุนรวมตลาดเงิน หรือแอปเก็บเงินดอกเบี้ยสูงดูไหม?",
    bestPartner: { name: "เครื่องจักรปั้นพอร์ต 📈", desc: "พาคุณก้าวข้ามเซฟโซนไปลงทุนแบบความเสี่ยงต่ำ-ปานกลางได้" },
    kryptonite: { name: "นักล่าเทรนด์ 🌊", desc: "เห็นสไตล์การหมุนเงินของเขาแล้วหัวใจจะวายแทน" }
  },

  // 🔴 วินัยต่ำ (Low Discipline)
  HIGH_RISK_LOW_DISC: {
    title: "สายกาว All-in", subtitle: "The Degen Gambler", 
    color: "bg-gradient-to-r from-red-600 to-rose-600", barColor: "bg-red-500", emoji: "🦍", titleColor: "text-red-600",
    desc: "ใจคอโหดเหี้ยม! ไม่รวยก็ดอยไปเลย ชอบเหรียญมีม ซื้อตามกาวล้วนๆ กราฟไม่ต้อง งบไม่สน ขอแค่ได้ลุ้น ตกรถเจ็บกว่าติดดอย!",
    warning: "สภาพคล่องพังง่ายมาก ควรหักดิบแบ่งเงินมาสร้าง Emergency Fund ไว้บ้าง จะได้ไม่เจ็บหนักเวลาตลาดแครช",
    bestPartner: { name: "สายเดือนชนเดือน 🛶", desc: "เข้ากันได้ดีเรื่องการใช้ชีวิตสุดเหวี่ยงและเอาตัวรอดไปวันๆ" },
    kryptonite: { name: "นักลงทุนสายระบบ 🧠", desc: "ขั้วตรงข้ามที่แท้ทรู คุยกันทีไรโดนเทศน์เรื่องการจัดการความเสี่ยงทุกที" }
  },
  MID_RISK_LOW_DISC: {
    title: "สายเปย์ตามฟีล", subtitle: "The Lifestyle Spender", 
    color: "bg-gradient-to-r from-pink-500 to-rose-400", barColor: "bg-pink-500", emoji: "🛍️", titleColor: "text-pink-600",
    desc: "ของมันต้องมี! ประสบการณ์ต้องมาก่อน เงินเดือนคือเงินทอน หาเงินเก่งนะ แต่ละลายไปกับของเซลล์ ปาร์ตี้ และภาษีสังคมหมด",
    warning: "สนุกวันนี้ ระวังเหนื่อยวันหน้า! เริ่มต้นง่ายๆ ด้วยการหักเงินออมอัตโนมัติ 10% ทันทีที่เงินเดือนออก (Pay Yourself First)",
    bestPartner: { name: "มนุษย์สมดุล ⚖️", desc: "ช่วยแตะเบรกเวลาคุณกำลังจะรูดบัตรเครดิตใบที่ 3" },
    kryptonite: { name: "เครื่องจักรปั้นพอร์ต 📈", desc: "โดนบ่นประจำว่าทำไมไม่ยอมเอาเงินไปทำประโยชน์ให้งอกเงย" }
  },
  LOW_RISK_LOW_DISC: {
    title: "สายเดือนชนเดือน", subtitle: "The Survivor", 
    color: "bg-gradient-to-r from-stone-500 to-stone-400", barColor: "bg-stone-500", emoji: "🛶", titleColor: "text-stone-600",
    desc: "ชีวิตคือการสู้กลับ! บริหารเงินแบบวันต่อวัน หมุนเงินเก่งยิ่งกว่ากังหันลม แต่ยังขาดแต้มต่อในการสะสมความมั่งคั่งระยะยาว",
    warning: "ต้องอุดรอยรั่วด่วน! ลองทำบัญชีรายรับ-รายจ่าย หาจุดลดคอร์ส หรือโฟกัสที่การ 'อัปสกิล' เพิ่มรายได้ช่องทางที่สอง",
    bestPartner: { name: "ผู้พิทักษ์เงินฝาก 🛡️", desc: "ช่วยสอนเทคนิคการประหยัดและการเก็บเงินก้อนแรกในชีวิต" },
    kryptonite: { name: "สายเปย์ตามฟีล 🛍️", desc: "อยู่ใกล้แล้วกิเลสเกิดง่าย พากันเสียตังค์ตลอดเวลา" }
  }
};