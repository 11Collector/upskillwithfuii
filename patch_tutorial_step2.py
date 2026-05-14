import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_step2 = """              {tutorialStep === 2 && (
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
              )}"""

new_step2 = """              {tutorialStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-4 z-10 w-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-teal-500/30 mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 w-1/2 h-full -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    🧬
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
              )}"""

content = content.replace(old_step2, new_step2)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
