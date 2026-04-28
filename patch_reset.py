import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_code = """      setRelativeWeekInfo(calculateRelativeWeek(resetDate));
      setChatQuota({ used: 0, total: 1 }); // 🤖 รีเซ็ตโควตา AI Mentor ทันที

      // 🚀 6. เลื่อนขึ้นไปด้านบนสุดเพื่อให้เห็นการเปลี่ยนแปลง"""

new_code = """      setRelativeWeekInfo(calculateRelativeWeek(resetDate));
      setChatQuota({ used: 0, total: 1 }); // 🤖 รีเซ็ตโควตา AI Mentor ทันที
      localStorage.removeItem('hasSeenDashboardTutorial');
      setShowTutorial(true);
      setTutorialStep(1);

      // 🚀 6. เลื่อนขึ้นไปด้านบนสุดเพื่อให้เห็นการเปลี่ยนแปลง"""

content = content.replace(old_code, new_code)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
