export const isBrainLibraryUnlocked = (userData: any, phaseData?: {
  wheelData?: any;
  discData?: any;
  moneyData?: any;
  librarySoulData?: any;
  quoteData?: any;
  ghostResultData?: any;
}) => {
  if (!userData) return false;

  // Fast-track if already in Phase 2/3 or beyond
  if (
    !!userData.enteredRealLife ||
    !!userData.hasLibrarySoulXP ||
    !!userData.lastLibrarySoul ||
    !!phaseData?.librarySoulData ||
    !!userData.lastGhostResult ||
    !!userData.hasCompletedFocusRoom ||
    !!userData.hasChattedWithFuii ||
    (Array.isArray(userData.redeemedHistory) && userData.redeemedHistory.length > 0)
  ) {
    return true;
  }

  const hasWheel =
    !!phaseData?.wheelData ||
    !!userData.hasWheelXP ||
    !!userData.lastWheel ||
    !!userData.lastWheelDate ||
    !!userData.wheelGoal;

  const hasDisc =
    !!phaseData?.discData ||
    !!userData.hasDiscXP ||
    !!userData.lastDisc ||
    !!userData.lastDiscResult ||
    !!userData.discResult ||
    !!userData.discType;

  const hasMoney =
    !!phaseData?.moneyData ||
    !!userData.hasMoneyXP ||
    !!userData.lastMoney ||
    !!userData.lastMoneyResult ||
    !!userData.moneyResult ||
    !!userData.moneyType;

  const hasQuote =
    !!phaseData?.quoteData ||
    !!userData.hasQuoteXP ||
    !!userData.lastQuote ||
    !!userData.lastQuoteDate ||
    !!userData.lastQuoteTime;

  const hasCompletedPhase1Quests =
    !!userData.hasCompletedPhase1Quests ||
    (Array.isArray(userData.completedQuestIds) && userData.completedQuestIds.length >= 2) ||
    (Array.isArray(userData.completedQuests) && userData.completedQuests.length >= 2) ||
    (typeof userData.totalXP === "number" && userData.totalXP >= 200 && hasWheel && hasDisc);

  const hasCompletedPhase1 = hasWheel && hasDisc && hasMoney && hasQuote && hasCompletedPhase1Quests;

  return hasCompletedPhase1;
};
