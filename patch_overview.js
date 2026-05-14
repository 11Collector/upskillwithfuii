const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '        {/* --- 🧭 1. Top Section --- */}\n        {(activeTab === "home" || activeTab === "overview") && (';
const endMarker = '            </div>\n\n          </div>\n        )}';

const startIndex = content.indexOf(startMarker);
if (startIndex !== -1) {
  const endIndex = content.indexOf(endMarker, startIndex);
  if (endIndex !== -1) {
    const chunkToReplace = content.substring(startIndex, endIndex + endMarker.length);
    const replacement = `        {/* --- 🧭 1. Top Section --- */}
        {(activeTab === "home" || activeTab === "overview") && (
          <DashboardOverviewTab
            user={user}
            isEditingName={isEditingName}
            newName={newName}
            setIsEditingName={setIsEditingName}
            setNewName={setNewName}
            handleUpdateName={handleUpdateName}
            handleLogout={handleLogout}
            currentLevel={currentLevel}
            currentLevelXP={currentLevelXP}
            showLevelInfo={showLevelInfo}
            setShowLevelInfo={setShowLevelInfo}
            getLevelTitle={getLevelTitle}
            totalXP={totalXP}
            handleGenderChange={handleGenderChange}
            gender={gender}
            setShowShareModal={setShowShareModal}
            streakCount={streakCount}
            perfectWeeks={perfectWeeks}
            lastDisc={lastDisc}
            lastMoney={lastMoney}
            lastLibrarySoul={lastLibrarySoul}
            totalWeeklyScore={totalWeeklyScore}
            rankInfo={rankInfo}
            relativeWeekInfo={relativeWeekInfo}
            weeklyData={weeklyData}
          />
        )}`;
    content = content.replace(chunkToReplace, replacement);
    fs.writeFileSync(file, content);
    console.log("Successfully replaced Overview Tab content");
  } else {
    console.log("End marker not found");
  }
} else {
  console.log("Start marker not found");
}
