import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Remove Dev Reset function
dev_reset_func = """  const handleDevReset = async () => {
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
      setCompletedQuests([]);
      setLastSkipDate("");
      alert("รีเซ็ตเป็น Day 1 เรียบร้อย!");
    } catch (e) {
      console.error(e);
    }
  };"""

content = content.replace(dev_reset_func, "")

# 2. Remove Dev Reset button
dev_reset_btn = """      <button onClick={handleDevReset} className="fixed bottom-24 right-6 bg-red-600 text-white px-4 py-2 rounded-full font-bold z-50 shadow-lg border-2 border-white text-xs">🛠️ DEV: Reset to Day 1</button>"""
content = content.replace(dev_reset_btn, "")

# 3. Add states for Tutorial
states_pattern = """  const [showWheelRulesModal, setShowWheelRulesModal] = useState(false);"""
new_states = """  const [showWheelRulesModal, setShowWheelRulesModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);

  useEffect(() => {
    if (!loading && user) {
      const hasSeen = localStorage.getItem('hasSeenDashboardTutorial');
      if (!hasSeen && totalXP === 0) {
        setShowTutorial(true);
      }
    }
  }, [loading, user, totalXP]);

  const finishTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenDashboardTutorial', 'true');
  };"""

content = content.replace(states_pattern, new_states)

# 4. Add Tutorial Modal UI just before the showWheelRulesModal
tutorial_ui = """      {/* 🎓 Onboarding Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl overflow-hidden z-10 flex flex-col items-center text-center"
            >
              {/* Skip Button */}
              <button 
                onClick={finishTutorial}
                className="absolute top-4 right-4 text-[11px] font-bold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
              >
                ข้ามการแนะนำ
              </button>

              {tutorialStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-indigo-200 mb-6 rotate-3">
                    🚀
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight">ยินดีต้อนรับสู่<br/>ศูนย์บัญชาการชีวิต!</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-2">
                    ที่นี่คือพื้นที่ส่วนตัวของคุณ สำหรับการพัฒนาตัวเองให้เก่งขึ้นในทุกๆ วัน
                  </p>
                </motion.div>
              )}

              {tutorialStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-teal-200 mb-6 -rotate-3">
                    🔍
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight">เริ่มต้นจาก<br/>"รู้จักตัวเอง"</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-2">
                    ก่อนอื่น เราแนะนำให้คุณไปทำ <strong>แบบประเมินทั้ง 4 ด้าน</strong> เพื่อให้ AI จัดแผนพัฒนาที่เหมาะกับคุณที่สุด!
                  </p>
                </motion.div>
              )}

              {tutorialStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-orange-200 mb-6 rotate-3">
                    🎮
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight">ทำภารกิจรายวัน<br/>& อัปเลเวล</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-2">
                    เข้ามาเช็กอินและทำภารกิจให้สำเร็จเพื่อ <strong>สะสม XP อัปเลเวล</strong> และรักษาสถิติต่อเนื่อง (Streak) ของคุณ!
                  </p>
                </motion.div>
              )}

              {/* Progress Dots */}
              <div className="flex gap-2 my-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`h-1.5 rounded-full transition-all duration-300 ${step === tutorialStep ? 'w-6 bg-slate-800' : 'w-2 bg-slate-200'}`} />
                ))}
              </div>

              {/* Action Button */}
              <button 
                onClick={() => {
                  if (tutorialStep < 3) setTutorialStep(prev => prev + 1);
                  else finishTutorial();
                }}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[15px] hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-900/20"
              >
                {tutorialStep < 3 ? 'ถัดไป' : 'เข้าใจแล้ว ลุยเลย!'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>\n"""

content = content.replace("{/* 🎯 Modal กติกา Wheel Plan */}", tutorial_ui + "      {/* 🎯 Modal กติกา Wheel Plan */}")

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
