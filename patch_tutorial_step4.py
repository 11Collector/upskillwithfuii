import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_step4 = """              {tutorialStep === 4 && (
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
              )}"""

new_step4 = """              {tutorialStep === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-4 z-10 w-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-purple-500/30 mb-6 relative">
                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse" />
                    🧠
                  </div>
                  <h3 className="text-[22px] font-black text-slate-800 mb-3 leading-tight">ศูนย์รวม <span className="text-purple-600">"อัพสกิล"</span></h3>
                  <div className="bg-purple-50/80 border border-purple-100 p-4 rounded-2xl w-full">
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                      แวะไปที่แท็บ <span className="font-bold text-purple-700">"อัพสกิล"</span> ด้านล่าง<br/>
                      เพื่อใช้งานโหมด <strong>ทำสมาธิ (Deep Work)</strong> เพิ่มโฟกัส<br/>
                      <span className="text-[11px] text-slate-500 mt-1 block">และพูดคุยกับ <strong>AI Mentor ส่วนตัว</strong> ที่เข้าใจคุณที่สุด!</span>
                    </p>
                  </div>
                </motion.div>
              )}"""

content = content.replace(old_step4, new_step4)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
