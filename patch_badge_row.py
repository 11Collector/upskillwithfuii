import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_disc_badge = """                      {/* DISC Badge */}
                      {lastDisc && (
                        <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-white/10">
                          <Zap size={12} className="text-blue-400 shrink-0" />
                          <span className="text-[9px] sm:text-[10px] font-black text-blue-300 tracking-wide whitespace-nowrap">
                            {DISC_DATA[(lastDisc.finalResult || lastDisc.result || "C").charAt(0)]?.rpgTitle}
                          </span>
                        </div>
                      )}"""

new_disc_badge = """                      {/* DISC Badge */}
                      {lastDisc && (
                        <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-white/10">
                          <Zap size={12} className="text-blue-400 shrink-0" />
                          <span className="text-[9px] sm:text-[10px] font-black text-blue-300 tracking-wide whitespace-nowrap">
                            {DISC_DATA[(lastDisc.finalResult || lastDisc.result || "C").charAt(0)]?.rpgTitle}
                          </span>
                        </div>
                      )}
                      
                      {/* Perfect Week Badge */}
                      {perfectWeeks > 0 && (
                        <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-yellow-500/20" title="ทำแผน Wheel of Life 7 วันสำเร็จแบบ 100%">
                          <span className="text-[9px] sm:text-[10px] font-black text-yellow-400 tracking-wide whitespace-nowrap">
                            🎖️ Perfect x{perfectWeeks}
                          </span>
                        </div>
                      )}"""

content = content.replace(old_disc_badge, new_disc_badge)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
