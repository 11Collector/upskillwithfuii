export interface SkillDayQuest {
  day: number;
  dayTitle: string;
  focusTopic: string;
  quests: {
    id: string;
    title: string;
    type: "SKILL_MAIN" | "PERSONALIZED_HABIT" | "REFLECTION_CHALLENGE";
    xp: number;
    tag: string;
    desc: string;
    actionType?: "wheel" | "disc" | "money" | "library" | "focus" | "chat" | "custom";
    actionPath?: string;
  }[];
}

export interface SkillTrack {
  id: string;
  title: string;
  subtitle: string;
  wheelCategory: string;
  icon: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  description: string;
  outcomes: string[];
  days: SkillDayQuest[];
}

export const SKILL_TRACKS: Record<string, SkillTrack> = {
  money: {
    id: "money",
    title: "วิชาการเงิน",
    subtitle: "Money Mastery & Financial Freedom",
    wheelCategory: "การเงิน",
    icon: "💰",
    color: "amber",
    borderColor: "border-amber-500/40",
    bgGradient: "from-amber-600/20 via-orange-600/10 to-slate-900",
    description: "ฝึกบริหารเงิน อุดรอยรั่วทางการเงิน และจัดระเบียบพอร์ตความมั่งคั่งตาม Money Avatar ของคุณ",
    outcomes: ["อุดรอยรั่วทางการเงินในชีวิตประจำวัน", "รู้เท่าทันกับดักอารมณ์ช้อปปิ้ง", "สร้างระบบเงินออมฉุกเฉิน"],
    days: [
      {
        day: 1,
        dayTitle: "Day 1: Financial Audit & รอยรั่ว",
        focusTopic: "ตรวจสอบสถานะการเงินปัจจุบัน",
        quests: [
          {
            id: "money_d1_main",
            title: "บันทึกรายจ่าย 3 รายการล่าสุด แล้วแยกแยะว่าสิ่งไหนคือ 'Need' (จำเป็น) หรือ 'Want' (อยากได้)",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการเงิน D1",
            desc: "เริ่มจากการเห็นความจริงก่อนบริหารเงิน"
          },
          {
            id: "money_d1_habit",
            title: "ตั้งสติก่อนกดสั่งซื้อ: พักตระกร้าสินค้าไว้ 24 ชั่วโมงก่อนกดจ่ายเงิน",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ชะลออารมณ์ช้อปปิ้งชั่วคราว"
          },
          {
            id: "money_d1_challenge",
            title: "ทบทวนและตกตะกอนเป้าหมายทางการเงินที่คุณอยากอัปเลเวลในปีนี้",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "เป้าหมายการเงิน",
            desc: "ตกตะกอนเป้าหมายรายได้และออมเงิน"
          }
        ]
      },
      {
        day: 2,
        dayTitle: "Day 2: Money Avatar Alignment",
        focusTopic: "เข้าใจพฤติกรรมเงินตาม Avatar",
        quests: [
          {
            id: "money_d2_main",
            title: "ทบทวนพฤติกรรมการใช้เงินตามสไตล์ของคุณ และจดหลุมพรางทางการเงิน 1 ข้อที่เจอบ่อยที่สุด",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการเงิน D2",
            desc: "ส่องกระจกดูพฤติกรรมเงิน"
          },
          {
            id: "money_d2_habit",
            title: "ยกเลิกหรือ Pause การกดติดตามเพจช้อปปิ้ง/สินค้าลดราคาเป็นเวลา 1 สัปดาห์",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ขจัดสิ่งล่อใจจากสิ่งแวดล้อม"
          },
          {
            id: "money_d2_challenge",
            title: "จัดเวลาสมาธิ 25 นาที ทบทวนจัดระเบียบบัญชีเงินฝากและรายรับรายจ่าย",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "จัดระเบียบเงิน",
            desc: "ใช้เวลาสมาธิกับเรื่องเงิน"
          }
        ]
      },
      {
        day: 3,
        dayTitle: "Day 3: Emergency Buffer",
        focusTopic: "สร้างเกราะป้องกันเงินสำรอง",
        quests: [
          {
            id: "money_d3_main",
            title: "คำนวณค่าใช้จ่ายจำเป็นรายเดือน แล้วเช็กว่าตอนนี้มีเงินสำรองฉุกเฉินกี่เดือน",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการเงิน D3",
            desc: "สร้างรากฐานความปลอดภัยให้ชีวิต"
          },
          {
            id: "money_d3_habit",
            title: "โอนเงินออมก้อนเล็กทันทีที่เห็นเควสต์นี้ (ไม่ว่าจะ 50 หรือ 100 บาท)",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ฝึกสมองสร้างนิสัยออมก่อนใช้"
          },
          {
            id: "money_d3_challenge",
            title: "ศึกษาและอ่านแนวทางการจัดการการเงินและการใช้ชีวิตอย่างมีสติ",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ความรู้การเงิน",
            desc: "เติมอาหารสมองด้านการเงิน"
          }
        ]
      },
      {
        day: 4,
        dayTitle: "Day 4: Friction Elimination",
        focusTopic: "กำจัดค่าใช้จ่ายแฝง",
        quests: [
          {
            id: "money_d4_main",
            title: "ตรวจสอบบริการ Subscription รายเดือนทั้งหมดที่ไม่ได้ใช้จริงแล้วกด ยกเลิก (Cancel)",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการเงิน D4",
            desc: "ตัดงบเงียบที่ดูดเงินออกทุกเดือน"
          },
          {
            id: "money_d4_habit",
            title: "เปลี่ยนการเปย์อารมณ์ด้วยของขวัญชิ้นใหญ่ เป็นการทำกิจกรรมผ่อนคลายที่ไม่ต้องเสียเงิน",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "แยกความสุขออกจากปริมาณเงินที่จ่าย"
          },
          {
            id: "money_d4_challenge",
            title: "วางเป้าหมายการออมและการสร้างรายได้เพิ่มในระยะยาว",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "วางแผนระยะยาว",
            desc: "กำหนดเป้าหมายความมั่งคั่ง"
          }
        ]
      },
      {
        day: 5,
        dayTitle: "Day 5: Value-Based Spending",
        focusTopic: "จ่ายเงินเพื่อคุณค่าที่แท้จริง",
        quests: [
          {
            id: "money_d5_main",
            title: "เขียนรายการ 3 สิ่งที่จ่ายเงินแล้วรู้สึกคุ้มค่าและมีความสุขที่สุดในรอบเดือนที่ผ่านมา",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการเงิน D5",
            desc: "เรียนรู้ว่าสิ่งใดคือคุณค่าที่แท้จริงของคุณ"
          },
          {
            id: "money_d5_habit",
            title: "ตั้งเป้าไม่ใช้เงินซื้อของฟุ่มเฟือยตลอด 24 ชั่วโมงข้างหน้า (No-Spend Day Challenge)",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ท้าทายวินัย No-Spend Day"
          },
          {
            id: "money_d5_challenge",
            title: "ใช้เวลาสมาธิ 25 นาที วิเคราะห์แนวทางเพิ่มรายได้และพัฒนาพอร์ต",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "วิเคราะห์พอร์ต",
            desc: "วิเคราะห์การสร้างรายได้เพิ่ม"
          }
        ]
      },
      {
        day: 6,
        dayTitle: "Day 6: Automated Wealth System",
        focusTopic: "สร้างระบบออมและลงทุนอัตโนมัติ",
        quests: [
          {
            id: "money_d6_main",
            title: "ตั้งค่าตัดเงินอัตโนมัติ (DCA) ไปยังบัญชีออม/กองทุน หรือวางแผนวันที่ตัดเงินทันทีหลังเงินเดือนออก",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการเงิน D6",
            desc: "ตัดเรื่องอารมณ์ออกจากระบบเงิน"
          },
          {
            id: "money_d6_habit",
            title: "สำรวจสิ่งของที่ไม่ได้ใช้แล้วในบ้าน 1 ชิ้นเพื่อนำไปขายหรือส่งต่อให้เกิดประโยชน์",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "เปลี่ยนของเป็นทุนและคืนพื้นที่"
          },
          {
            id: "money_d6_challenge",
            title: "ทบทวนตัวตนและสไตล์ทางการเงินเพื่อเตรียมพร้อมต่อยอด",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ทบทวนสไตล์การเงิน",
            desc: "ทบทวนตัวตนทางการเงิน"
          }
        ]
      },
      {
        day: 7,
        dayTitle: "Day 7: Victory & Master Reflection",
        focusTopic: "สรุปบทเรียนและรับเกียรติบัตรวิชาการเงิน",
        quests: [
          {
            id: "money_d7_main",
            title: "ทบทวน 7 วันที่ผ่านมา แล้วสรุป 1 บทเรียนการเงินที่เปลี่ยนความคิดคุณมากที่สุด",
            type: "SKILL_MAIN",
            xp: 100,
            tag: "VICTORY D7",
            desc: "สำเร็จวิชาอิสรภาพการเงิน 7 วัน!"
          },
          {
            id: "money_d7_habit",
            title: "อัปเดตคะแนนวงล้อชีวิต (Wheel of Life) ด้านการเงินเพิ่มขึ้น 1 คะแนนเป็นรางวัล!",
            type: "PERSONALIZED_HABIT",
            xp: 50,
            tag: "WHEEL LEVEL UP",
            desc: "ยกระดับคะแนน Wheel of Life"
          },
          {
            id: "money_d7_challenge",
            title: "ฉลองความสำเร็จ! รับตรา Money Master Badge และเลือกวิชาถัดไปสำหรับสัปดาห์หน้า",
            type: "REFLECTION_CHALLENGE",
            xp: 50,
            tag: "MASTER BADGE",
            desc: "รับตราเกียรติยศประจำวิชา"
          }
        ]
      }
    ]
  },

  relationship: {
    id: "relationship",
    title: "วิชาความสัมพันธ์",
    subtitle: "People & DISC Mastery",
    wheelCategory: "เพื่อนฝูง",
    icon: "👨‍👩‍👧",
    color: "purple",
    borderColor: "border-purple-500/40",
    bgGradient: "from-purple-600/20 via-indigo-600/10 to-slate-900",
    description: "เข้าใจสไตล์บุคลิกภาพ DISC ของตนเองและคนรอบข้าง เพื่อการสื่อสารที่มีเสน่ห์ ลึกซึ้ง และลดความขัดแย้ง",
    outcomes: ["อ่านสไตล์คนรอบข้าง (D, I, S, C) ออก", "ลดข้อขัดแย้งในการทำงานและชีวิตคู่", "สร้างสายสัมพันธ์ที่จริงใจ"],
    days: [
      {
        day: 1,
        dayTitle: "Day 1: DISC Self-Awareness",
        focusTopic: "เข้าใจสไตล์ DISC ของตัวเอง",
        quests: [
          {
            id: "rel_d1_main",
            title: "ทบทวนสไตล์บุคลิกภาพของคุณ จด 1 จุดแข็งการสื่อสาร และ 1 Blind Spot ที่ต้องระวัง",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาความสัมพันธ์ D1",
            desc: "เข้าใจตัวเองก่อนเข้าใจผู้อื่น"
          },
          {
            id: "rel_d1_habit",
            title: "ฝึกเป็นผู้ฟังที่ดี: ในบทสนทนาถัดไป ฟังโดยไม่พูดขัดจังหวะจนกว่าอีกฝ่ายจะพูดจบ",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ฝึก Active Listening"
          },
          {
            id: "rel_d1_challenge",
            title: "ตกตะกอนแนวทางปรับสไตล์การสื่อสารของคุณให้เข้ากับคนรอบข้าง",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "เทคนิคการสื่อสาร",
            desc: "ทบทวนการสื่อสาร"
          }
        ]
      },
      {
        day: 2,
        dayTitle: "Day 2: Listening & Empathy",
        focusTopic: "ฟังให้ลึกถึงความรู้สึก",
        quests: [
          {
            id: "rel_d2_main",
            title: "ทักทายและชมเชยความตั้งใจของคนรอบข้าง (เพื่อน/ทีมงาน/ครอบครัว) อย่างจริงใจ 1 คน",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาความสัมพันธ์ D2",
            desc: "ส่งพลังบวกให้คนใกล้ตัว"
          },
          {
            id: "rel_d2_habit",
            title: "วางโทรศัพท์มือถือลงขณะพูดคุยกับคนตรงหน้า (100% Present Conversation)",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ให้เกียรติคู่สนทนา"
          },
          {
            id: "rel_d2_challenge",
            title: "ศึกษาและเติมความรู้เรื่องศิลปะการฟังและทักษะความสัมพันธ์",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ศิลปะการฟัง",
            desc: "อาหารสมองด้านความสัมพันธ์"
          }
        ]
      },
      {
        day: 3,
        dayTitle: "Day 3: Decoding Others",
        focusTopic: "วิเคราะห์สไตล์ DISC ของคนรอบตัว",
        quests: [
          {
            id: "rel_d3_main",
            title: "สังเกตเพื่อนร่วมงานหรือคนใกล้ชิด 1 คน แล้วลองวิเคราะห์ว่าเขาเป็นสาย D, I, S หรือ C",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาความสัมพันธ์ D3",
            desc: "ฝึกอ่านสไตล์คนรอบข้าง"
          },
          {
            id: "rel_d3_habit",
            title: "ปรับคำพูด 1 ประโยคให้เหมาะกับสไตล์คู่สนทนา (เช่น สาย D เน้นกระชับ, สาย S เน้นความใส่ใจ)",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ปรับจูนคลื่นการพูดคุย"
          },
          {
            id: "rel_d3_challenge",
            title: "จัดเวลาสมาธิเงียบๆ ทบทวนรายชื่อคนสำคัญในชีวิตและเป้าหมายความสัมพันธ์",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "วางแผนความสัมพันธ์",
            desc: "ทบทวนความสัมพันธ์สำคัญ"
          }
        ]
      },
      {
        day: 4,
        dayTitle: "Day 4: Reconnecting Impact",
        focusTopic: "ฟื้นฟูสายสัมพันธ์ที่หลงลืม",
        quests: [
          {
            id: "rel_d4_main",
            title: "ค้นหาเทคนิคสร้างแรงบันดาลใจให้ทีมงาน 3 คนออกลุยไปด้วยกันอย่างมีพลัง",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาความสัมพันธ์ D4",
            desc: "สร้างแรงขับเคลื่อนให้ทีม"
          },
          {
            id: "rel_d4_habit",
            title: "กล่าวคำว่า 'ขอบคุณ' ด้วยรอยยิ้มอย่างตั้งใจเมื่อได้รับความช่วยเหลือแม้เพียงเล็กน้อย",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ฝึก Gratitude ในการสื่อสาร"
          },
          {
            id: "rel_d4_challenge",
            title: "ตกตะกอนแนวทางจัดการความขัดแย้ง (Conflict Resolution) อย่างสร้างสรรค์",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "การจัดการความขัดแย้ง",
            desc: "คลี่คลายความขัดแย้ง"
          }
        ]
      },
      {
        day: 5,
        dayTitle: "Day 5: Healthy Boundaries",
        focusTopic: "สร้างขอบเขตที่ดีและกล้าปฏิเสธอย่างมีเสน่ห์",
        quests: [
          {
            id: "rel_d5_main",
            title: "ฝึกการปฏิเสธคำขอที่ไม่จำเป็นอย่างสุภาพและนุ่มนวล เพื่อปกป้องเวลาและพลังงานของคุณ",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาความสัมพันธ์ D5",
            desc: "สร้าง Boundary ที่แข็งแรง"
          },
          {
            id: "rel_d5_habit",
            title: "หลีกเลี่ยงการนินทาหรือพูดถึงผู้อื่นในแง่ลบตลอด 24 ชั่วโมงข้างหน้า",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "รักษาพลังงานบวกในการสื่อสาร"
          },
          {
            id: "rel_d5_challenge",
            title: "ทบทวนและเขียนสิ่งที่คุณอยากปรับปรุงในความสัมพันธ์หลักของชีวิต",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ปรับปรุงความสัมพันธ์",
            desc: "ตกตะกอนขอบเขตชีวิต"
          }
        ]
      },
      {
        day: 6,
        dayTitle: "Day 6: Deep Meaningful Connection",
        focusTopic: "พูดคุยเรื่องเป้าหมายและความคิดลึกซึ้ง",
        quests: [
          {
            id: "rel_d6_main",
            title: "ชวนคนสำคัญในชีวิตคุยเรื่องเป้าหมายหรือความฝันในปีนี้ 15 นาที โดยไม่วิพากษ์วิจารณ์",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาความสัมพันธ์ D6",
            desc: "สร้างบทสนทนาที่มีคุณค่า"
          },
          {
            id: "rel_d6_habit",
            title: "ส่งข้อความหรือการ์ดขอบคุณคนที่มีอิทธิพลต่อความก้าวหน้าของคุณ 1 คน",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "สร้างรอยยิ้มให้ผู้อื่น"
          },
          {
            id: "rel_d6_challenge",
            title: "ทบทวนรูปแบบพฤติกรรมและการสื่อสารเพื่อเตรียมสำเร็จวิชาความสัมพันธ์",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "สรุปการสื่อสาร",
            desc: "ทบทวนสไตล์บุคลิกภาพ"
          }
        ]
      },
      {
        day: 7,
        dayTitle: "Day 7: Victory & Master Reflection",
        focusTopic: "สรุปผลการฝึกความสัมพันธ์ 7 วัน",
        quests: [
          {
            id: "rel_d7_main",
            title: "สรุป 1 บทเรียนความสัมพันธ์และการสื่อสารที่ทำให้คุณเข้าใจคนรอบข้างมากขึ้นใน 7 วันนี้",
            type: "SKILL_MAIN",
            xp: 100,
            tag: "VICTORY D7",
            desc: "สำเร็จวิชาความสัมพันธ์ & การสื่อสาร 7 วัน!"
          },
          {
            id: "rel_d7_habit",
            title: "อัปเดตคะแนนวงล้อชีวิต (Wheel of Life) ด้านเพื่อนฝูง/ครอบครัว เพิ่มขึ้น 1 คะแนน!",
            type: "PERSONALIZED_HABIT",
            xp: 50,
            tag: "WHEEL LEVEL UP",
            desc: "ยกระดับคะแนน Wheel of Life"
          },
          {
            id: "rel_d7_challenge",
            title: "ฉลองความสำเร็จ! รับตรา People Master Badge และเลือกวิชาถัดไปสำหรับสัปดาห์หน้า",
            type: "REFLECTION_CHALLENGE",
            xp: 50,
            tag: "MASTER BADGE",
            desc: "รับตราเกียรติยศประจำวิชา"
          }
        ]
      }
    ]
  },

  mindset: {
    id: "mindset",
    title: "วิชาพัฒนาตนเอง",
    subtitle: "Soul & Mindset Mastery",
    wheelCategory: "พัฒนาตนเอง",
    icon: "🧠",
    color: "violet",
    borderColor: "border-violet-500/40",
    bgGradient: "from-violet-600/20 via-purple-600/10 to-slate-900",
    description: "ก้าวข้าม Limiting Beliefs ปรับเปลี่ยนความคิดเชิงลบ และตกตะกอนปัญญาจาก Library of Souls",
    outcomes: ["สลัดความกลัวและความเชื่อที่จำกัดตัวเอง", "สร้าง Growth Mindset แข็งแกร่ง", "มีตรรกะความคิดที่สงบและแม่นยำ"],
    days: [
      {
        day: 1,
        dayTitle: "Day 1: Uncover Limiting Beliefs",
        focusTopic: "ค้นหาความเชื่อที่ฉุดรั้งคุณอยู่",
        quests: [
          {
            id: "mind_d1_main",
            title: "ทบทวนความคิดและค้นหา 1 ความเชื่อที่จำกัดตัวเอง (Limiting Belief) ที่อยากก้าวข้าม",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชา MINDSET D1",
            desc: "ถอดรหัสความคิดลึกซึ้ง"
          },
          {
            id: "mind_d1_habit",
            title: "จับสังเกตความคิดลบเมื่อเจออุปสรรค แล้วเปลี่ยนประโยคเป็น 'ฉันกำลังเรียนรู้เรื่องนี้อยู่'",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "เปลี่ยน Reframing Mindset"
          },
          {
            id: "mind_d1_challenge",
            title: "ตกตะกอนแนวทางสลัดความคิดลบที่มักรบกวนคุณเวลาเริ่มทำสิ่งใหม่",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ปลดล็อกกรอบคิด",
            desc: "ปลดล็อกกรอบความคิด"
          }
        ]
      },
      {
        day: 2,
        dayTitle: "Day 2: Reframe Negative Self-Talk",
        focusTopic: "เปลี่ยนเสียงในหัวให้กลายเป็นพลัง",
        quests: [
          {
            id: "mind_d2_main",
            title: "เขียนความกลัวหรือความเชื่อลบ 1 เรื่อง แล้วเขียนมุมมองใหม่เชิงบวกที่ท้าทายความกลัวนั้น",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชา MINDSET D2",
            desc: "สลัดความเชื่อที่จำกัดตัวเอง"
          },
          {
            id: "mind_d2_habit",
            title: "ฝึกให้กำลังใจตัวเองหน้ากระจก 30 วินาทีในตอนเช้าก่อนเริ่มวัน",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "เติม Self-Compassion"
          },
          {
            id: "mind_d2_challenge",
            title: "จัดเวลาสมาธิ 25 นาที อ่านหนังสือหรือแนวคิดปรับ Mindset และจดบันทึกสติ",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "บันทึกสติ",
            desc: "ตกตะกอนความคิด"
          }
        ]
      },
      {
        day: 3,
        dayTitle: "Day 3: Growth vs Fixed Mindset",
        focusTopic: "เปลี่ยนข้อผิดพลาดให้เป็นบทเรียน",
        quests: [
          {
            id: "mind_d3_main",
            title: "นึกถึงข้อผิดพลาดในอดีต 1 เรื่อง แล้วเขียน 2 สิ่งที่คุณได้เรียนรู้จากมัน",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชา MINDSET D3",
            desc: "เปลี่ยนล้มเหลวเป็นบทเรียน"
          },
          {
            id: "mind_d3_habit",
            title: "เมื่อทำสิ่งใดผิดพลาด ให้บอกตัวเองว่า 'เป็นเรื่องธรรมดา ลองอีกครั้งในวิธีที่ดีกว่าเดิม'",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "สร้าง Resilience"
          },
          {
            id: "mind_d3_challenge",
            title: "อ่านแนวคิดและบทความเกี่ยวกับการสร้าง Growth Mindset และระบบคิดที่ดี",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "Growth Mindset",
            desc: "เติมความรู้ปัญญา"
          }
        ]
      },
      {
        day: 4,
        dayTitle: "Day 4: Emotional Regulation",
        focusTopic: "จัดการอารมณ์และแยกแยะเรื่องที่คุมได้",
        quests: [
          {
            id: "mind_d4_main",
            title: "แบ่งรายการเรื่องที่กังวลออกเป็น 2 ฝั่ง: ฝั่งที่ 'ควบคุมได้' vs ฝั่งที่ 'ควบคุมไม่ได้'",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชา MINDSET D4",
            desc: "ปล่อยวางสิ่งที่คุมไม่ได้"
          },
          {
            id: "mind_d4_habit",
            title: "เมื่อเริ่มรู้สึกเครียด ให้สูดหายใจลึกๆ 4-7-8 เป็นเวลา 2 นาทีเพื่อดึงสติตรงหน้า",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ฝึกควบคุมอารมณ์"
          },
          {
            id: "mind_d4_challenge",
            title: "ตกตะกอนเทคนิคการปล่อยวางความคิดฟุ่มเฟือยในสมอง",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "จิตใจสงบ",
            desc: "ทบทวนความสงบใจ"
          }
        ]
      },
      {
        day: 5,
        dayTitle: "Day 5: Habit of Mental Clarity",
        focusTopic: "ขจัดขยะทางอารมณ์และข่าวลบ",
        quests: [
          {
            id: "mind_d5_main",
            title: "ทำ Digital Detox หยุดเสพข่าวลบหรือโซเชียลมีเดียที่ทำให้จิตใจว้าวุ่นเป็นเวลา 2 ชั่วโมง",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชา MINDSET D5",
            desc: "คืนพื้นที่สงบให้สมอง"
          },
          {
            id: "mind_d5_habit",
            title: "เขียนบันทึกขอบคุณ (Gratitude Journal) 3 สิ่งที่คุณรู้สึกขอบคุณในวันนี้",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ฝึก Gratitude ทุกวัน"
          },
          {
            id: "mind_d5_challenge",
            title: "ใช้เวลาสมาธิ 25 นาที ทบทวนบันทึกเป้าหมายชีวิตของคุณอย่างสงบ",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "สมาธิเป้าหมาย",
            desc: "สร้างสมาธิความเงียบ"
          }
        ]
      },
      {
        day: 6,
        dayTitle: "Day 6: Action Despite Fear",
        focusTopic: "กล้าลงมือทำแม้ยื่นอยู่หน้าความกลัว",
        quests: [
          {
            id: "mind_d6_main",
            title: "ทำ 1 สิ่งที่คุณเคยเลื่อนเพราะความกลัวหรือลังเล (Small Brave Action) ให้สำเร็จวันนี้",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชา MINDSET D6",
            desc: "ก้าวข้ามความกลัว"
          },
          {
            id: "mind_d6_habit",
            title: "เมื่อเกิดความลังเล ให้ใช้กฎ 5 วินาที (นับ 5-4-3-2-1 แล้วลงมือทำทันที)",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ขจัดอาการเลื่อนวันประกันพรุ่ง"
          },
          {
            id: "mind_d6_challenge",
            title: "ทบทวนบทเรียนและสติปัญญาทางความคิดเพื่อเตรียมสำเร็จวิชา",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ตกตะกอนปัญญา",
            desc: "ทบทวนบทเรียนปัญญา"
          }
        ]
      },
      {
        day: 7,
        dayTitle: "Day 7: Victory & Master Reflection",
        focusTopic: "สรุปผลการปรับ Mindset 7 วัน",
        quests: [
          {
            id: "mind_d7_main",
            title: "สรุป 1 ความคิดหรือกรอบจิตวิญญาณใหม่ที่เปลี่ยนให้คุณเป็นคนเข้มแข็งขึ้นใน 7 วันนี้",
            type: "SKILL_MAIN",
            xp: 100,
            tag: "VICTORY D7",
            desc: "สำเร็จวิชา Mindset & ตรรกะความคิด 7 วัน!"
          },
          {
            id: "mind_d7_habit",
            title: "อัปเดตคะแนนวงล้อชีวิต (Wheel of Life) ด้านพัฒนาตนเอง/จิตใจ เพิ่มขึ้น 1 คะแนน!",
            type: "PERSONALIZED_HABIT",
            xp: 50,
            tag: "WHEEL LEVEL UP",
            desc: "ยกระดับคะแนน Wheel of Life"
          },
          {
            id: "mind_d7_challenge",
            title: "ฉลองความสำเร็จ! รับตรา Mindset Master Badge และเลือกวิชาถัดไปสำหรับสัปดาห์หน้า",
            type: "REFLECTION_CHALLENGE",
            xp: 50,
            tag: "MASTER BADGE",
            desc: "รับตราเกียรติยศประจำวิชา"
          }
        ]
      }
    ]
  },

  career: {
    id: "career",
    title: "วิชาการงาน",
    subtitle: "Career & High Output",
    wheelCategory: "การงาน",
    icon: "💼",
    color: "blue",
    borderColor: "border-blue-500/40",
    bgGradient: "from-blue-600/20 via-cyan-600/10 to-slate-900",
    description: "เพิ่มประสิทธิภาพการทำงาน ผลิตผลงานคุณภาพสูง ขจัดความล้า และสร้างขีดความสามารถการเป็นผู้นำ",
    outcomes: ["ทำงานเสร็จไวขึ้นด้วยเทคนิค Deep Work", "จัดลำดับความสำคัญงานสำคัญสูง", "เพิ่มศักยภาพการเติบโตทางอาชีพ"],
    days: [
      {
        day: 1,
        dayTitle: "Day 1: Priority & Eisenhower Matrix",
        focusTopic: "จัดลำดับงานสำคัญสูง",
        quests: [
          {
            id: "car_d1_main",
            title: "เขียนรายการงานทั้งหมด แล้วคัด 3 งานสำคัญที่สุดประจำวัน (Top 3 Priority Tasks)",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการงาน D1",
            desc: "เน้นงานที่มี Impact สูงสุด"
          },
          {
            id: "car_d1_habit",
            title: "ทำสิ่งที่สำคัญที่สุดก่อนเป็นสิ่งแรกในตอนเช้า (Eat That Frog)",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ลุยงานยากก่อนสมองล้า"
          },
          {
            id: "car_d1_challenge",
            title: "จัดเวลาโฟกัสเข้มข้น ทำงานสำคัญข้อแรกให้เสร็จโดยไม่เปิดโซเชียล",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "สร้างผลงาน",
            desc: "สร้างผลงานก้อนแรก"
          }
        ]
      },
      {
        day: 2,
        dayTitle: "Day 2: Deep Work Routine",
        focusTopic: "สร้างช่วงเวลาโฟกัสไร้สิ่งรบกวน",
        quests: [
          {
            id: "car_d2_main",
            title: "กำหนดช่วงเวลาโฟกัสเข้มข้น 50 นาที โดยปิดการแจ้งเตือนแอปและอีเมลทั้งหมด",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการงาน D2",
            desc: "ฝึกภาวะลื่นไหล (Flow State)"
          },
          {
            id: "car_d2_habit",
            title: "จัดโต๊ะทำงานหรือหน้าจอคอมพิวเตอร์ให้สะอาดเป็นระเบียบก่อนเริ่มงาน",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "สร้างสิ่งแวดล้อมที่เอื้อต่อสมาธิ"
          },
          {
            id: "car_d2_challenge",
            title: "ตกตะกอนเทคนิคจัดระเบียบเวลาและการทำงานอย่างมีประสิทธิภาพสูง",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "จัดระเบียบเวลา",
            desc: "รับเทคนิคผลิตผลงาน"
          }
        ]
      },
      {
        day: 3,
        dayTitle: "Day 3: Delegation & Systems",
        focusTopic: "วางระบบและใช้ AI ช่วยทุ่นแรง",
        quests: [
          {
            id: "car_d3_main",
            title: "สำรวจงานซ้ำซ้อนที่ทำบ่อย แล้วทดลองใช้ AI หรือการเขียน Template เพื่อทุ่นแรง",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการงาน D3",
            desc: "เพิ่มพลังผลิตด้วยระบบ"
          },
          {
            id: "car_d3_habit",
            title: "สรุปผลงานและการเรียนรู้สั้นๆ 3 บรรทัดก่อนปิดคอมพิวเตอร์จบวัน",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ทบทวน Progress รายวัน"
          },
          {
            id: "car_d3_challenge",
            title: "ศึกษาและอ่านแนวทางการทำงานที่มีประสิทธิภาพสูงและการเติบโตในอาชีพ",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ทักษะการทำงาน",
            desc: "อาหารสมองด้านการทำงาน"
          }
        ]
      },
      {
        day: 4,
        dayTitle: "Day 4: Communication & Leadership",
        focusTopic: "สื่อสารงานกระชับและมีประสิทธิภาพ",
        quests: [
          {
            id: "car_d4_main",
            title: "สรุปประเด็นประชุมหรือความก้าวหน้าของงานให้ทีม/หัวหน้าด้วยรูปแบบกระชับ สั้น ตรงประเด็น",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการงาน D4",
            desc: "เพิ่มทักษะการสื่อสารเชิงรุก"
          },
          {
            id: "car_d4_habit",
            title: "เช็กอีเมลหรือแชตงานเป็นรอบเวลา (เช่น 11:00 และ 16:00) แทนการเปิดดูตลอดเวลา",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ป้องกันการโดนขัดจังหวะ"
          },
          {
            id: "car_d4_challenge",
            title: "จัดช่วงเวลาเคลียร์งานค้างชิ้นใหญ่ให้เสร็จทันเวลา",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "เคลียร์งานใหญ่",
            desc: "ปิดงานชิ้นใหญ่"
          }
        ]
      },
      {
        day: 5,
        dayTitle: "Day 5: Skill Upgrade & Learning",
        focusTopic: "เติมทักษะใหม่ที่ตลาดต้องการ",
        quests: [
          {
            id: "car_d5_main",
            title: "ศึกษาทักษะใหม่หรือ Tool ใหม่ที่เกี่ยวเนื่องกับงานของคุณเป็นเวลา 30 นาที",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการงาน D5",
            desc: "อัพเลเวลทักษะติดตัว"
          },
          {
            id: "car_d5_habit",
            title: "บันทึก 1 ปัญหาที่เจอในการทำงานวันนี้ พร้อมเขียน 1 แนวทางแก้ไขที่สร้างสรรค์",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ฝึก Problem Solving Mindset"
          },
          {
            id: "car_d5_challenge",
            title: "วางแผนและทบทวนเส้นทางเติบโตในอาชีพ (Career Pathway) ของคุณ",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "เส้นทางเติบโต",
            desc: "วางแผนการเติบโต"
          }
        ]
      },
      {
        day: 6,
        dayTitle: "Day 6: Weekly Review & Planning",
        focusTopic: "ประเมินและวางแผนสัปดาห์ถัดไป",
        quests: [
          {
            id: "car_d6_main",
            title: "ทบทวนผลงานในสัปดาห์นี้ และเขียนแผนงาน 3 เรื่องหลักที่จะลุยในสัปดาห์หน้า",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาการงาน D6",
            desc: "วางแผนล่วงหน้าอย่างเหนือชั้น"
          },
          {
            id: "car_d6_habit",
            title: "เคลียร์ไฟล์ขยะและจัดโฟลเดอร์งานในคอมพิวเตอร์ให้เป็นระเบียบ",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ทำความสะอาดระบบดิจิทัล"
          },
          {
            id: "car_d6_challenge",
            title: "สรุปผลงานและบทเรียนการทำงานในรอบสัปดาห์ที่ผ่านมา",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "สรุปผลงาน",
            desc: "สรุปผลงานรายสัปดาห์"
          }
        ]
      },
      {
        day: 7,
        dayTitle: "Day 7: Victory & Master Reflection",
        focusTopic: "สรุปผลและรับเกียรติบัตรวิชาการงาน",
        quests: [
          {
            id: "car_d7_main",
            title: "สรุป 1 การปรับเปลี่ยนวิธีทำงานที่ช่วยให้คุณได้ผลงานดีขึ้นและเหนื่อยน้อยลงใน 7 วันนี้",
            type: "SKILL_MAIN",
            xp: 100,
            tag: "VICTORY D7",
            desc: "สำเร็จวิชาการงาน & การสร้างผลงาน 7 วัน!"
          },
          {
            id: "car_d7_habit",
            title: "อัปเดตคะแนนวงล้อชีวิต (Wheel of Life) ด้านการงาน เพิ่มขึ้น 1 คะแนน!",
            type: "PERSONALIZED_HABIT",
            xp: 50,
            tag: "WHEEL LEVEL UP",
            desc: "ยกระดับคะแนน Wheel of Life"
          },
          {
            id: "car_d7_challenge",
            title: "ฉลองความสำเร็จ! รับตรา Career Master Badge และเลือกวิชาถัดไปสำหรับสัปดาห์หน้า",
            type: "REFLECTION_CHALLENGE",
            xp: 50,
            tag: "MASTER BADGE",
            desc: "รับตราเกียรติยศประจำวิชา"
          }
        ]
      }
    ]
  },

  health: {
    id: "health",
    title: "วิชาสุขภาพ",
    subtitle: "Energy & Vitality",
    wheelCategory: "สุขภาพ",
    icon: "🩺",
    color: "emerald",
    borderColor: "border-emerald-500/40",
    bgGradient: "from-emerald-600/20 via-teal-600/10 to-slate-900",
    description: "ฟื้นฟูพลังกาย ปรับปรุงการนอน การดื่มน้ำ การเคลื่อนไหวร่างกาย และเพิ่มพลังงานความสดชื่นตลอดวัน",
    outcomes: ["มีพลังงานตื่นตัวตลอดวันโดยไม่ต้องพึ่งกาแฟเยอะ", "นอนหลับลึกและฟื้นฟูร่างกายดีขึ้น", "สร้างนิสัยการออกกำลังกายสม่ำเสมอ"],
    days: [
      {
        day: 1,
        dayTitle: "Day 1: Hydration & Sleep Audit",
        focusTopic: "เติมน้ำและตรวจสอบการนอน",
        quests: [
          {
            id: "hea_d1_main",
            title: "ดื่มน้ำเปล่าให้ครบ 2 ลิตรตลอดวัน และงดเครื่องดื่มน้ำตาลสูง",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาสุขภาพ D1",
            desc: "เติมความสดชื่นให้เซลล์ร่างกาย"
          },
          {
            id: "hea_d1_habit",
            title: "เข้านอนตรงเวลาและปิดหน้าจอก่อนนอนอย่างน้อย 30 นาที",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "เตรียมตัวนอนหลับลึก"
          },
          {
            id: "hea_d1_challenge",
            title: "วางรูทีนประจำวันเพื่อเพิ่มพลังงานสดชื่นตลอดวัน",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "วางรูทีนสุขภาพ",
            desc: "ปรึกษาการเพิ่มพลังงาน"
          }
        ]
      },
      {
        day: 2,
        dayTitle: "Day 2: Movement & Stretching",
        focusTopic: "ยืดเหยียดขจัดออฟฟิศซินโดรม",
        quests: [
          {
            id: "hea_d2_main",
            title: "ยืดเหยียดร่างกายหรือออกกำลังกายเบาๆ 15 นาทีเพื่อกระตุ้นการไหลเวียนเลือด",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาสุขภาพ D2",
            desc: "ขยับร่างกายขจัดความล้า"
          },
          {
            id: "hea_d2_habit",
            title: "ลุกขึ้นยืนขยับตัว 1 นาทีทุกๆ การนั่งทำงาน 1 ชั่วโมง",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ป้องกันออฟฟิศซินโดรม"
          },
          {
            id: "hea_d2_challenge",
            title: "ปรับท่านั่งทำงานและสิ่งแวดล้อมให้ถูกหลัก Ergonomics",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ปรับ Ergonomics",
            desc: "โฟกัสงานพร้อมท่านั่งที่ดี"
          }
        ]
      },
      {
        day: 3,
        dayTitle: "Day 3: Clean Fuel & Nutrition",
        focusTopic: "เลือกอาหารเติมพลังงานบริสุทธิ์",
        quests: [
          {
            id: "hea_d3_main",
            title: "ทานผัก/ผลไม้สดเพิ่มในมื้ออาหาร และลดการกินของทอดของหวาน 1 มื้อ",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาสุขภาพ D3",
            desc: "เลือกสารอาหารดีให้ร่างกาย"
          },
          {
            id: "hea_d3_habit",
            title: "เคี้ยวอาหารช้าๆ และตั้งใจกินอย่างมีสติโดยไม่ไถมือถือขณะทานอาหาร",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ฝึก Mindful Eating"
          },
          {
            id: "hea_d3_challenge",
            title: "ศึกษาและอ่านแนวทางการดูแลสุขภาพและการเพิ่มพลังงานชีวิต",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "โภชนาการที่ดี",
            desc: "เติมความรู้ด้านสุขภาพ"
          }
        ]
      },
      {
        day: 4,
        dayTitle: "Day 4: Sun & Outdoor Energy",
        focusTopic: "รับแสงแดดเช้าและอากาศบริสุทธิ์",
        quests: [
          {
            id: "hea_d4_main",
            title: "เดินรับแสงแดดธรรมชาติยามเช้า 10-15 นาทีเพื่อตั้งนาฬิกาชีวิต (Circadian Rhythm)",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาสุขภาพ D4",
            desc: "ปรับสมดุลนาฬิกาชีวิต"
          },
          {
            id: "hea_d4_habit",
            title: "สูดหายใจเข้าลึกๆ 5 ครั้งเมื่อรู้สึกง่วงหรือล้าในระหว่างวัน",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "เติมออกซิเจนให้สมอง"
          },
          {
            id: "hea_d4_challenge",
            title: "จัดบรรยากาศพื้นที่ทำงานให้มีอากาศถ่ายเทสะดวกและสดชื่น",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "อากาศสดชื่น",
            desc: "โฟกัสงานแบบสดชื่น"
          }
        ]
      },
      {
        day: 5,
        dayTitle: "Day 5: Cardio & Heart Health",
        focusTopic: "ออกกำลังกายกระตุ้นหัวใจ",
        quests: [
          {
            id: "hea_d5_main",
            title: "ออกกำลังกายแบบคาร์ดิโอ (เดินเร็ว/วิ่ง/ปั่นจักรยาน/ว่ายน้ำ) อย่างน้อย 20 นาที",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาสุขภาพ D5",
            desc: "เสริมความแข็งแรงให้หัวใจ"
          },
          {
            id: "hea_d5_habit",
            title: "เลือกเดินขึ้นบันไดแทนการใช้ลิฟต์เมื่อเดินทาง 1-2 ชั้น",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "สะสมการเคลื่อนไหวรายวัน"
          },
          {
            id: "hea_d5_challenge",
            title: "วางแผนผสานการออกกำลังกายให้เข้ากับไลฟ์สไตล์ประจำวันของคุณ",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ไลฟ์สไตล์สุขภาพ",
            desc: "วางแผนไลฟ์สไตล์สุขภาพ"
          }
        ]
      },
      {
        day: 6,
        dayTitle: "Day 6: Deep Recovery & Relax",
        focusTopic: "การฟื้นฟูกายใจขั้นลึก",
        quests: [
          {
            id: "hea_d6_main",
            title: "อาบน้ำอุ่น หรือทำกิจกรรมผ่อนคลายกล้ามเนื้อก่อนนอน 20 นาที",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาสุขภาพ D6",
            desc: "ผ่อนคลายร่างกายลึกซึ้ง"
          },
          {
            id: "hea_d6_habit",
            title: "งดทานอาหารมื้อดึกล่วงหน้า 3 ชั่วโมงก่อนนอน เพื่อให้ระบบย่อยอาหารได้พักผ่อน",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ช่วยให้ร่างกายซ่อมแซมได้ดี"
          },
          {
            id: "hea_d6_challenge",
            title: "จัดเวลาสมาธิผ่อนคลายความเครียดจากงานตลอดสัปดาห์",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ผ่อนคลายสมาธิ",
            desc: "ผ่อนคลายสมาธิ"
          }
        ]
      },
      {
        day: 7,
        dayTitle: "Day 7: Victory & Master Reflection",
        focusTopic: "สรุปผลและรับเกียรติบัตรวิชาสุขภาพ",
        quests: [
          {
            id: "hea_d7_main",
            title: "สรุป 1 นิสัยสุขภาพใหม่ที่ทำให้คุณรู้สึกสดชื่นและมีพลังงานมากขึ้นอย่างเห็นได้ชัดใน 7 วันนี้",
            type: "SKILL_MAIN",
            xp: 100,
            tag: "VICTORY D7",
            desc: "สำเร็จวิชาสุขภาพ & พลังงานชีวิต 7 วัน!"
          },
          {
            id: "hea_d7_habit",
            title: "อัปเดตคะแนนวงล้อชีวิต (Wheel of Life) ด้านสุขภาพ เพิ่มขึ้น 1 คะแนน!",
            type: "PERSONALIZED_HABIT",
            xp: 50,
            tag: "WHEEL LEVEL UP",
            desc: "ยกระดับคะแนน Wheel of Life"
          },
          {
            id: "hea_d7_challenge",
            title: "ฉลองความสำเร็จ! รับตรา Health Master Badge และเลือกวิชาถัดไปสำหรับสัปดาห์หน้า",
            type: "REFLECTION_CHALLENGE",
            xp: 50,
            tag: "MASTER BADGE",
            desc: "รับตราเกียรติยศประจำวิชา"
          }
        ]
      }
    ]
  },

  innerpeace: {
    id: "innerpeace",
    title: "วิชาจิตใจ & สติ",
    subtitle: "Inner Peace & Mindfulness",
    wheelCategory: "จิตใจ",
    icon: "🧘",
    color: "cyan",
    borderColor: "border-cyan-500/40",
    bgGradient: "from-cyan-600/20 via-blue-600/10 to-slate-900",
    description: "ฝึกฝนพลังสมาธิ สลัดสิ่งล่อใจ คืนความสงบเย็นให้จิตใจ ก้าวข้ามอารมณ์ลบ และสร้างความแข็งแกร่งจากภายใน",
    outcomes: ["สลัดนิสัยวอกแวกและอารมณ์ว้าวุ่น", "มีสติอยู่กับงานตรงหน้าและปล่อยวางสิ่งคุมไม่ได้", "จิตใจสงบเย็น มีพลังใจเต็มเปี่ยม"],
    days: [
      {
        day: 1,
        dayTitle: "Day 1: Distraction Audit",
        focusTopic: "ค้นหาสิ่งล่อใจที่ดูดสมาธิคุณ",
        quests: [
          {
            id: "foc_d1_main",
            title: "จด 3 สิ่งล่อใจที่ทำให้คุณวอกแวกบ่อยที่สุดขณะทำงาน (เช่น ป๊อปอัปแชต, โซเชียล, เสียงรบกวน)",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาโฟกัส D1",
            desc: "รู้เท่าทันสิ่งรบกวน"
          },
          {
            id: "foc_d1_habit",
            title: "เปิดโหมด Do Not Disturb (ห้ามรบกวน) บนโทรศัพท์ขณะเริ่มทำงานสำคัญ",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ปกป้องสมาธิช่วงแรก"
          },
          {
            id: "foc_d1_challenge",
            title: "ทดลองโฟกัสทำงานสำคัญ 25 นาทีโดยไม่เปิดหน้าต่างแทรก",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ฝึกสมาธิ",
            desc: "ทดลองสมาธิ 25 นาที"
          }
        ]
      },
      {
        day: 2,
        dayTitle: "Day 2: Pomodoro Technique",
        focusTopic: "ฝึกสมาธิจังหวะ Pomodoro 25/5",
        quests: [
          {
            id: "foc_d2_main",
            title: "ทำงานด้วยเทคนิค Pomodoro (โฟกัส 25 นาที / พัก 5 นาที) ให้ครบ 2 รอบในวันนี้",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาโฟกัส D2",
            desc: "สร้างจังหวะโฟกัสและพักผ่อน"
          },
          {
            id: "foc_d2_habit",
            title: "ในช่วงพัก 5 นาที ให้ลุกขึ้นยืดสายตาและพักสมองโดยไม่ไถหน้าจอมือถือ",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ให้สมองได้พักจริง"
          },
          {
            id: "foc_d2_challenge",
            title: "ทบทวนเทคนิคดึงสติตอนสมองวอกแวกให้กลับมาอยู่กับงานตรงหน้า",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "เทคนิคดึงสติ",
            desc: "ขอคำแนะนำดึงสติ"
          }
        ]
      },
      {
        day: 3,
        dayTitle: "Day 3: Clean Desktop & Environment",
        focusTopic: "สร้างสภาพแวดล้อมไร้สิ่งรบกวน",
        quests: [
          {
            id: "foc_d3_main",
            title: "ซ่อนแท็บเบราว์เซอร์ที่ไม่ใช้ และปิดแอปที่ไม่เกี่ยวกับงานทั้งหมดก่อนเริ่มเซสชันโฟกัส",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาโฟกัส D3",
            desc: "เคลียร์หน้าจอไร้สิ่งรบกวน"
          },
          {
            id: "foc_d3_habit",
            title: "วางโทรศัพท์มือถือไว้ไกลตัวเกินระยะเอื้อมมือขณะทำงาน",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ขจัดแรงดึงดูดจากมือถือ"
          },
          {
            id: "foc_d3_challenge",
            title: "ศึกษาและอ่านแนวทางวิทยาศาสตร์ของสมาธิและการลื่นไหล (Flow State)",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "วิทยาศาสตร์สมาธิ",
            desc: "เติมความรู้ด้านสมาธิ"
          }
        ]
      },
      {
        day: 4,
        dayTitle: "Day 4: Deep Work Session 50 Min",
        focusTopic: "ท้าทายสมาธิระดับลึก 50 นาที",
        quests: [
          {
            id: "foc_d4_main",
            title: "ทำเซสชัน Deep Work เข้มข้น 50 นาทีต่อเนื่องให้สำเร็จในงานสำคัญประจำวัน",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาโฟกัส D4",
            desc: "พิชิตสมาธิระดับลึก"
          },
          {
            id: "foc_d4_habit",
            title: "เมื่อมีเรื่องแทรกเข้ามาในหัว ให้จดลงกระดาษปะหน้า (Brain Dump) แล้วกลับไปทำเรื่องเดิมทันที",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ฝึกจดความคิดแทรก"
          },
          {
            id: "foc_d4_challenge",
            title: "สรุปความรู้สึกและผลงานที่ได้หลังทำเซสชัน Deep Work 50 นาที",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "สรุปสมาธิ",
            desc: "สะท้อนความรู้สึกโฟกัส"
          }
        ]
      },
      {
        day: 5,
        dayTitle: "Day 5: Single-Tasking Mastery",
        focusTopic: "เลิกทำหลายอย่างพร้อมกัน (No Multitasking)",
        quests: [
          {
            id: "foc_d5_main",
            title: "ฝึกทำทีละอย่างเดียว (Single-Tasking) 100% ตลอดครึ่งวันเช้าโดยไม่สลับงานไปมา",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาโฟกัส D5",
            desc: "โฟกัสทีละเรื่องเพื่อคุณภาพสูงสุด"
          },
          {
            id: "foc_d5_habit",
            title: "เมื่อรู้สึกเบื่องานตรงหน้า ให้หยุดพักสายตา 1 นาที แทนการเปิดโซเชียลมีเดีย",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ฝึกทนต่อความเบื่อ"
          },
          {
            id: "foc_d5_challenge",
            title: "จัดช่วงเวลาสมาธิ 25 นาที สะสางงานตกค้างให้เสร็จเรียบร้อย",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "เคลียร์งานตกค้าง",
            desc: "โฟกัสงานตกค้าง"
          }
        ]
      },
      {
        day: 6,
        dayTitle: "Day 6: Mindfulness & Mental Reset",
        focusTopic: "ฝึกสมาธิความเงียบและการดึงสติ",
        quests: [
          {
            id: "foc_d6_main",
            title: "นั่งเงียบๆ สังเกตลมหายใจเข้าออกเป็นเวลา 5 นาทีโดยไม่ทำสิ่งอื่นใด (Mindfulness Meditation)",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาโฟกัส D6",
            desc: "ฝึกดึงสติกลับสู่ปัจจุบัน"
          },
          {
            id: "foc_d6_habit",
            title: "งดการฟังเพลงมีเนื้อร้องขณะทำงานที่ต้องใช้ความคิดซับซ้อน (ใช้ Lo-Fi หรือ Pink Noise แทน)",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ใช้เสียงสร้างสมาธิ"
          },
          {
            id: "foc_d6_challenge",
            title: "วัดผลสมาธิและพัฒนาการของคุณในสัปดาห์นี้",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "วัดผลสมาธิ",
            desc: "วัดผลสมาธิสัปดาห์นี้"
          }
        ]
      },
      {
        day: 7,
        dayTitle: "Day 7: Victory & Master Reflection",
        focusTopic: "สรุปผลและรับเกียรติบัตรวิชาสมาธิ",
        quests: [
          {
            id: "foc_d7_main",
            title: "สรุป 1 เทคนิคการโฟกัสที่ช่วยให้คุณทำงานเสร็จไวขึ้นและวอกแวกน้อยลงใน 7 วันนี้",
            type: "SKILL_MAIN",
            xp: 100,
            tag: "VICTORY D7",
            desc: "สำเร็จวิชาสมาธิ & โฟกัสขั้นสุด 7 วัน!"
          },
          {
            id: "foc_d7_habit",
            title: "อัปเดตคะแนนวงล้อชีวิต (Wheel of Life) ด้านจิตใจ เพิ่มขึ้น 1 คะแนน!",
            type: "PERSONALIZED_HABIT",
            xp: 50,
            tag: "WHEEL LEVEL UP",
            desc: "ยกระดับคะแนน Wheel of Life"
          },
          {
            id: "foc_d7_challenge",
            title: "ฉลองความสำเร็จ! รับตรา Focus Master Badge และเลือกวิชาถัดไปสำหรับสัปดาห์หน้า",
            type: "REFLECTION_CHALLENGE",
            xp: 50,
            tag: "MASTER BADGE",
            desc: "รับตราเกียรติยศประจำวิชา"
          }
        ]
      }
    ]
  },

  contribution: {
    id: "contribution",
    title: "วิชาช่วยเหลือสังคม",
    subtitle: "Contribution & Social Impact",
    wheelCategory: "ช่วยเหลือสังคม",
    icon: "🎁",
    color: "pink",
    borderColor: "border-pink-500/40",
    bgGradient: "from-pink-600/20 via-rose-600/10 to-slate-900",
    description: "สร้างคุณค่า ส่งต่อประโยชน์แก่ผู้อื่น แบ่งปันความรู้ ชุมชน และขยายผลกระทบเชิงบวกสู่สังคมรอบข้าง",
    outcomes: ["สร้างความน่าเชื่อถือและการยอมรับในสังคม", "ส่งต่อประโยชน์และช่วยเหลือผู้คนอย่างจริงใจ", "สร้างความสุขลึกซึ้งจากการเป็นผู้ให้"],
    days: [
      {
        day: 1,
        dayTitle: "Day 1: Personal Credibility Audit",
        focusTopic: "ตรวจสอบความน่าเชื่อถือของตนเอง",
        quests: [
          {
            id: "inf_d1_main",
            title: "เขียน 3 สิ่งที่เป็นจุดแข็งและคุณค่าที่คุณสามารถส่งต่อหรือช่วยเหลือผู้อื่นได้ดีที่สุด",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาอิทธิพล D1",
            desc: "ค้นหาคุณค่าหลักในตัวคุณ"
          },
          {
            id: "inf_d1_habit",
            title: "รักษาคำพูดในเรื่องเล็กๆ ทั้งกับตนเองและผู้อื่นตลอด 24 ชั่วโมงข้างหน้า",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "สร้าง Integrity ในตัวคุณ"
          },
          {
            id: "inf_d1_challenge",
            title: "ตกตะกอนแนวทางการสร้างแบรนด์ตัวตน (Personal Brand) และความน่าเชื่อถือ",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "สร้างแบรนด์ตัวตน",
            desc: "ปรึกษาการสร้างตัวตน"
          }
        ]
      },
      {
        day: 2,
        dayTitle: "Day 2: The Art of Genuine Praise",
        focusTopic: "ให้เกียรติและชื่นชมอย่างจริงใจ",
        quests: [
          {
            id: "inf_d2_main",
            title: "ส่งข้อความชื่นชม หรือขอบคุณความดีงาม/ผลงานของผู้อื่นอย่างเจาะจงและจริงใจ 1 คน",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาอิทธิพล D2",
            desc: "เติมพลังบวกให้ผู้คน"
          },
          {
            id: "inf_d2_habit",
            title: "มองหาข้อดีของคนที่คุณไม่ค่อยชอบ 1 ข้อ แล้วจดไว้ในใจ",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ขยายหัวใจและมุมมอง"
          },
          {
            id: "inf_d2_challenge",
            title: "ศึกษาและอ่านแนวทางจิตวิทยาการโน้มน้าวใจและการสร้างมิตรภาพ",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "จิตวิทยาผู้คน",
            desc: "เติมความรู้จิตวิทยาผู้คน"
          }
        ]
      },
      {
        day: 3,
        dayTitle: "Day 3: Helping & Value Giving",
        focusTopic: "เป็นผู้ให้นำหน้า (Give First)",
        quests: [
          {
            id: "inf_d3_main",
            title: "เสนอตัวช่วยเหลือหรือแบ่งปันความรู้/ทรัพยากรแก่คนที่กำลังต้องการ 1 คน โดยไม่หวังผลตอบแทน",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาอิทธิพล D3",
            desc: "สร้างความไว้วางใจด้วยการให้"
          },
          {
            id: "inf_d3_habit",
            title: "แชร์ความรู้หรือความประทับใจดีๆ ลงในโซเชียลมีเดียเพื่อเป็นประโยชน์ต่อผู้อื่น 1 โพสต์",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "สร้างคุณค่าในวงกว้าง"
          },
          {
            id: "inf_d3_challenge",
            title: "จัดเวลาสมาธิ 25 นาที ตกตะกอนแนวทางส่งต่อคุณค่าให้สังคม",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ส่งต่อคุณค่า",
            desc: "วางแผนการส่งมอบสิ่งดีๆ"
          }
        ]
      },
      {
        day: 4,
        dayTitle: "Day 4: Storytelling & Persuasion",
        focusTopic: "เล่าเรื่องอย่างมีเสน่ห์และโน้มน้าวใจ",
        quests: [
          {
            id: "inf_d4_main",
            title: "เรียบเรียงความคิดและฝึกเล่าไอเดีย 1 เรื่องด้วยโครงสร้าง 'ปัญหา -> ทางแก้ -> ผลลัพธ์'",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาอิทธิพล D4",
            desc: "สื่อสารไอเดียอย่างมีพลัง"
          },
          {
            id: "inf_d4_habit",
            title: "ใช้น้ำเสียงนุ่มนวล มั่นใจ และสบตาคู่สนทนาขณะอธิบายไอเดีย",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "เพิ่มเสน่ห์การสื่อสาร"
          },
          {
            id: "inf_d4_challenge",
            title: "ทบทวนเทคนิคการพูดโน้มน้าวใจอย่างจริงใจและมีเสน่ห์",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "Storytelling",
            desc: "ฝึกทักษะ Storytelling"
          }
        ]
      },
      {
        day: 5,
        dayTitle: "Day 5: Community & Contribution",
        focusTopic: "มีส่วนร่วมและช่วยเหลือสังคม",
        quests: [
          {
            id: "inf_d5_main",
            title: "ทำความดีเล็กๆ หรือช่วยเหลือโครงการสังคม/บริจาค/อุดหนุนร้านค้าชุมชน 1 ครั้ง",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาอิทธิพล D5",
            desc: "ส่งต่อสิ่งดีๆ คืนสู่สังคม"
          },
          {
            id: "inf_d5_habit",
            title: "อุดหนุนและให้กำลังใจคนที่กำลังตั้งใจทำงานหรือสร้างสิ่งดีๆ ในสังคม",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "สนับสนุนคนทำดี"
          },
          {
            id: "inf_d5_challenge",
            title: "ทบทวนวิสัยทัศน์การช่วยเหลือผู้อื่นและการสร้าง Impact",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "วิสัยทัศน์สังคม",
            desc: "วางแผนการมีส่วนร่วม"
          }
        ]
      },
      {
        day: 6,
        dayTitle: "Day 6: Building Strategic Connection",
        focusTopic: "สร้างเครือข่ายความสัมพันธ์ที่มีคุณภาพ",
        quests: [
          {
            id: "inf_d6_main",
            title: "เชื่อมโยง แนะนำ หรือทำตัวเป็นสะพานเชื่อมโอกาสระหว่างคน 2 คนที่มีประโยชน์ต่อกัน",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาอิทธิพล D6",
            desc: "เป็น Connector ผู้สร้างโอกาส"
          },
          {
            id: "inf_d6_habit",
            title: "เปิดใจฟังความเห็นที่แตกต่างโดยไม่ด่วนตัดสินหรือโต้แย้งทันที",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "ฝึกเป็นคนใจกว้าง"
          },
          {
            id: "inf_d6_challenge",
            title: "ทบทวนบทเรียนด้านการสร้างอิทธิพลและอิทธิพลเชิงบวก",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "อิทธิพลเชิงบวก",
            desc: "ทบทวนการนำเสนอ"
          }
        ]
      },
      {
        day: 7,
        dayTitle: "Day 7: Victory & Master Reflection",
        focusTopic: "สรุปผลและรับเกียรติบัตรวิชาการสร้างอิทธิพล",
        quests: [
          {
            id: "inf_d7_main",
            title: "สรุป 1 สิ่งที่คุณได้เรียนรู้เกี่ยวกับการสร้างอิทธิพลและส่งต่อคุณค่าให้ผู้คนใน 7 วันนี้",
            type: "SKILL_MAIN",
            xp: 100,
            tag: "VICTORY D7",
            desc: "สำเร็จวิชาการสร้างอิทธิพล & สังคม 7 วัน!"
          },
          {
            id: "inf_d7_habit",
            title: "อัปเดตคะแนนวงล้อชีวิต (Wheel of Life) ด้านช่วยเหลือสังคม เพิ่มขึ้น 1 คะแนน!",
            type: "PERSONALIZED_HABIT",
            xp: 50,
            tag: "WHEEL LEVEL UP",
            desc: "ยกระดับคะแนน Wheel of Life"
          },
          {
            id: "inf_d7_challenge",
            title: "ฉลองความสำเร็จ! รับตรา Impact Master Badge และเลือกวิชาถัดไปสำหรับสัปดาห์หน้า",
            type: "REFLECTION_CHALLENGE",
            xp: 50,
            tag: "MASTER BADGE",
            desc: "รับตราเกียรติยศประจำวิชา"
          }
        ]
      }
    ]
  },

  lifedesign: {
    id: "lifedesign",
    title: "วิชาออกแบบชีวิต",
    subtitle: "Life Design & Balance",
    wheelCategory: "ครอบครัว",
    icon: "🌱",
    color: "teal",
    borderColor: "border-teal-500/40",
    bgGradient: "from-teal-600/20 via-emerald-600/10 to-slate-900",
    description: "ออกแบบวิสัยทัศน์ชีวิต จัดสมดุล 8 ด้าน ค้นพบสิ่งที่เป็นคุณค่าหลัก และวางแผนการเติบโตอย่างยั่งยืน",
    outcomes: ["มีเป้าหมายชีวิตที่ชัดเจนและสอดคล้องกับตัวตน", "จัดสมดุลชีวิต 8 ด้านอย่างลงตัว", "มีแผนเติบโตระยะยาวที่จับต้องได้"],
    days: [
      {
        day: 1,
        dayTitle: "Day 1: Life Vision & Wheel Audit",
        focusTopic: "ทบทวนสมดุลชีวิต 8 ด้าน",
        quests: [
          {
            id: "des_d1_main",
            title: "ทบทวนสมดุลชีวิตล่าสุด แล้วจด 3 ด้านที่คุณต้องการปรับปรุงมากที่สุดในรอบนี้",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาออกแบบชีวิต D1",
            desc: "ส่องกระจกดูสมดุลชีวิต"
          },
          {
            id: "des_d1_habit",
            title: "เขียน 1 ภาพความสำเร็จที่คุณอยากเห็นตัวเองเป็นในอีก 1 ปีข้างหน้า",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "จินตนาการวิสัยทัศน์"
          },
          {
            id: "des_d1_challenge",
            title: "ทบทวนภาพรวมเป้าหมายชีวิตที่คุณอยากออกแบบให้สำเร็จ",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "วิสัยทัศน์ชีวิต",
            desc: "รับมุมมองออกแบบชีวิต"
          }
        ]
      },
      {
        day: 2,
        dayTitle: "Day 2: Core Values Discovery",
        focusTopic: "ค้นหาคุณค่าหลักในจิตใจ",
        quests: [
          {
            id: "des_d2_main",
            title: "เลือก 3 คุณค่าหลัก (Core Values) ที่สำคัญที่สุดในชีวิตคุณ (เช่น อิสรภาพ, ครอบครัว, เติบโต, ความสุข)",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาออกแบบชีวิต D2",
            desc: "ค้นหากระ็มทิศทางชีวิต"
          },
          {
            id: "des_d2_habit",
            title: "ตรวจสอบการตัดสินใจในวันนี้ว่าสอดคล้องกับ 3 คุณค่าหลักหรือไม่",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "เช็กเข็มทิศการใช้ชีวิต"
          },
          {
            id: "des_d2_challenge",
            title: "จัดเวลาสมาธิเงียบๆ ตกตะกอนและเขียน Core Values ของคุณให้ชัดเจน",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "Core Values",
            desc: "ใช้เวลาเงียบๆ กับเป้าหมาย"
          }
        ]
      },
      {
        day: 3,
        dayTitle: "Day 3: Ideal Ordinary Day",
        focusTopic: "ออกแบบวันธรรมดาที่สมบูรณ์แบบ",
        quests: [
          {
            id: "des_d3_main",
            title: "เขียนบรรยาย 'วันธรรมดาที่สมบูรณ์แบบ' (Ideal Ordinary Day) ตั้งแต่ตื่นนอนจนเข้านอนที่คุณอยากมี",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาออกแบบชีวิต D3",
            desc: "ออกแบบความสุขรายวัน"
          },
          {
            id: "des_d3_habit",
            title: "ทดลองดึง 1 กิจกรรมในวันธรรมดาที่สมบูรณ์แบบมาทำจริงในวันนี้ (เช่น จิบชาร้อนเงียบๆ 10 นาที)",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "สัมผัสความสุขทันที"
          },
          {
            id: "des_d3_challenge",
            title: "ศึกษาและอ่านแนวทางการออกแบบชีวิต (Life Design Framework)",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "Life Design",
            desc: "เติมกรอบคิดออกแบบชีวิต"
          }
        ]
      },
      {
        day: 4,
        dayTitle: "Day 4: Odyssey Plans & Options",
        focusTopic: "วางทางเลือกชีวิต 3 เส้นทาง",
        quests: [
          {
            id: "des_d4_main",
            title: "ลองจินตนาการเส้นทางชีวิต 2 แบบที่แตกต่างกันอย่างสิ้นเชิงหากไม่มีเรื่องเงินมาเป็นอุปสรรค",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาออกแบบชีวิต D4",
            desc: "ขยายความเป็นไปได้ของชีวิต"
          },
          {
            id: "des_d4_habit",
            title: "กล้าเปิดใจรับประสบการณ์ใหม่ๆ หรือทดลองสิ่งที่ไม่เคยทำ 1 อย่างเล็กๆ",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "สร้างความยืดหยุ่นให้ชีวิต"
          },
          {
            id: "des_d4_challenge",
            title: "ปรับและทบทวนความสมดุลระหว่างความฝันและความเป็นจริง",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ปรับสมดุลความฝัน",
            desc: "ปรับสมดุลความฝัน"
          }
        ]
      },
      {
        day: 5,
        dayTitle: "Day 5: Removing Life Friction",
        focusTopic: "ขจัดสิ่งดูดพลังงานในชีวิต",
        quests: [
          {
            id: "des_d5_main",
            title: "จด 3 สิ่งที่ดูดพลังงานชีวิตคุณมากที่สุดในปัจจุบัน แล้ววาง 1 แผนการลด/ขจัดมันออกไป",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาออกแบบชีวิต D5",
            desc: "ลดภาระทางใจและกาย"
          },
          {
            id: "des_d5_habit",
            title: "เคลียร์พื้นที่อยู่อาศัยหรือมุมทำงาน 1 จุดให้สะอาดและโปร่งสบาย",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "สร้างความโปร่งใสให้จิตใจ"
          },
          {
            id: "des_d5_challenge",
            title: "จัดเวลาสมาธิ 25 นาที ทบทวนรายการสิ่งรบกวนพลังงานชีวิต",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ขจัดขยะทางใจ",
            desc: "สมาธิขจัดสิ่งดูดพลัง"
          }
        ]
      },
      {
        day: 6,
        dayTitle: "Day 6: 90-Day Milestone Action",
        focusTopic: "ซอยเป้าหมายใหญ่เป็น Milestone 90 วัน",
        quests: [
          {
            id: "des_d6_main",
            title: "คัดเป้าหมายใหญ่ 1 เรื่อง แล้วซอยออกเป็น 1 ผลลัพธ์ที่ต้องทำให้สำเร็จใน 90 วันข้างหน้า",
            type: "SKILL_MAIN",
            xp: 50,
            tag: "วิชาออกแบบชีวิต D6",
            desc: "ซอยเป้าหมายใหญ่เป็นก้าวแรก"
          },
          {
            id: "des_d6_habit",
            title: "ลงมือทำ 1 Action เล็กๆ ที่ส่งผลต่อเป้าหมาย 90 วันทันทีวันนี้",
            type: "PERSONALIZED_HABIT",
            xp: 30,
            tag: "นิสัยเฉพาะคุณ",
            desc: "สร้างแรงส่งจากจุดเล็กๆ"
          },
          {
            id: "des_d6_challenge",
            title: "ทบทวนผลประเมินวงล้อชีวิตอีกครั้งเพื่อเตรียมสำเร็จวิชา",
            type: "REFLECTION_CHALLENGE",
            xp: 25,
            tag: "ทบทวนวงล้อชีวิต",
            desc: "ทบทวนวงล้อชีวิต"
          }
        ]
      },
      {
        day: 7,
        dayTitle: "Day 7: Victory & Master Reflection",
        focusTopic: "สรุปผลการออกแบบชีวิต 7 วัน",
        quests: [
          {
            id: "des_d7_main",
            title: "สรุป 1 พฤติกรรมใหม่ที่ทำให้ชีวิตของคุณมีทิศทาง ชัดเจน และมีความสุขมากขึ้นใน 7 วันนี้",
            type: "SKILL_MAIN",
            xp: 100,
            tag: "VICTORY D7",
            desc: "สำเร็จวิชาออกแบบเป้าหมายชีวิต 7 วัน!"
          },
          {
            id: "des_d7_habit",
            title: "อัปเดตคะแนนวงล้อชีวิต (Wheel of Life) เพิ่มขึ้น 1 คะแนนในด้านที่คุณตั้งใจ!",
            type: "PERSONALIZED_HABIT",
            xp: 50,
            tag: "WHEEL LEVEL UP",
            desc: "ยกระดับคะแนน Wheel of Life"
          },
          {
            id: "des_d7_challenge",
            title: "ฉลองความสำเร็จ! รับตรา Life Design Master Badge และเลือกวิชาถัดไปสำหรับสัปดาห์หน้า",
            type: "REFLECTION_CHALLENGE",
            xp: 50,
            tag: "MASTER BADGE",
            desc: "รับตราเกียรติยศประจำวิชา"
          }
        ]
      }
    ]
  }
};
