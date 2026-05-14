import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_tooltip = """              {/* Tooltip on Tap/Hover (Premium Style) */}
              <div className="absolute top-[calc(100%+12px)] right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-[0_10px_25px_rgba(0,0,0,0.2)] pointer-events-none border border-white/10 transform translate-y-2 group-hover:translate-y-0 origin-top-right md:origin-top">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span>อีก <span className="text-orange-400 font-black">{100 - currentLevelXP}</span> XP อัปเลเวล!</span>
                </div>
                {/* สามเหลี่ยมชี้ขึ้น (ปรับให้อยู่ตรงกลางบน Mobile และ Desktop ตามตำแหน่งกล่อง) */}
                <div className="absolute -top-[5px] right-[24px] md:right-auto md:left-1/2 md:-translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-slate-900/90" />
              </div>"""

new_tooltip = """              {/* Tooltip on Tap/Hover (Premium Style) */}
              <div className="absolute top-[calc(100%+12px)] right-[-8px] bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-[0_10px_25px_rgba(0,0,0,0.2)] pointer-events-none border border-white/10 transform translate-y-2 group-hover:translate-y-0 origin-top-right">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span>อีก <span className="text-orange-400 font-black">{100 - currentLevelXP}</span> XP อัปเลเวล!</span>
                </div>
                {/* สามเหลี่ยมชี้ขึ้น */}
                <div className="absolute -top-[5px] right-[30px] md:right-[34px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-slate-900/90" />
              </div>"""

content = content.replace(old_tooltip, new_tooltip)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
