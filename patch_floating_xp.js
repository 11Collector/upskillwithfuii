const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert imports at line 18
const importLine = `import { FloatingPremiumXP, QuestItem } from "./_components/DashboardUI";\n`;
if (!content.includes('FloatingPremiumXP')) {
  content = content.replace('export default function DashboardPage() {', importLine + 'export default function DashboardPage() {');
}

// Replace FloatingPremiumXP
const startMarker1 = '      {/* 🚀 Floating Premium Circular XP */}';
const endMarker1 = '      </AnimatePresence>';

let startIndex = content.indexOf(startMarker1);
if (startIndex !== -1) {
  let endIndex = content.indexOf(endMarker1, startIndex);
  if (endIndex !== -1) {
    const chunkToReplace = content.substring(startIndex, endIndex + endMarker1.length);
    const replacement1 = `      {/* 🚀 Floating Premium Circular XP */}
      <FloatingPremiumXP
        isScrolled={isScrolled}
        showFloatingXP={showFloatingXP}
        setShowFloatingXP={setShowFloatingXP}
        currentLevel={currentLevel}
        currentLevelXP={currentLevelXP}
      />`;
    content = content.replace(chunkToReplace, replacement1);
  }
}

// Replace QuestItem
// The quest map starts at {dailyQuests.map((quest) => {
// We need to replace the entire block up to the ending });
const startMarker2 = '              {dailyQuests.map((quest) => {';
startIndex = content.indexOf(startMarker2);
if (startIndex !== -1) {
  // Find the matching }); for this map
  // We can just use a regex or manual scan.
  // The map ends exactly before: 
  //             </div>
  // 
  //             {/* --- 🎮 3. หมวดหมู่ย่อย (Sub-Quests) --- */}
  let chunkToEnd = content.substring(startIndex);
  let endIdx = chunkToEnd.indexOf('              {/* --- 🎮 3. หมวดหมู่ย่อย (Sub-Quests) --- */}');
  
  if (endIdx !== -1) {
    // Look backwards from endIdx for the `            </div>`
    let divIdx = chunkToEnd.lastIndexOf('            </div>\n', endIdx);
    
    if (divIdx !== -1) {
      let chunkToReplace2 = chunkToEnd.substring(0, divIdx);
      const replacement2 = `              {dailyQuests.map((quest) => (
                <QuestItem
                  key={quest.id}
                  quest={quest}
                  isDone={completedQuests.includes(quest.id)}
                  toggleQuest={toggleQuest}
                  setShowWheelRulesModal={setShowWheelRulesModal}
                />
              ))}
`;
      content = content.replace(chunkToReplace2, replacement2);
    }
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done');
