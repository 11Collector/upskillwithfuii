import sys

path = "src/app/dashboard/page.tsx"
with open(path, "r") as f:
    lines = f.readlines()

out = []
i = 0
imported = False

while i < len(lines):
    line = lines[i]
    
    # Add import
    if line.startswith("import { formatAnalysisText, AvatarDisplay, calculateRelativeWeek } from \"@/utils/dashboardHelpers\";") and not imported:
        out.append(line)
        out.append('import { FloatingPremiumXP, QuestItem } from "./_components/DashboardUI";\n')
        imported = True
        i += 1
        continue
        
    # Replace Floating Premium XP
    if line.strip() == "{/* 🚀 Floating Premium Circular XP */}":
        out.append('      {/* 🚀 Floating Premium Circular XP */}\n')
        out.append('      <FloatingPremiumXP\n')
        out.append('        isScrolled={isScrolled}\n')
        out.append('        showFloatingXP={showFloatingXP}\n')
        out.append('        setShowFloatingXP={setShowFloatingXP}\n')
        out.append('        currentLevel={currentLevel}\n')
        out.append('        currentLevelXP={currentLevelXP}\n')
        out.append('      />\n')
        
        # Skip until end of AnimatePresence
        while i < len(lines) and not lines[i].strip() == "</AnimatePresence>":
            i += 1
        
        # Skip the </AnimatePresence> line itself if the next line is what we want, wait, the loop will skip to </AnimatePresence>, so I need to skip one more
        i += 1
        continue
        
    # Replace QuestItem map
    if "{dailyQuests.map((quest) => {" in line:
        out.append('              {dailyQuests.map((quest) => (\n')
        out.append('                <QuestItem\n')
        out.append('                  key={quest.id}\n')
        out.append('                  quest={quest}\n')
        out.append('                  isDone={completedQuests.includes(quest.id)}\n')
        out.append('                  toggleQuest={toggleQuest}\n')
        out.append('                  setShowWheelRulesModal={setShowWheelRulesModal}\n')
        out.append('                />\n')
        out.append('              ))}\n')
        
        # Skip until the end of the map function
        nested = 1
        while i < len(lines):
            i += 1
            if "{" in lines[i]: nested += lines[i].count("{")
            if "}" in lines[i]: nested -= lines[i].count("}")
            if nested <= 0 and ");" in lines[i]:
                break
        i += 1
        continue
        
    out.append(line)
    i += 1

with open(path, "w") as f:
    f.writelines(out)

print("Done")
