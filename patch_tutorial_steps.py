import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_tutorial = """              {tutorialStep === 2 && (
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
              </button>"""

new_tutorial = """              {tutorialStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-4 z-10 w-full">
                  <div className="flex gap-3 mb-6 relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 p-2 overflow-hidden border-2 border-white">
                      <img src="/avatars/rookie-static-male.png" alt="Male Avatar" className="w-full h-full object-contain drop-shadow-md scale-110" />
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/20 p-2 overflow-hidden border-2 border-white">
                      <img src="/avatars/rookie-static-female.png" alt="Female Avatar" className="w-full h-full object-contain drop-shadow-md scale-110" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-bounce">NEW!</div>
                  </div>
                  <h3 className="text-[22px] font-black text-slate-800 mb-3 leading-tight">สร้าง <span className="text-emerald-600">"ตัวตน"</span> ของคุณ</h3>
                  <div className="bg-emerald-50/80 border border-emerald-100 p-4 rounded-2xl w-full">
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                      เริ่มแรกให้กดไปที่แท็บ <span className="font-bold text-emerald-700">"ตัวตน"</span> ด้านล่าง เพื่อทำแบบประเมินและ <strong>รับ XP ก้อนแรก!</strong><br/>
                      <span className="text-[11px] text-emerald-800 mt-2 block font-bold bg-emerald-100/50 p-2 rounded-lg">
                        ✨ คุณจะได้รับ Avatar ประจำตัวสุดเท่ และข้อมูลภารกิจที่ AI ออกแบบมาเพื่อคุณโดยเฉพาะ!
                      </span>
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

              {tutorialStep === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-4 z-10 w-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-purple-500/30 mb-6 relative">
                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse" />
                    🤖
                  </div>
                  <h3 className="text-[22px] font-black text-slate-800 mb-3 leading-tight">พูดคุยกับ <span className="text-purple-600">AI คู่คิด</span></h3>
                  <div className="bg-purple-50/80 border border-purple-100 p-4 rounded-2xl w-full">
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                      คุณสามารถปรึกษา <strong>AI Chatbot</strong> อัจฉริยะที่รู้ข้อมูลทุกมิติของคุณ เพื่อขอคำแนะนำและแผนอัพสกิลแบบเจาะจงได้ทันที!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Premium Progress Dots */}
              <div className="flex gap-2 my-6 z-10">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className={`h-1.5 rounded-full transition-all duration-500 ${step === tutorialStep ? 'w-8 bg-gradient-to-r from-red-500 to-orange-500 shadow-sm' : 'w-2 bg-slate-200'}`} />
                ))}
              </div>

              {/* Premium Action Button */}
              <button 
                onClick={() => {
                  if (tutorialStep < 4) setTutorialStep(prev => prev + 1);
                  else finishTutorial();
                }}
                className={`w-full py-4 rounded-2xl font-black text-[15px] transition-all duration-300 z-10 shadow-[0_8px_20px_rgba(0,0,0,0.1)] active:scale-95 ${
                  tutorialStep === 4 
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-500 hover:to-orange-400' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {tutorialStep < 4 ? 'ถัดไป' : 'เข้าใจแล้ว ลุยเลย! 🚀'}
              </button>"""

content = content.replace(old_tutorial, new_tutorial)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
