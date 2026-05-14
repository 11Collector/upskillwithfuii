import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_skip = """  const handleSkipWheelQuest = async () => {
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

new_skip = """  const handleSkipWheelQuest = async () => {
    if (!user) return;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    
    if (lastSkipDate === today) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        wheelPlanSkips: increment(1),
        wheelPlanDay: increment(1),
        lastSkipDate: today
        // ไม่ใส่ arrayUnion(1) เพื่อไม่ให้นับ Progress เควสประจำวัน
      });
      setWheelPlanSkips(prev => prev + 1);
      setWheelPlanDay(prev => prev + 1);
      setLastSkipDate(today);
      alert("ดีแล้วที่รู้ลิมิตตัวเอง วันนี้พักก่อนน้า พรุ่งนี้ค่อยมาลุย Day ถัดไปกัน! 🌱");
    } catch (e) { console.error(e); }
  };"""

content = content.replace(old_skip, new_skip)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
