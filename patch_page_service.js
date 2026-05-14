import fs from 'fs';

const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('fetchDashboardData')) {
    content = content.replace(
        'import { FloatingPremiumXP, QuestItem } from "./_components/DashboardUI";',
        'import { FloatingPremiumXP, QuestItem } from "./_components/DashboardUI";\nimport { fetchDashboardData } from "@/services/dashboardService";'
    );
}

const startMarker = '        try {\n          // 💡 1. เตรียม Week ID ก่อนดึงข้อมูล';
const endMarker = '          if (prevWeekSnap.exists()) {\n            const prevData = prevWeekSnap.data();\n            prevWeekTotal = (prevData.wheel || 0) + (prevData.disc || 0) + (prevData.money || 0) + (prevData.library || 0) + (prevData.wildcard || 0) + (prevData.challenge || 0);\n          }';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const chunkToReplace = content.substring(startIndex, endIndex + endMarker.length);
    const replacement = `        try {
          const data = await fetchDashboardData(currentUser.uid, currentUser.email);
          
          setChatQuota(data.chatQuota);
          setRelativeWeekInfo(data.currentWeekInfo);
          
          if (data.wheelData) setLastWheel(data.wheelData);
          if (data.discData) setLastDisc(data.discData);
          if (data.moneyData) setLastMoney(data.moneyData);
          if (data.librarySoulData) setLastLibrarySoul(data.librarySoulData);
          if (data.quoteData) setLastQuote(data.quoteData);
          
          let thisWeekTotal = 0;
          let prevWeekTotal = 0;
          
          if (data.thisWeekData) {
            setWeeklyData({
              wheel: Math.min(7, data.thisWeekData.wheel || 0),
              disc: Math.min(7, data.thisWeekData.disc || 0),
              money: Math.min(7, data.thisWeekData.money || 0),
              library: Math.min(7, data.thisWeekData.library || 0),
              wildcard: Math.min(7, data.thisWeekData.wildcard || 0),
              challenge: Math.min(7, data.thisWeekData.challenge || 0),
              momentum_count: data.thisWeekData.momentum_count || 0
            });
            thisWeekTotal = Math.min(42, (data.thisWeekData.wheel || 0) + (data.thisWeekData.disc || 0) + (data.thisWeekData.money || 0) + (data.thisWeekData.library || 0) + (data.thisWeekData.wildcard || 0) + (data.thisWeekData.challenge || 0));
          } else {
            setWeeklyData({ wheel: 0, disc: 0, money: 0, library: 0, wildcard: 0, challenge: 0, momentum_count: 0 });
          }
          
          if (data.prevWeekData) {
            prevWeekTotal = (data.prevWeekData.wheel || 0) + (data.prevWeekData.disc || 0) + (data.prevWeekData.money || 0) + (data.prevWeekData.library || 0) + (data.prevWeekData.wildcard || 0) + (data.prevWeekData.challenge || 0);
          }
          
          const currentWeekInfo = data.currentWeekInfo;
          const userData = data.userData;`;
          
    content = content.replace(chunkToReplace, replacement);
    
    // Now replace `if (userDocSnap.exists()) { const userData = userDocSnap.data();` with `if (userData) {`
    const userDocMarker = '          // --- 2. ดึง User Profile และเช็ก XP เก็บตก (First-Time XP) ---\n          if (userDocSnap.exists()) {\n            const userData = userDocSnap.data();';
    const userDocReplacement = '          // --- 2. ดึง User Profile และเช็ก XP เก็บตก (First-Time XP) ---\n          if (userData) {';
    content = content.replace(userDocMarker, userDocReplacement);
}

fs.writeFileSync(path, content, 'utf8');
console.log('done');
