export const isBrainLibraryUnlocked = (userData: any, phaseData?: {
  wheelData?: any;
  discData?: any;
  moneyData?: any;
  librarySoulData?: any;
  quoteData?: any;
  ghostResultData?: any;
}) => {
  if (!userData) return false;

  const hasCompletedPhase1 =
    (
      !!phaseData?.wheelData &&
      !!phaseData?.discData &&
      !!phaseData?.moneyData &&
      !!phaseData?.librarySoulData
    ) || (
      !!userData.hasWheelXP &&
      !!userData.hasDiscXP &&
      !!userData.hasMoneyXP &&
      !!userData.hasLibrarySoulXP
    );

  const hasCompletedPhase1Quests =
    !!userData.hasCompletedPhase1Quests ||
    (Array.isArray(userData.completedQuestIds) && userData.completedQuestIds.length >= 2);

  const hasQuote = !!(phaseData?.quoteData || userData.lastQuoteDate || userData.lastQuote || userData.lastQuoteTime);
  const hasGhost = !!(phaseData?.ghostResultData || userData.lastGhostResult || userData.lastGhostResultFull);

  const hasCompletedPhase2 =
    hasCompletedPhase1 &&
    hasCompletedPhase1Quests &&
    hasQuote &&
    hasGhost &&
    !!(userData.redeemedHistory && userData.redeemedHistory.length > 0) &&
    !!(userData.hasChattedWithFuii || userData.lastChatTime || userData.lastChatDate);

  return hasCompletedPhase2;
};
