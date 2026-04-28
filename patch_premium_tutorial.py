import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_tutorial = """      {/* 🎓 Onboarding Tutorial Modal */}
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
      </AnimatePresence>"""

new_tutorial = """      {/* 🎓 Premium Onboarding Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 overflow-hidden z-10 flex flex-col items-center text-center"
            >
              {/* Premium Background Orbs */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

              {/* Skip Button */}
              <button 
                onClick={finishTutorial}
                className="absolute top-4 right-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-white/80 backdrop-blur border border-slate-100 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-all z-20"
              >
                ข้ามการแนะนำ
              </button>

              {tutorialStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-4 z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-[2rem] flex items-center justify-center shadow-inner mb-6 relative">
                    <div className="absolute inset-0 rounded-[2rem] border-2 border-red-200/50" />
                    <img src="/logo-upskill.png" alt="Upskill Logo" className="w-16 h-16 object-contain drop-shadow-md" />
                  </div>
                  <h3 className="text-[22px] font-black text-slate-800 mb-3 leading-tight">ยินดีต้อนรับสู่<br/><span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">Upskill Everyday</span></h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-2 font-medium">
                    พื้นที่ส่วนตัวสำหรับพัฒนาตัวเอง<br/>ให้เก่งขึ้นและเป็นเวอร์ชันที่ดีกว่าในทุกๆ วัน
                  </p>
                </motion.div>
              )}

              {tutorialStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-4 z-10 w-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-teal-500/30 mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 w-1/2 h-full -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    🧬
                  </div>
                  <h3 className="text-[22px] font-black text-slate-800 mb-3 leading-tight">สร้าง <span className="text-emerald-600">"ตัวตน"</span> ของคุณ</h3>
                  <div className="bg-emerald-50/80 border border-emerald-100 p-4 rounded-2xl w-full">
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                      เริ่มแรกให้กดไปที่แท็บ <span className="font-bold text-emerald-700">"ตัวตน"</span> ด้านล่าง<br/>
                      เพื่อทำแบบประเมินพื้นฐาน <strong>รับ XP ก้อนแรก!</strong><br/>
                      <span className="text-[11px] text-slate-500 mt-1 block">และให้ AI จัดแผนพัฒนาที่เหมาะกับคุณที่สุด</span>
                    </p>
                  </div>
                </motion.div>
              )}

              {tutorialStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-4 z-10 w-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-orange-500/30 mb-6">
                    🎯
                  </div>
                  <h3 className="text-[22px] font-black text-slate-800 mb-3 leading-tight">ทำภารกิจ <span className="text-orange-500">& อัปเลเวล</span></h3>
                  <div className="bg-orange-50/80 border border-orange-100 p-4 rounded-2xl w-full">
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                      เข้ามาเช็กอินที่แท็บ <span className="font-bold text-orange-600">"ภารกิจ"</span> ทุกวัน<br/>
                      เพื่อสะสม XP อัปเลเวล ปลดล็อกความสำเร็จ<br/>
                      <span className="text-[11px] text-slate-500 mt-1 block">และรักษาสถิติต่อเนื่อง (Streak) ของคุณ!</span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Premium Progress Dots */}
              <div className="flex gap-2 my-6 z-10">
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`h-1.5 rounded-full transition-all duration-500 ${step === tutorialStep ? 'w-8 bg-gradient-to-r from-red-500 to-orange-500 shadow-sm' : 'w-2 bg-slate-200'}`} />
                ))}
              </div>

              {/* Premium Action Button */}
              <button 
                onClick={() => {
                  if (tutorialStep < 3) setTutorialStep(prev => prev + 1);
                  else finishTutorial();
                }}
                className={`w-full py-4 rounded-2xl font-black text-[15px] transition-all duration-300 z-10 shadow-[0_8px_20px_rgba(0,0,0,0.1)] active:scale-95 ${
                  tutorialStep === 3 
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-500 hover:to-orange-400' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {tutorialStep < 3 ? 'ถัดไป' : 'เข้าใจแล้ว ลุยเลย! 🚀'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>"""

content = content.replace(old_tutorial, new_tutorial)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
