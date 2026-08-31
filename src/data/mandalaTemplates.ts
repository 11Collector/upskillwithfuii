export interface MandalaPillar {
  title: string;
  icon?: string;
  color: string;
  actions: string[]; // 8 actions
  completedActions?: boolean[]; // tracking completion
}

export interface MandalaData {
  id?: string;
  coreGoal: string;
  pillars: MandalaPillar[]; // exactly 8 pillars (0: top-left, 1: top, 2: top-right, 3: left, 4: right, 5: bottom-left, 6: bottom, 7: bottom-right)
  lastUpdated?: number;
}

export const PILLAR_COLORS = [
  { name: "Emerald", bg: "bg-emerald-950/40", border: "border-emerald-500/40", headerBg: "bg-emerald-600/30", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { name: "Amber", bg: "bg-amber-950/40", border: "border-amber-500/40", headerBg: "bg-amber-600/30", text: "text-amber-300", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { name: "Sky", bg: "bg-sky-950/40", border: "border-sky-500/40", headerBg: "bg-sky-600/30", text: "text-sky-300", badge: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  { name: "Violet", bg: "bg-violet-950/40", border: "border-violet-500/40", headerBg: "bg-violet-600/30", text: "text-violet-300", badge: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  { name: "Rose", bg: "bg-rose-950/40", border: "border-rose-500/40", headerBg: "bg-rose-600/30", text: "text-rose-300", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  { name: "Cyan", bg: "bg-cyan-950/40", border: "border-cyan-500/40", headerBg: "bg-cyan-600/30", text: "text-cyan-300", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { name: "Indigo", bg: "bg-indigo-950/40", border: "border-indigo-500/40", headerBg: "bg-indigo-600/30", text: "text-indigo-300", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { name: "Orange", bg: "bg-orange-950/40", border: "border-orange-500/40", headerBg: "bg-orange-600/30", text: "text-orange-300", badge: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
];

export const EMPTY_MANDALA: MandalaData = {
  coreGoal: "",
  pillars: Array.from({ length: 8 }).map((_, i) => ({
    title: "",
    color: PILLAR_COLORS[i % PILLAR_COLORS.length].name,
    actions: Array(8).fill(""),
    completedActions: Array(8).fill(false),
  })),
};

export const MANDALA_TEMPLATES: { id: string; name: string; description: string; data: MandalaData }[] = [
  {
    id: "ohtani",
    name: "⚾ โชเฮ โอทานิ (Shohei Ohtani)",
    description: "ต้นฉบับความสำเร็จระดับโลก: 8 เสาหลักที่ปั้นนักเบสบอลประวัติศาสตร์",
    data: {
      coreGoal: "ถูกดราฟต์อันดับ 1 จาก 8 สโมสรชั้นนำ",
      pillars: [
        {
          title: "เสริมสร้างร่างกาย",
          color: "Emerald",
          actions: [
            "ปรับสภาพร่างกายทุกวัน",
            "ทานอาหารเสริมสม่ำเสมอ",
            "เวทเทรนนิ่ง Squat 130kg",
            "เพิ่มความยืดหยุ่นกล้ามเนื้อ",
            "เพิ่มพละกำลังและความอึด",
            "ทานข้าวเช้า 3 ชาม เย็น 7 ชาม",
            "ฝึกแกนกลางลำตัวให้มั่นคง",
            "เพิ่มกล้ามเนื้อช่วงล่าง",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "การควบคุมลูก",
          color: "Amber",
          actions: [
            "จุดปล่อยลูกคงที่แม่นยำ",
            "ลดความประหม่าขณะขว้าง",
            "ฝึกแกนหมุนให้เสถียร",
            "เคลื่อนไหวร่างกายให้เฉียบคม",
            "เสริมสร้างกล้ามเนื้อขา",
            "ปล่อยลูกไปข้างหน้าอย่างสมดุล",
            "ควบคุมอารมณ์ขณะขว้าง",
            "ไม่เปิดลำตัวเร็วกว่าจังหวะ",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "ความเร็วลูก 160 km/h",
          color: "Sky",
          actions: [
            "ฝึกองศาการปล่อยลูก",
            "ขว้างจากมุมสูงกดลงล่าง",
            "เสริมสร้างพลังข้อมือ",
            "ผ่อนคลายกล้ามเนื้อก่อนออกแรง",
            "เพิ่มน้ำหนักตัวให้ได้ตามเกณฑ์",
            "เพิ่มความเร็วรอบหมุนลูก",
            "ฝึกรับส่งลูกระยะไกล",
            "เสริมสร้างกล้ามเนื้อหัวไหล่",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "จิตใจแข็งแกร่ง (Mental)",
          color: "Violet",
          actions: [
            "ตั้งเป้าหมายให้ชัดเจนทุกวัน",
            "ไม่ดีใจหรือเสียใจเกินไป",
            "หัวเย็นแต่หัวใจมุ่งมั่น",
            "ไม่ให้อารมณ์ครอบงำเกม",
            "พร้อมลุยไม่ว่าสถานการณ์ใด",
            "เคารพและรักในชัยชนะ",
            "ใส่ใจเพื่อนร่วมทีม",
            "มองเห็นคุณค่าในตัวเอง",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "ลูกหมุน & ลูกเบรกกิ้ง",
          color: "Rose",
          actions: [
            "ฝึกขว้างสไลเดอร์คมกริบ",
            "ทำให้ลูก Forkball สมบูรณ์แบบ",
            "ฝึก Curveball ตกช้า",
            "คุมลูกในโซนสไตรค์แม่นยำ",
            "สร้างมุมมองระยะความลึกของลูก",
            "ซ้อมท่าขว้างแบบเดียวกับ Fastball",
            "ขว้างลูกตัดหน้าแบตเตอร์มือซ้าย",
            "เพิ่มมิติและประเภทลูกขว้าง",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "ความเป็นมนุษย์ (Humanity)",
          color: "Cyan",
          actions: [
            "เป็นคนที่ทุกคนรักและไว้ใจ",
            "ทักทายผู้อื่นอย่างจริงใจ",
            "รู้จักวางแผนล่วงหน้า",
            "ทำความสะอาดห้องพักสม่ำเสมอ",
            "มีมารยาทและกิริยาที่ดี",
            "กล่าวขอบคุณทุกโอกาส",
            "มีน้ำใจและการให้ทาน",
            "เป็นที่พึ่งพาของผู้อื่น",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "โชคลาภ & วาสนา (Lucky)",
          color: "Indigo",
          actions: [
            "เก็บขยะทุกชิ้นที่เห็น",
            "ทำความสะอาดอุปกรณ์ทุกครั้ง",
            "มีทัศนคติที่ดีต่อกรรมการ",
            "คิดบวกเสมอแม้เจอวิกฤต",
            "ทำตัวเองให้คู่ควรแก่การสนับสนุน",
            "อ่านหนังสือเปิดโลกทัศน์",
            "กวาดขยะและดูแลพื้นที่ส่วนรวม",
            "แสดงความเคารพต่อสนามแข่ง",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "วินัย & ความเฉียบคม",
          color: "Orange",
          actions: [
            "ไม่หยุดพัฒนาแม้แต่วันเดียว",
            "บันทึกสถิติและวิเคราะห์ฟอร์ม",
            "ตรงต่อเวลาทุกนัดหมาย",
            "เข้านอนและตื่นตรงเวลา",
            "วางแผนการฝึกซ้อมรายสัปดาห์",
            "ทบทวนความผิดพลาดทันที",
            "รักษาสมาธิระหว่างการแข่งขัน",
            "รักษาคำพูดและสัญญาเสมอ",
          ],
          completedActions: Array(8).fill(false),
        },
      ],
    },
  },
  {
    id: "solopreneur",
    name: "💼 สร้างธุรกิจเดี่ยว 7 หลัก (Solo Creator / AI)",
    description: "เป้าหมายสร้างธุรกิจอิสระ ทำเงินสม่ำเสมอด้วย AI และพลังของการโฟกัส",
    data: {
      coreGoal: "สร้างรายได้ 7 หลัก/ปี จากธุรกิจดิจิทัลและมีอิสรภาพเวลา",
      pillars: [
        {
          title: "ทักษะ AI & Automation",
          color: "Emerald",
          actions: [
            "เรียนรู้ AI Prompting & Workflows",
            "ใช้ Make/Zapier เชื่อมระบบออโต้",
            "สร้าง AI Assistant ช่วยตอบแชท",
            "ฝึกใช้ Cursor / Claude ช่วยโค้ด",
            "ทดลอง AI เครื่องมือใหม่สัปดาห์ละ 1 ตัว",
            "จัดเก็บ Prompt Library ประจำตัว",
            "ลดงานซ้ำซ้อนด้วย Script",
            "ศึกษาโมเดล AI ใหม่ๆ สม่ำเสมอ",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "การสร้าง Content & แบรนด์",
          color: "Amber",
          actions: [
            "โพสต์ Insight ทุกวันจันทร์-ศุกร์",
            "เขียน Long-form บทความสัปดาห์ละ 1 ชิ้น",
            "ทำ Hook ให้ดึงดูดภายใน 3 วินาที",
            "ส่ง Newsletter รายสัปดาห์",
            "แชร์กระบวนการทำงานจริง (Build in Public)",
            "จัดเก็บ Content Idea Bank 50+ หัวข้อ",
            "วิเคราะห์สถิติโพสต์ที่คนชอบ",
            "รักษา Brand Voice ให้เป็นตัวของตัวเอง",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "สินค้า & บริการ (Product)",
          color: "Sky",
          actions: [
            "พัฒนา Digital Product ชิ้นแรก",
            "เก็บ Feedback จากผู้ใช้จริง 10 คน",
            "ทำหน้า Landing Page สวยและเข้าใจง่าย",
            "ปรับปรุง UX/UI ให้น่าใช้ที่สุด",
            "สร้างระบบสมาชิก/Subscription",
            "เขียน Documentation หรือคู่มือชัดเจน",
            "เพิ่ม Upsell / Cross-sell ข้อเสนอพิเศษ",
            "รับประกันความพึงพอใจและซัพพอร์ตไว",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "การเงิน & กระแสเงินสด",
          color: "Violet",
          actions: [
            "แยกบัญชีส่วนตัวและธุรกิจชัดเจน",
            "ทำบัญชีรายรับ-รายจ่ายทุกสัปดาห์",
            "มีเงินสำรองฉุกเฉินธุรกิจ 6 เดือน",
            "นำกำไร 20% ไปลงทุนต่อยอด",
            "ลดต้นทุนซอฟต์แวร์ที่ไม่จำเป็น",
            "ตั้งเป้าหมายรายได้รายเดือนชัดเจน",
            "ศึกษาเรื่องภาษีและสิทธิประโยชน์",
            "สร้างช่องทางรับชำระเงินที่สะดวกสบาย",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "ระบบการทำงาน & Deep Work",
          color: "Rose",
          actions: [
            "กำหนดเวลา Deep Work วันละ 3 ชั่วโมง",
            "ปิดแจ้งเตือนมือถือช่วงโฟกัส",
            "จัด To-Do List เพียง 3 ข้อหลักต่อวัน",
            "ทำ Weekly Review ทุกวันอาทิตย์",
            "จัดระเบียบไฟล์และโฟลเดอร์ให้ค้นหาง่าย",
            "สร้าง SOP สำหรับงานที่ต้องทำซ้ำ",
            "ใช้ Pomodoro Focus Room 25 นาที",
            "ไม่รับนัดประชุมช่วงเช้า",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "สุขภาพกาย & พลังงาน",
          color: "Cyan",
          actions: [
            "นอนหลับอย่างมีคุณภาพ 7-8 ชั่วโมง",
            "ออกกำลังกายสัปดาห์ละ 4 วัน",
            "ดื่มน้ำวันละ 2.5 - 3 ลิตร",
            "เดินยืดเส้นยืดสายทุกๆ 1 ชั่วโมง",
            "จำกัดอาหารหวานและของทอด",
            "รับแสงแดดยามเช้า 15 นาที",
            "ทานมื้ออาหารที่มีประโยชน์",
            "ตรวจสุขภาพประจำปี",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "Mindset & ความยืดหยุ่น",
          color: "Indigo",
          actions: [
            "มองความล้มเหลวเป็นการทดลอง",
            "ไม่เปรียบเทียบตัวเองกับคนอื่น",
            "ฝึก Gratitude ขอบคุณสิ่งรอบตัวทุกวัน",
            "กล้าปล่อยวางสิ่งที่ไม่ก่อให้เกิดผลลัพธ์",
            "เปิดใจรับคำวิจารณ์เพื่อพัฒนา",
            "อยู่กับปัจจุบัน ไม่กังวลเกินไป",
            "ให้รางวัลตัวเองเมื่อบรรลุเป้าหมายย่อย",
            "รักษาความสม่ำเสมอมากกว่าความสมบูรณ์แบบ",
          ],
          completedActions: Array(8).fill(false),
        },
        {
          title: "ความสัมพันธ์ & เครือข่าย",
          color: "Orange",
          actions: [
            "ให้เวลากับคนสำคัญและครอบครัว",
            "แลกเปลี่ยนความรู้กับเพื่อนสายเดียวกัน",
            "หา Mentor หรือคนเก่งๆ เป็นแรงบันดาลใจ",
            "ตอบกลับคอมเมนต์และสร้างความจริงใจ",
            "เข้าร่วมคอมมูนิตี้ที่เสริมพลังบวก",
            "ช่วยเหลือผู้อื่นโดยไม่หวังผลตอบแทน",
            "นัดทานข้าวพูดคุยกับเพื่อนสนิท",
            "หลีกเลี่ยงคนที่มีพลังงานลบ",
          ],
          completedActions: Array(8).fill(false),
        },
      ],
    },
  },
];
