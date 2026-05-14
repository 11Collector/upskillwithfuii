import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Add states
old_states = """  const [wheelPlanSkips, setWheelPlanSkips] = useState<number>(0);
  const [perfectWeeks, setPerfectWeeks] = useState<number>(0);
  const [lastSkipDate, setLastSkipDate] = useState<string>("");"""

new_states = """  const [wheelPlanSkips, setWheelPlanSkips] = useState<number>(0);
  const [perfectWeeks, setPerfectWeeks] = useState<number>(0);
  const [lastSkipDate, setLastSkipDate] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showWheelRulesModal, setShowWheelRulesModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);"""

content = content.replace(old_states, new_states)

# 2. Add Floating XP Pill inside return
old_return = """  return (
    <div className="min-h-screen bg-transparent px-6 md:px-8 py-4 pb-28 md:pb-4">"""

new_return = """  return (
    <div className="min-h-screen bg-transparent px-6 md:px-8 py-4 pb-28 md:pb-4">
      {/* 🚀 Floating XP Pill */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] pointer-events-none w-[90%] max-w-sm"
          >
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/50 shadow-[0_10px_40px_rgb(0,0,0,0.1)] px-5 py-2.5 rounded-full flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white font-black text-sm shadow-inner shadow-white/20 shrink-0">
                  {userLevel}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lv.{userLevel}</span>
                    <span className="text-[11px] font-black text-orange-500">{totalXP.toLocaleString()} XP</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, ((totalXP - ((userLevel - 1) * 500)) / 500) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>"""

content = content.replace(old_return, new_return)

# 3. Update the info text to be clickable
old_hint = """                      {quest.id === 1 && !quest.title.includes('สรุปผล') && (
                        <div className="flex items-center gap-1 mt-1 opacity-70">
                          <span className="text-[10px] text-slate-500 font-medium">✨ จบแผนครบ 7 วัน มีโบนัส XP พิเศษรออยู่!</span>
                        </div>
                      )}"""

new_hint = """                      {quest.id === 1 && !quest.title.includes('สรุปผล') && (
                        <div 
                          className="flex items-center gap-1.5 mt-2 cursor-pointer opacity-90 hover:opacity-100 transition-opacity w-fit bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100/50"
                          onClick={(e) => { e.stopPropagation(); setShowWheelRulesModal(true); }}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center font-bold text-[9px]">i</div>
                          <span className="text-[10px] text-amber-800 font-bold underline decoration-amber-300 decoration-dashed underline-offset-2">กติกาแผน 7 วัน & โบนัส XP</span>
                        </div>
                      )}"""

content = content.replace(old_hint, new_hint)

# 4. Add Modal at the end of the file before last </div>
old_end = """    </div>
  );
}"""

new_end = """      {/* 🎯 Modal กติกา Wheel Plan */}
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
      </AnimatePresence>
    </div>
  );
}"""

content = content.replace(old_end, new_end)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
