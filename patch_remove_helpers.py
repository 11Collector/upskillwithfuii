import sys

path = "src/app/dashboard/page.tsx"
with open(path, "r") as f:
    lines = f.readlines()

out = []
i = 0
while i < len(lines):
    line = lines[i]
    if line.startswith("// 💡 ฟังก์ชันแปลงข้อความ AI ให้สวยงาม (ไฮไลต์คำ, ใส่กรอบ, จัดบรรทัด)"):
        # Insert import
        out.append('import { formatAnalysisText, AvatarDisplay, calculateRelativeWeek } from "@/utils/dashboardHelpers";\n')
        
        # Skip until DashboardPage
        while i < len(lines) and not lines[i].startswith("export default function DashboardPage() {"):
            i += 1
        continue
    out.append(line)
    i += 1

with open(path, "w") as f:
    f.writelines(out)

print("Done")
