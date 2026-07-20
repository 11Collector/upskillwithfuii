export type TraitKey = "MONK" | "FUCK" | "ZZZZ" | "WORK" | "NPC" | "HELL";

export type TraitScores = Record<TraitKey, number>;

export interface Option {
  text: string;
  trait: TraitKey;
}

export interface Question {
  id: number;
  question: string;
  options: Option[];
}

export interface PersonaResult {
  code: TraitKey | "NPC?";
  title: string;
  subtitle: string;
  traits: string[];
  image: string;
  color: string;
  accentColor: string;
  badgeBg: string;
}

export const TIE_BREAKER_PRIORITY: TraitKey[] = [
  "HELL",
  "FUCK",
  "ZZZZ",
  "MONK",
  "WORK",
  "NPC",
];

export const PERSONALITY_ZERO_DATA = {
  app_info: {
    title: "PersonalityZero",
    quiz_title: "ทำไปทำไม?",
    subtitle: "แบบประเมินจิต (หลุด) — ความแม่นยำ 0% ความปั่น 100%",
    path: "/personalityzero",
  },
  questions: [
    {
      id: 1,
      question: "ถามจริง... หลงเข้ามาทำแบบประเมินไร้สาระอันนี้ทำไมก่อน?",
      options: [
        { text: "เพื่อเจริญสติ รู้เท่าทันตนเอง ปล่อยวางความอยากรู้", trait: "MONK" },
        { text: "อยากรู้ว่าใครเป็นคนทำ จะตามไปด่าในคอมเมนต์!", trait: "FUCK" },
        { text: "งานกองเต็มโต๊ะไม่ยอมทำ แอบหนีงานมาจิ้มเล่น", trait: "WORK" },
        { text: "ว่างจัด ไม่มีอะไรทำ หาเรื่องให้สมองปวดเล่นๆ", trait: "HELL" },
      ],
    },
    {
      id: 2,
      question: "คิดว่าแบบประเมินนี้ มีความแม่นยำทางจิตวิทยามากแค่ไหน?",
      options: [
        { text: "แม่นยำ 100% เพราะฉันตั้งใจตอบแบบบ้าคลั่ง!", trait: "WORK" },
        { text: "ไร้สาระ! อุปโลกน์ขึ้นมาปั่นหัวคนเล่นชัดๆ!", trait: "FUCK" },
        { text: "ไม่รู้ ไม่สน มือมันหลงจิ้มมาเอง", trait: "NPC" },
        { text: "แม่นไม่แม่นไม่รู้ แต่ช่วยให้อู้งานได้อีก 5 นาที", trait: "ZZZZ" },
      ],
    },
    {
      id: 3,
      question: "พอรู้ผลลัพธ์แล้ว ตั้งใจจะเอาไปพัฒนาชีวิตยังไงต่อ?",
      options: [
        { text: "ทำ Slide Presentation เอาไปพรีเซนต์เป้าหมายชีวิตปีนี้", trait: "WORK" },
        { text: "แคปจอไปอวดเพื่อน แล้วชวนมันมาตีกันว่าใครปั่นกว่า", trait: "HELL" },
        { text: "อนิจจัง ทุกขัง อนัตตา ผลลัพธ์ก็แค่ความว่างเปล่า", trait: "MONK" },
        { text: "แคปจอไว้ แล้วลืมมันไปภายใน 3 วินาที", trait: "NPC" },
      ],
    },
    {
      id: 4,
      question: "ถ้าผลประเมินออกมาแล้ว \"ไม่ตรง\" กับที่คิดไว้ จะทำยังไง?",
      options: [
        { text: "ด่าแอดมินทิ้งไว้ในช่องคอมเมนต์ทันที!", trait: "FUCK" },
        { text: "นั่งสมาธิ แผ่เมตตาให้ระบบคำนวณคะแนนมั่วๆ นี้", trait: "MONK" },
        { text: "กดทำใหม่เรื่อยๆ จนกว่าจะได้อันที่เอาไปกวนเพื่อนได้", trait: "HELL" },
        { text: "เผลอหลับไปตั้งแต่ยังอ่านผลลัพธ์ไม่จบ", trait: "ZZZZ" },
      ],
    },
    {
      id: 5,
      question: "คิดว่า \"ประโยชน์ที่แท้จริง\" ของแบบประเมินนี้คืออะไร?",
      options: [
        { text: "เครื่องมือวัดระดับ Productivity ขั้นสูงของมนุษย์", trait: "WORK" },
        { text: "เอาไว้แปะ IG Story / X ระบายอารมณ์หาพวก", trait: "FUCK" },
        { text: "เป็นข้ออ้างในการนอนเฉยๆ โดยไม่รู้สึกผิด", trait: "ZZZZ" },
        { text: "ประโยชน์เหรอ? ไม่มีหรอก ไร้สาระไปวันๆ", trait: "NPC" },
      ],
    },
    {
      id: 6,
      question: "เพื่อนส่งลิงก์นี้มาในไลน์กลุ่ม พร้อมบอกว่า \"ลองเล่นดูมึง\"",
      options: [
        { text: "ส่งสติกเกอร์ \"OK\" แล้วไม่กดเข้าไปเล่น", trait: "NPC" },
        { text: "กดทำทันที แล้วส่งผลลัพธ์กลับไปป่วนกลุ่มให้แตกแยก", trait: "HELL" },
        { text: "พิมพ์กลับไปว่า \"ส่งมาทำไม งานการไม่มีทำเหรอ?\"", trait: "FUCK" },
        { text: "อ่านแล้วปิดจอ วางโทรศัพท์ นอนต่อ", trait: "ZZZZ" },
      ],
    },
    {
      id: 7,
      question: "ถ้าต้องจำกัดความแบบประเมินนี้ด้วยประโยคเดียว จะพูดว่า...",
      options: [
        { text: "\"นวัตกรรมประเมินศักยภาพบุคคลระดับพรีเมียม\"", trait: "WORK" },
        { text: "\"เกิด แก่ เจ็บ ตาย ไร้แก่นสาร\"", trait: "MONK" },
        { text: "\"เอาเวลาไปสร้างความวุ่นวายอื่นยังดีกว่า\"", trait: "HELL" },
        { text: "\"หาว... (ง่วง)\"", trait: "ZZZZ" },
      ],
    },
    {
      id: 8,
      question: "คาดหวังอะไรจากแบบประเมินนี้มากที่สุด?",
      options: [
        { text: "ให้มันจบไวๆ จะได้กลับไปนอน", trait: "ZZZZ" },
        { text: "ผลลัพธ์ที่เพอร์เฟกต์ ไร้ที่ติ สมบูรณ์แบบ", trait: "WORK" },
        { text: "ไม่ได้คาดหวังอะไรเลย ได้อะไรก็ได้อย่างนั้น", trait: "NPC" },
        { text: "คำตอบเจ็บๆ แสบๆ เอาไว้ไปแซวคนอื่นต่อ", trait: "FUCK" },
      ],
    },
  ] as Question[],
  results: {
    MONK: {
      code: "MONK",
      title: "THE ENLIGHTENED",
      subtitle: "สายพระบวชใหม่ / สายปลง",
      traits: [
        "ปล่อยวางทุกสิ่ง ปัญหามีไว้ช่างมัน ชาติหน้าค่อยแก้",
        "ความโกรธคือมาร การอภัยคือบุญ",
        "บรรลุนิพพานทางใจตั้งแต่อายุยังน้อย",
      ],
      image: "/assets/personalityzero/monk.png",
      color: "#E3F2FD",
      accentColor: "from-neutral-100 to-red-600",
      badgeBg: "bg-red-600/20 text-red-400 border-red-500/40",
    },
    FUCK: {
      code: "FUCK",
      title: "THE FURY",
      subtitle: "สายพร้อมบวก / ไฟท์เตอร์",
      traits: [
        "หัวร้อนเป็นอาชีพ พร้อมไฝว้กับทุกความไม่ถูกต้อง",
        "มีดราม่าที่ไหน มีฉันที่นั่น",
        "พลังงานล้นเหลือ เอาไปใช้ด่าคนหมด",
      ],
      image: "/assets/personalityzero/fuck.png",
      color: "#FFEBEE",
      accentColor: "from-red-600 to-red-700",
      badgeBg: "bg-red-600/25 text-red-300 border-red-500/50",
    },
    ZZZZ: {
      code: "ZZZZ",
      title: "THE EXHAUSTED",
      subtitle: "สายศพเดินได้ / พลังงาน 1%",
      traits: [
        "เตียงคือบ้าน วิญญาณหลุดออกจากร่างตลอดเวลา",
        "กิจกรรมโปรดคือการนอนหลับพักผ่อน",
        "หาวทุกๆ 5 นาที แม้จะเพิ่งตื่นนอน",
      ],
      image: "/assets/personalityzero/zzzz.png",
      color: "#F3E5F5",
      accentColor: "from-neutral-700 to-neutral-900",
      badgeBg: "bg-neutral-800 text-neutral-300 border-neutral-700",
    },
    WORK: {
      code: "WORK",
      title: "THE OVERACHIEVER",
      subtitle: "สายทาสซาดิสม์ / บ้างาน",
      traits: [
        "เดดไลน์คือลมหายใจ หยุดพักแล้วจะตรอมใจตาย",
        "กาแฟคือเลือดสำรองในร่างกาย",
        "ยิ้มกว้างเมื่อได้รับ Assignments เพิ่ม",
      ],
      image: "/assets/personalityzero/work.png",
      color: "#FFFDE7",
      accentColor: "from-white to-red-600",
      badgeBg: "bg-white/10 text-white border-white/30",
    },
    NPC: {
      code: "NPC?",
      title: "THE DEFAULT",
      subtitle: "สายตัวประกอบ / เออออ",
      traits: [
        "ไร้ตัวตนในทุกวงสนทนา \"ได้หมดครับ\" คือคำติดปาก",
        "ดำเนินชีวิตด้วยระบบ Autopilot",
        "ไม่โดดเด่น ไม่เรียกร้อง ไม่รับรู้อะไรทั้งนั้น",
      ],
      image: "/assets/personalityzero/npc.png",
      color: "#E8F5E9",
      accentColor: "from-neutral-600 to-neutral-800",
      badgeBg: "bg-neutral-900 text-neutral-400 border-neutral-800",
    },
    HELL: {
      code: "HELL",
      title: "THE CHAOS AGENT",
      subtitle: "สายหาทำ / สร้างเรื่อง",
      traits: [
        "อยู่ดีๆ ไม่ชอบ ชอบพาตัวเองไปจุดวายป่วง",
        "นักปั่นกระแสและสร้างความวุ่นวายประจำกลุ่ม",
        "สโลแกนชีวิต: ถ้าไม่หาทำ แล้วจะสนุกได้ไง",
      ],
      image: "/assets/personalityzero/hell.png",
      color: "#FFF3E0",
      accentColor: "from-red-700 to-black",
      badgeBg: "bg-red-600/30 text-red-200 border-red-500/60",
    },
  } as unknown as Record<TraitKey, PersonaResult>,
};

/**
 * Calculates the winning TraitKey from given TraitScores.
 * Tie-breaker priority: HELL > FUCK > ZZZZ > MONK > WORK > NPC
 */
export function calculatePersonalityResult(scores: TraitScores): TraitKey {
  let maxScore = -1;

  for (const trait of Object.keys(scores) as TraitKey[]) {
    if (scores[trait] > maxScore) {
      maxScore = scores[trait];
    }
  }

  // Find all traits that tie for maxScore
  const tiedTraits = (Object.keys(scores) as TraitKey[]).filter(
    (trait) => scores[trait] === maxScore
  );

  if (tiedTraits.length === 1) {
    return tiedTraits[0];
  }

  // Tie-breaker resolution by priority
  for (const priorityTrait of TIE_BREAKER_PRIORITY) {
    if (tiedTraits.includes(priorityTrait)) {
      return priorityTrait;
    }
  }

  return tiedTraits[0];
}

export const LOADING_SLOGANS = [
  "กำลังแอบส่องประวัติคำค้นหาในกูเกิลของคุณ...",
  "กำลังคำนวณระดับความอู้งานแบบมั่วๆ...",
  "กำลังถามไพ่ยิปซีว่าคุณเป็นคนยังไง...",
  "กำลังถอดจิตไปถามเทวดาประจำตัวของคุณ...",
  "กำลังสุ่มวิเคราะห์ด้วยระบบ AI ไร้สมอง...",
  "กำลังประมวลผลความหลุดในระดับโมเลกุล...",
];

export const PROGRESS_MICRO_COPY: Record<number, string> = {
  1: "เพิ่งเริ่มก็อยากกดยกเลิกแล้วใช่ไหม...",
  2: "ทนอีกนิด มนุษย์เราต้องผ่านจุดนี้ไปให้ได้...",
  3: "งานที่กองไว้บนโต๊ะเริ่มกู่ร้องเรียกหาแล้วนะ...",
  4: "มาได้ครึ่งทาง... สมองเริ่มล้าแล้วสิ...",
  5: "ตอบอะไรไป จำได้บ้างไหมเนี่ย...",
  6: "อีกนิดเดียว จะได้รู้สักทีว่าหาทำไปเพื่ออะไร...",
  7: "ข้อสุดท้ายแล้ว อย่าเพิ่งเผลอหลับก่อน...",
  8: "กำลังจะสำเร็จวิชาไร้สาระขั้นสูงสุด!",
};
