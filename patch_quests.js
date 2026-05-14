const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '        {/* --- 🎮 2. Daily Quests Section --- */}\n        {(activeTab === "home" || activeTab === "quests") && (\n          <div className="mb-8 bg-white border border-slate-100 hover:border-orange-100 rounded-[2.5rem] p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.08)] relative overflow-hidden group transition-all duration-500">';
const endMarker = '          </div>\n        )}';

const startIndex = content.indexOf(startMarker);
if (startIndex !== -1) {
  // We want to replace everything between startMarker and the NEXT endMarker
  const endIndex = content.indexOf(endMarker, startIndex);
  if (endIndex !== -1) {
    const chunkToReplace = content.substring(startIndex, endIndex + endMarker.length);
    const replacement = `        {/* --- 🎮 2. Daily Quests Section --- */}
        {(activeTab === "home" || activeTab === "quests") && (
          <DashboardQuestsTab
            handleOpenRerollConfirm={handleOpenRerollConfirm}
            isToggling={isToggling}
            dailyXPGained={dailyXPGained}
            completedQuests={completedQuests}
            dailyQuests={dailyQuests}
            toggleQuest={toggleQuest}
            currentLevel={currentLevel}
            customQuestTitle={customQuestTitle}
            setShowCustomInputModal={setShowCustomInputModal}
            missingAssessments={missingAssessments}
            setShowWheelRulesModal={setShowWheelRulesModal}
          />
        )}`;
    content = content.replace(chunkToReplace, replacement);
    fs.writeFileSync(file, content);
    console.log("Successfully replaced Quests Tab content");
  } else {
    console.log("End marker not found");
  }
} else {
  console.log("Start marker not found");
}
