import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Block toggleQuest if already skipped
old_toggle = """  const toggleQuest = async (id: number | string, xp: number) => {
    if (!user || isToggling) return;
    setIsToggling(true);

    // 🌟 ระบบรับโบนัสจบแผน"""

new_toggle = """  const toggleQuest = async (id: number | string, xp: number) => {
    if (!user || isToggling) return;
    setIsToggling(true);
    
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    if (id === 1 && lastSkipDate === todayStr) {
      alert("วันนี้คุณได้หยุดพักจากภารกิจ Wheel แล้ว พรุ่งนี้เราค่อยมาลุยกันใหม่น้า ✌️");
      setIsToggling(false);
      return;
    }

    // 🌟 ระบบรับโบนัสจบแผน"""

content = content.replace(old_toggle, new_toggle)

# 2. Update dailyQuests to show encouraging skipped message
old_daily_quest = """    // 🎯 [NEW LOGIC] จัดการแผน AI: ให้เวลา 1 วันสำหรับ Audit
    let wheelQuestSet = false;

    if (isRandomMode && customQuestTitle) {"""

new_daily_quest = """    // 🎯 [NEW LOGIC] จัดการแผน AI: ให้เวลา 1 วันสำหรับ Audit
    let wheelQuestSet = false;
    
    if (lastSkipDate === todayDateStr) {
      qList[0].title = `🌱 พักกายพักใจก่อนนะ พรุ่งนี้ค่อยลุย DAY ${Math.min(7, wheelPlanDay + 1)}/7 ต่อ!`;
      qList[0].xp = 0;
      wheelQuestSet = true;
    }

    if (!wheelQuestSet && isRandomMode && customQuestTitle) {"""

content = content.replace(old_daily_quest, new_daily_quest)

# 3. Update handleSkipWheelQuest to auto-complete and show alert
old_handle_skip = """  const handleSkipWheelQuest = async () => {
    if (!user) return;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    
    if (lastSkipDate === today) {
      alert("คุณใช้สิทธิ์ข้ามภารกิจของวันนี้ไปแล้วครับ ลองทำภารกิจที่เห็นหรือรอข้ามใหม่พรุ่งนี้นะ!");
      return;
    }
    
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
  };"""

new_handle_skip = """  const handleSkipWheelQuest = async () => {
    if (!user) return;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    
    if (lastSkipDate === today) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        wheelPlanSkips: increment(1),
        wheelPlanDay: increment(1),
        lastSkipDate: today,
        completedQuestIds: arrayUnion(1)
      });
      setWheelPlanSkips(prev => prev + 1);
      setWheelPlanDay(prev => prev + 1);
      setLastSkipDate(today);
      if (!completedQuests.includes(1)) {
        setCompletedQuests(prev => [...prev, 1]);
      }
      alert("ดีแล้วที่รู้ลิมิตตัวเอง วันนี้พักก่อนน้า พรุ่งนี้ค่อยมาลุย Day ถัดไปกัน! 🌱");
    } catch (e) { console.error(e); }
  };"""

content = content.replace(old_handle_skip, new_handle_skip)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
