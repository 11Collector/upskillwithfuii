import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. State setup
content = content.replace(
    'const [wheelPlanDay, setWheelPlanDay] = useState<number>(0); // 🌟 เพิ่มตัวนี้ครับ',
    'const [wheelPlanDay, setWheelPlanDay] = useState<number>(0);\n  const [wheelPlanSkips, setWheelPlanSkips] = useState<number>(0);\n  const [perfectWeeks, setPerfectWeeks] = useState<number>(0);\n  const [lastSkipDate, setLastSkipDate] = useState<string>("");'
)

# 2. handleSkipWheelQuest function
skip_fn = """
  const handleSkipWheelQuest = async () => {
    if (!user) return;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        wheelPlanSkips: increment(1),
        wheelPlanDay: increment(1),
        lastSkipDate: today
      });
      setWheelPlanSkips(prev => prev + 1);
      setWheelPlanDay(prev => prev + 1);
      setLastSkipDate(today);
      alert("ข้ามภารกิจ Wheel วันนี้แล้วครับ (พรุ่งนี้ค่อยทำต่อนะ!)");
    } catch (e) { console.error(e); }
  };
"""
content = content.replace(
    'const handleShuffleQuests = async () => {',
    skip_fn + '\n  const handleShuffleQuests = async () => {'
)

# 3. Load user data
content = content.replace(
    'setWheelPlanDay(userData.wheelPlanDay || 0); // 🌟 เพิ่มบรรทัดนี้ครับ',
    'setWheelPlanDay(userData.wheelPlanDay || 0);\n            setWheelPlanSkips(userData.wheelPlanSkips || 0);\n            setPerfectWeeks(userData.perfectWeeks || 0);\n            setLastSkipDate(userData.lastSkipDate || "");'
)

# 4. Reset data on Cycle Reset
content = content.replace(
    'wheelPlanDay: 0,\n        completedQuestIds: [],',
    'wheelPlanDay: 0,\n        wheelPlanSkips: 0,\n        completedQuestIds: [],'
)
content = content.replace(
    'setWheelPlanDay(0);\n      setCompletedQuests([]);',
    'setWheelPlanDay(0);\n      setWheelPlanSkips(0);\n      setCompletedQuests([]);'
)

# 5. DailyQuests XP and Title
old_qlist_1 = """// ลำดับ 2: ถ้าไม่ได้สุ่ม ค่อยไปเช็คแผน AI 7 วัน (Logic เดิมของคุณฟุ้ย)
    if (!wheelQuestSet && lastWheel?.analysis) {"""

new_qlist_1 = """// ลำดับ 2: ถ้าไม่ได้สุ่ม ค่อยไปเช็คแผน AI 7 วัน
    if (!wheelQuestSet && lastWheel?.analysis) {"""

content = content.replace(old_qlist_1, new_qlist_1)

# Modify the first occurrence of plan items check
old_plan_items = """if (planItems.length > 0) {
          const isWheelDoneToday = completedQuests.includes(1);
          const currentDisplayDay = isWheelDoneToday ? Math.max(0, wheelPlanDay - 1) : wheelPlanDay;

          if (currentDisplayDay < 7) {
            const dayIdx = currentDisplayDay;
            let currentDayPlan = planItems[dayIdx] || planItems[0];
            qList[0].title = `DAY ${dayIdx + 1}/7 | ${currentDayPlan.replace(/^(Day\\s*\\d+\\s*[:\\-]\\s*|\\d+\\.\\s*)/i, '').trim()}`;
            wheelQuestSet = true;
          } else {
            qList[0].title = `🌟 ครบแผน 7 วันแล้ว ! ไป Audit เพื่อรับ Daily Quest รอบใหม่กันนะครับ`;
            qList[0].xp = 0;
            wheelQuestSet = true;
          }
        }"""

new_plan_items = """if (planItems.length > 0) {
          const isWheelDoneToday = completedQuests.includes(1);
          const currentDisplayDay = isWheelDoneToday ? Math.max(0, wheelPlanDay - 1) : wheelPlanDay;

          if (currentDisplayDay < 7) {
            const dayIdx = currentDisplayDay;
            let currentDayPlan = planItems[dayIdx] || planItems[0];
            qList[0].title = `DAY ${dayIdx + 1}/7 | ${currentDayPlan.replace(/^(Day\\s*\\d+\\s*[:\\-]\\s*|\\d+\\.\\s*)/i, '').trim()}`;
            wheelQuestSet = true;
          } else {
            const completedDays = Math.max(0, 7 - (wheelPlanSkips || 0));
            let bonusXp = 20;
            if (completedDays === 7) { bonusXp = 100; }
            else if (completedDays >= 5) { bonusXp = 50; }
            qList[0].id = 1;
            qList[0].xp = bonusXp;
            qList[0].title = `🌟 สรุปผล: สำเร็จ ${completedDays}/7 วัน! (โบนัส +${bonusXp} XP)`;
            wheelQuestSet = true;
          }
        }"""

content = content.replace(old_plan_items, new_plan_items)

# Now remove the duplicate parsing block completely
duplicate_parsing = """    if (lastWheel?.analysis) {
      const planSection = lastWheel.analysis.split('📅')[1];
      if (planSection) {
        const planItems = planSection.split('\\n')
          .filter((l: string) => l.match(/^[1-7]\\.|^-|\\bDay\\s?[1-7]\\b/i))
          .map((l: string) => l.replace(/^[1-7]\\.\\s*|^-\\s*|\\*\\*/g, '').trim());

        // ใน useMemo ของ dailyQuests
        // ใน useMemo ของ dailyQuests
        if (planItems.length > 0) {

          // 🌟 1. เช็กว่า "วันนี้" เรากดติ๊กเควส Wheel ไปแล้วหรือยัง?
          // (สมมติว่าไอดีเควส Wheel คือ 1 และเราเช็กจาก completedQuests นะครับ)
          const isWheelDoneToday = completedQuests.includes(1);

          // 🌟 2. คำนวณ Day ที่จะโชว์:
          // ถ้าวันนี้เพิ่งกดติ๊กเสร็จ (isWheelDoneToday = true) -> ให้โชว์ Day ของเมื่อกี้ (ลบ 1) ไปก่อนจนกว่าจะข้ามวัน
          // ถ้าวันนี้ยังไม่ได้กด (isWheelDoneToday = false) -> โชว์ dayIdx ปัจจุบัน
          const currentDisplayDay = isWheelDoneToday ? Math.max(0, wheelPlanDay - 1) : wheelPlanDay;

          // 🌟 3. ใช้ currentDisplayDay แทน wheelPlanDay ในการโชว์ผล
          if (currentDisplayDay < 7) {
            const dayIdx = currentDisplayDay;
            let currentDayPlan = planItems[dayIdx] || planItems[0];
            const cleanedPlan = currentDayPlan.replace(/^(Day\\s*\\d+\\s*[:\\-]\\s*|\\d+\\.\\s*)/i, '').trim();

            qList[0].title = `DAY ${dayIdx + 1}/7 | ${cleanedPlan}`;
            wheelQuestSet = true;
          } else if (currentDisplayDay >= 7) { // ดัก >= 7 ไว้เผื่อบั๊ก
            qList[0].title = `🌟 ครบแผน 7 วันแล้ว ! ไป Audit เพื่อรับ Daily Quest รอบใหม่กันนะครับ`;
            qList[0].xp = 0;
            wheelQuestSet = true;
          }
        }
      }
    }

    // ลำดับ 3: ถ้าไม่มีอะไรเลย สุ่มจาก Pool ตามด้านที่ Gap เยอะ (ใช้ wheelSeed เพื่อให้คงที่)
    if (!wheelQuestSet) {
      const wheelPool = QUEST_POOL.WHEEL[wheelArea as keyof typeof QUEST_POOL.WHEEL] || QUEST_POOL.WHEEL["การงาน"];
      const x = Math.sin(wheelSeed * 1.5 * 12.9898 + 1.5 * 78.233) * 43758.5453123;
      const wheelIdx = Math.floor((x - Math.floor(x)) * wheelPool.length);
      qList[0].title = wheelPool[wheelIdx];
    }"""
content = content.replace(duplicate_parsing, "")

# 6. dailyXPGained logic
old_daily_xp = """      // 2. เควสปกติหาจาก dailyQuests
      const quest = dailyQuests.find(q => q.id === id);"""

new_daily_xp = """      if (id === 1 && lastSkipDate === todayDateStr) return sum + 0;
      
      // 2. เควสปกติหาจาก dailyQuests
      const quest = dailyQuests.find(q => q.id === id);"""
content = content.replace(old_daily_xp, new_daily_xp)

# 7. handleToggleQuest WheelLogic
old_wheel_logic = """    // 🌟 [NEW LOGIC] จัดการ Wheel Plan Day แยกต่างหาก
    let newWheelDay = wheelPlanDay;
    if (id === 1) { // ข้อ Wheel เสมอ
      newWheelDay = isDone ? Math.max(0, wheelPlanDay - 1) : wheelPlanDay + 1;
      setWheelPlanDay(newWheelDay);
    }"""

new_wheel_logic = """    // 🌟 [NEW LOGIC] จัดการ Wheel Plan Day แยกต่างหาก
    let newWheelDay = wheelPlanDay;
    if (id === 1) { // ข้อ Wheel เสมอ
      // 🌟 รับโบนัสจบแผน
      if (wheelPlanDay >= 7 && !isDone) {
        setTotalXP(prev => prev + xp);
        // ไม่ต้องอัปเดต wheelPlanDay แล้ว (รอเขากดเริ่มประเมินใหม่)
        // หรือตั้งค่าเป็น 8 เพื่อไม่ให้ขึ้นซ้ำ
        setWheelPlanDay(8);
      } else {
        newWheelDay = isDone ? Math.max(0, wheelPlanDay - 1) : wheelPlanDay + 1;
        setWheelPlanDay(newWheelDay);
        
        // แจก Perfect Badge
        if (!isDone && newWheelDay === 7 && wheelPlanSkips === 0 && user) {
          updateDoc(doc(db, "users", user.uid), { perfectWeeks: increment(1) });
          setPerfectWeeks(prev => prev + 1);
          setTimeout(() => alert("🎉 ยินดีด้วย! คุณได้รับตรา Perfect Week"), 1000);
        }
      }
    }"""
content = content.replace(old_wheel_logic, new_wheel_logic)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
