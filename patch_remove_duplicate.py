import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# The modal was inserted into AvatarDisplay around line 700.
# The exact text added was:
modal_text = """      {/* 🎯 Modal กติกา Wheel Plan */}
      <AnimatePresence>
        {showWheelRulesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowWheelRulesModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl overflow-hidden z-10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -z-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/10 rounded-tr-full -z-10" />
              
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-200">
                <PieChart size={24} />
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-2">กติกาแผน 7 วัน <br/><span className="text-orange-500">Wheel of Life</span></h3>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                ทำภารกิจรายวันที่ AI วิเคราะห์ให้ต่อเนื่อง 7 วัน เพื่อรับโบนัสสุดคุ้มตอนจบแผน!
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="text-2xl drop-shadow-sm">🏆</div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-0.5">Perfect Run (7/7 วัน)</div>
                    <div className="text-sm font-black text-amber-600">รับ 100 XP + ตรา Perfect Week</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-2xl drop-shadow-sm">🌟</div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Great Run (5-6 วัน)</div>
                    <div className="text-sm font-black text-slate-700">รับโบนัส 50 XP</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-2xl drop-shadow-sm">👍</div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Good Run (1-4 วัน)</div>
                    <div className="text-sm font-black text-slate-700">รับโบนัส 20 XP</div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 mb-6">
                <p className="text-xs text-orange-800 font-medium leading-relaxed">
                  <span className="font-bold">💡 รู้หรือไม่?</span> หากวันไหนรู้สึกว่าภารกิจยากเกินไป คุณสามารถกด <span className="font-black">"⏭️ ข้าม"</span> ได้วันละ 1 ครั้ง โดยจะไม่เสียสถิติ Active ของวันนั้น (แต่จะพลาด Perfect Run นะ)
                </p>
              </div>

              <button 
                onClick={() => setShowWheelRulesModal(false)}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                เข้าใจแล้ว ลุยเลย!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>"""

# Replace the first occurrence of modal_text with empty string
content = content.replace(modal_text, "", 1)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
