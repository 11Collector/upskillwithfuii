import { QUEST_POOL, categoryNames } from "@/data/quests";

export const calculateRelativeWeek = (joinDate: Date, targetDate = new Date()) => {
  const start = new Date(joinDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.max(1, Math.floor(diffDays / 7) + 1);

  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() + (weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const format = (d: Date) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

  return {
    id: `week-${weekNumber}`,
    label: `สัปดาห์ที่ ${weekNumber}`,
    range: `${format(weekStart)} - ${format(weekEnd)}`,
    num: weekNumber
  };
};

export const getWheelArea = (lastWheel: any, todayDateStr: string) => {
  const scores = lastWheel?.currentScores || lastWheel?.scores;
  const targetScores = lastWheel?.targetScores;
  
  if (scores && targetScores) {
    const gaps = scores.map((current: number, i: number) => ({
      index: i,
      gap: (targetScores[i] || 0) - current,
      label: categoryNames[i]
    }));

    const top3Gaps = [...gaps]
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3);

    if (todayDateStr && top3Gaps.length > 0) {
      const seed = parseInt(todayDateStr.replace(/-/g, '')) || 1;
      const randomIndex = seed % top3Gaps.length;
      return top3Gaps[randomIndex].label;
    }

    return top3Gaps[0]?.label || "การงาน";
  }
  return "การงาน";
};


export const pseudoRandomSlot = (max: number, salt: number, slotIdx: number, dateSeed: number, userSeed: number, slotSeeds: number[] = []) => {
  const base = dateSeed + userSeed;
  const extra = (slotSeeds[slotIdx] || 0) * 137;
  const s = base + extra;
  const x = Math.sin(s * salt * 12.9898 + salt * 78.233) * 43758.5453123;
  return Math.floor((x - Math.floor(x)) * max);
};

export const getUniqueQuestSlot = (pool: string[], existingTitles: string[], salt: number, slotIdx: number, dateSeed: number, userSeed: number, slotSeeds: number[] = []) => {
  let index = pseudoRandomSlot(pool.length, salt, slotIdx, dateSeed, userSeed, slotSeeds);
  let selectedQuest = pool[index];
  let attempts = 0;
  while (existingTitles.some(title => title.includes(selectedQuest.substring(0, 10))) && attempts < 10) {
    index = (index + 1) % pool.length;
    selectedQuest = pool[index];
    attempts++;
  }
  return selectedQuest;
};

export const generateQuests = (params: {
  todayDateStr: string;
  userId: string;
  wheelArea: string;
  lastWheel: any;
  lastDisc: any;
  lastMoney: any;
  lastLibrarySoul: any;
  isRandomMode: boolean;
  customQuestTitle: string;
  wheelPlanDay: number;
  completedQuests: any[];
  slotSeeds: number[];
}) => {
  const { todayDateStr, userId, wheelArea, lastWheel, lastDisc, lastMoney, lastLibrarySoul, isRandomMode, customQuestTitle, wheelPlanDay, completedQuests, slotSeeds } = params;

  if (!todayDateStr || !userId) return [];

  const dateSeed = parseInt(todayDateStr.replace(/-/g, '')) || 1;
  const userSeed = userId.split('').slice(-5).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const wheelSeed = dateSeed + userSeed;

  const qList = [
    { id: 1, type: "WHEEL", title: "", xp: 20 },
    { id: 2, type: "DISC", title: "", xp: 15 },
    { id: 3, type: "MONEY", title: "", xp: 15 },
    { id: 4, type: "LIBRARY", title: "", xp: 15 },
    { id: 5, type: "WILDCARD", title: "", xp: 10 },
    { id: 6, type: "CHALLENGE", title: "", xp: 10 },
  ];

  let wheelQuestSet = false;

  if (isRandomMode && customQuestTitle) {
    qList[0].title = customQuestTitle;
    wheelQuestSet = true;
  }

  if (!wheelQuestSet && lastWheel?.analysis) {
    const planSection = lastWheel.analysis.split('📅')[1];
    if (planSection) {
      const planItems = planSection.split('\n')
        .filter((l: string) => l.match(/^[1-7]\.|^-|\bDay\s?[1-7]\b/i))
        .map((l: string) => l.replace(/^[1-7]\.\s*|^-\s*|\*\*/g, '').trim());

      if (planItems.length > 0) {
        const isWheelDoneToday = completedQuests.includes(1);
        const currentDisplayDay = isWheelDoneToday ? Math.max(0, wheelPlanDay - 1) : wheelPlanDay;

        if (currentDisplayDay < 7) {
          const dayIdx = currentDisplayDay;
          let currentDayPlan = planItems[dayIdx] || planItems[0];
          qList[0].title = `DAY ${dayIdx + 1}/7 | ${currentDayPlan.replace(/^(Day\s*\d+\s*[:\-]\s*|\d+\.\s*)/i, '').trim()}`;
          wheelQuestSet = true;
        } else {
          qList[0].title = `🌟 ครบแผน 7 วันแล้ว ! ไป Audit เพื่อรับ Daily Quest รอบใหม่กันนะครับ`;
          qList[0].xp = 0;
          wheelQuestSet = true;
        }
      }
    }
  }

  if (!wheelQuestSet) {
    const wheelPool = QUEST_POOL.WHEEL[wheelArea] || QUEST_POOL.WHEEL["การงาน"];
    const x = Math.sin(wheelSeed * 1.5 * 12.9898 + 1.5 * 78.233) * 43758.5453123;
    const wheelIdx = Math.floor((x - Math.floor(x)) * wheelPool.length);
    qList[0].title = wheelPool[wheelIdx];
  }

  const discMainChar = lastDisc ? (lastDisc.finalResult || lastDisc.result || "C").charAt(0) : "C";
  const discPool = QUEST_POOL.DISC[discMainChar] || QUEST_POOL.DISC["C"];
  qList[1].title = discPool[pseudoRandomSlot(discPool.length, 2.7, 1, dateSeed, userSeed, slotSeeds)];

  const moneyKey = (lastMoney?.resultKey || "MID_RISK_MID_DISC");
  const moneyPool = QUEST_POOL.MONEY[moneyKey] || QUEST_POOL.MONEY["MID_RISK_MID_DISC"];
  qList[2].title = moneyPool[pseudoRandomSlot(moneyPool.length, 3.9, 2, dateSeed, userSeed, slotSeeds)];

  const soulType = lastLibrarySoul?.type || "INFP";
  let soulGroup: "NT" | "NF" | "SJ" | "SP" = "NF";
  if (["INTJ", "INTP", "ENTJ", "ENTP"].includes(soulType)) soulGroup = "NT";
  else if (["INFJ", "INFP", "ENFJ", "ENFP"].includes(soulType)) soulGroup = "NF";
  else if (["ISTJ", "ISFJ", "ESTJ", "ESFJ"].includes(soulType)) soulGroup = "SJ";
  else if (["ISTP", "ISFP", "ESTP", "ESFP"].includes(soulType)) soulGroup = "SP";

  const libraryPool = QUEST_POOL.LIBRARY[soulGroup] || QUEST_POOL.LIBRARY["NF"];
  qList[3].title = libraryPool[pseudoRandomSlot(libraryPool.length, 4.2, 3, dateSeed, userSeed, slotSeeds)];

  const currentTitles = [qList[0].title, qList[1].title, qList[2].title, qList[3].title];
  qList[4].title = getUniqueQuestSlot(QUEST_POOL.WILDCARD, currentTitles, 5.5, 4, dateSeed, userSeed, slotSeeds);
  currentTitles.push(qList[4].title);
  qList[5].title = getUniqueQuestSlot(QUEST_POOL.CHALLENGE, currentTitles, 6.8, 5, dateSeed, userSeed, slotSeeds);

  return qList;
};
