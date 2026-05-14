import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Replace the text-right div
old_xp_div = """                    <div className="shrink-0 text-right">
                      {isNotice ? (
                        // 🚩 ถ้าเป็นประกาศ โชว์ป้ายคำสั่งแทนเลข XP
                        <span className="text-[10px] font-black px-3 py-2 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-200 uppercase tracking-widest">
                          Audit
                        </span>
                      ) : (
                        <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl border shadow-sm transition-all
            ${isDone
                            ? 'bg-slate-100 border-slate-200 text-slate-400'
                            : 'bg-white border-orange-100 text-orange-500 group-hover/card:bg-gradient-to-r group-hover/card:from-orange-400 group-hover/card:to-red-500 group-hover/card:text-white group-hover/card:border-transparent group-hover/card:shadow-[0_5px_15px_rgba(249,115,22,0.3)]'
                          }`}>
                          +{quest.xp} XP
                        </span>
                      )}
                    </div>"""

new_xp_div = """                    <div className="shrink-0 text-right flex flex-col items-end gap-2">
                      {isNotice || quest.title.includes('สรุปผล') ? (
                        <span className="text-[10px] font-black px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200 uppercase tracking-widest cursor-pointer">
                          {quest.title.includes('สรุปผล') ? 'Claim Bonus' : 'Audit'}
                        </span>
                      ) : (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl border shadow-sm transition-all ${isDone ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-orange-100 text-orange-500 group-hover/card:bg-gradient-to-r group-hover/card:from-orange-400 group-hover/card:to-red-500 group-hover/card:text-white group-hover/card:border-transparent group-hover/card:shadow-[0_5px_15px_rgba(249,115,22,0.3)]'}`}>
                            +{quest.xp} XP
                          </span>
                          
                          {quest.id === 1 && !isDone && quest.title.includes('DAY') && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSkipWheelQuest(); }}
                              className="text-[10px] text-slate-400 hover:text-red-500 font-bold bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm transition-all flex items-center gap-1 z-10"
                              title="ข้ามไปทำแผนของวันพรุ่งนี้ (0 XP)"
                            >
                              ⏭️ ข้าม (Skip)
                            </button>
                          )}
                        </div>
                      )}
                    </div>"""

content = content.replace(old_xp_div, new_xp_div)

# Now, add the info tooltip about the 7-day plan below the Wheel quest title
old_title_rendering = """                      <p className={`text-[14px] md:text-[15px] font-bold leading-snug 
          ${isDone ? 'line-through text-slate-400' : isNotice ? 'text-amber-900' : 'text-slate-700'}`}>
                        {quest.title.includes('|') ? quest.title.split('|')[1].trim() : quest.title}
                      </p>
                    </div>"""

new_title_rendering = """                      <p className={`text-[14px] md:text-[15px] font-bold leading-snug 
          ${isDone ? 'line-through text-slate-400' : isNotice || quest.title.includes('สรุปผล') ? 'text-amber-900' : 'text-slate-700'}`}>
                        {quest.title.includes('|') ? quest.title.split('|')[1].trim() : quest.title}
                      </p>
                      {quest.id === 1 && !quest.title.includes('สรุปผล') && (
                        <div className="flex items-center gap-1 mt-1 opacity-70">
                          <span className="text-[10px] text-slate-500 font-medium">✨ จบแผนครบ 7 วัน มีโบนัส XP พิเศษรออยู่!</span>
                        </div>
                      )}
                    </div>"""

content = content.replace(old_title_rendering, new_title_rendering)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
