import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_pill = """              <div className="flex items-center gap-3 w-full">
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
              </div>"""

new_pill = """              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white font-black text-sm shadow-inner shadow-white/20 shrink-0">
                  {currentLevel}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lv.{currentLevel}</span>
                    <span className="text-[11px] font-black text-orange-500">{totalXP.toLocaleString()} XP</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${currentLevelXP}%` }}
                    />
                  </div>
                </div>
              </div>"""

content = content.replace(old_pill, new_pill)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
