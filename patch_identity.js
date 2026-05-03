const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '            {(activeTab === "home" || activeTab === "identity") && (\n              <>\n                {/* 🌟 1. Wheel of Life */}';
const endMarker = '                </Link>\n              </>\n            )}';

const startIndex = content.indexOf(startMarker);
if (startIndex !== -1) {
  const endIndex = content.indexOf(endMarker, startIndex);
  if (endIndex !== -1) {
    const chunkToReplace = content.substring(startIndex, endIndex + endMarker.length);
    const replacement = `            {(activeTab === "home" || activeTab === "identity") && (
              <DashboardIdentityTab
                lastQuote={lastQuote}
                hasClaimedQuoteToday={hasClaimedQuoteToday}
                quoteText={quoteText}
                getQuoteFontSize={getQuoteFontSize}
                openInfo={openInfo}
                lastDisc={lastDisc}
                discMainChar={discMainChar}
                discColors={discColors}
                openDiscInfo={openDiscInfo}
                lastMoney={lastMoney}
                moneyAvatar={moneyAvatar}
                moneyBg={moneyBg}
                moneyBorder={moneyBorder}
                moneyTitle={moneyTitle}
                openMoneyInfo={openMoneyInfo}
                lastWheel={lastWheel}
                wheelPlanDay={wheelPlanDay}
                hasDoneWheelToday={hasDoneWheelToday}
                isGoalExpanded={isGoalExpanded}
                setIsGoalExpanded={setIsGoalExpanded}
                handleRestartCycle={handleRestartCycle}
                lastLibrarySoul={lastLibrarySoul}
              />
            )}`;
    content = content.replace(chunkToReplace, replacement);
    fs.writeFileSync(file, content);
    console.log("Successfully replaced Identity Tab content");
  } else {
    console.log("End marker not found");
  }
} else {
  console.log("Start marker not found");
}
