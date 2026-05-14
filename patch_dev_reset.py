import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

dev_button = """  const handleDevReset = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        wheelPlanDay: 0,
        wheelPlanSkips: 0,
        lastSkipDate: "",
        completedQuestIds: []
      });
      setWheelPlanDay(0);
      setWheelPlanSkips(0);
      setLastSkipDate("");
      setCompletedQuests([]);
      alert("DEV: รีเซ็ตเป็น Day 1/7 เรียบร้อยแล้ว! พร้อมทดสอบ");
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-transparent px-6 md:px-8 py-4 pb-28 md:pb-4">
      <button onClick={handleDevReset} className="fixed bottom-24 right-6 bg-red-600 text-white px-4 py-2 rounded-full font-bold z-50 shadow-lg border-2 border-white text-xs">🛠️ DEV: Reset to Day 1</button>"""

content = content.replace('  return (\n    <div className="min-h-screen bg-transparent px-6 md:px-8 py-4 pb-28 md:pb-4">', dev_button)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
