import sys

path = "src/app/dashboard/page.tsx"
with open(path, "r") as f:
    lines = f.readlines()

out = []
i = 0
while i < len(lines):
    line = lines[i]
    if line.startswith("// --- 💡 Dictionaries ---"):
        # Insert imports
        out.append('import { MONEY_DATA, DISC_DATA, QUEST_POOL, categoryNames } from "@/data/quests";\n')
        out.append('import { INSPIRATIONAL_MESSAGES, COMPLIMENTARY_MESSAGES, avatarImages, PET_DATA } from "@/data/constants";\n\n')
        
        # Skip until formatAnalysisText
        while i < len(lines) and not lines[i].startswith("// 💡 ฟังก์ชันแปลงข้อความ AI ให้สวยงาม"):
            i += 1
        continue
    
    if line.startswith("// ใส่ไว้ใต้ const profileCenters = [...] ก็ได้ครับ"):
        # Skip until export default function
        while i < len(lines) and not lines[i].startswith("export default function DashboardPage() {"):
            i += 1
        continue
        
    out.append(line)
    i += 1

with open(path, "w") as f:
    f.writelines(out)

print("Done")
