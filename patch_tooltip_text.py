import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_tooltip = """                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span><span className="text-orange-400 font-black">{totalXP.toLocaleString()}</span> XP</span>
                </div>"""

new_tooltip = """                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span>อีก <span className="text-orange-400 font-black">{100 - currentLevelXP}</span> XP อัปเลเวล!</span>
                </div>"""

content = content.replace(old_tooltip, new_tooltip)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
