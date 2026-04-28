import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Add check in handleSkipWheelQuest
old_handle_skip = """  const handleSkipWheelQuest = async () => {
    if (!user) return;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    try {"""

new_handle_skip = """  const handleSkipWheelQuest = async () => {
    if (!user) return;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    
    if (lastSkipDate === today) {
      alert("คุณใช้สิทธิ์ข้ามภารกิจของวันนี้ไปแล้วครับ ลองทำภารกิจที่เห็นหรือรอข้ามใหม่พรุ่งนี้นะ!");
      return;
    }
    
    try {"""

content = content.replace(old_handle_skip, new_handle_skip)

# Hide button in UI if already skipped today
old_skip_button = """                          {quest.id === 1 && !isDone && quest.title.includes('DAY') && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSkipWheelQuest(); }}
                              className="text-[10px] text-slate-400 hover:text-red-500 font-bold bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm transition-all flex items-center gap-1 z-10"
                              title="ข้ามไปทำแผนของวันพรุ่งนี้ (0 XP)"
                            >
                              ⏭️ ข้าม (Skip)
                            </button>
                          )}"""

new_skip_button = """                          {quest.id === 1 && !isDone && quest.title.includes('DAY') && lastSkipDate !== todayDateStr && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSkipWheelQuest(); }}
                              className="text-[10px] text-slate-400 hover:text-red-500 font-bold bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm transition-all flex items-center gap-1 z-10"
                              title="ข้ามไปทำแผนของวันพรุ่งนี้ (จำกัดวันละ 1 ครั้ง)"
                            >
                              ⏭️ ข้าม (Skip)
                            </button>
                          )}"""

content = content.replace(old_skip_button, new_skip_button)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
