import { db } from "@/lib/firebase";
import { collection, getDocs, getCountFromServer, query, collectionGroup, where, orderBy, limit, getDoc, doc } from "firebase/firestore";

export interface UserDetail {
  id: string;
  name?: string;
  email?: string;
  totalXP: number;
  createdAt: string;
  createdAtTs: number;
  lastLoginAt: string;
  isReturning: boolean;
}

export interface EbookLead {
  id: string;
  email: string;
  createdAt: string;
  createdAtTs: number;
}

export interface QuestCompletionTrend {
  date: string;
  count: number;
}

export interface LevelDistribution {
  range: string;
  count: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  returningUsers: number;
  topUsers: UserDetail[];
  allUsers: UserDetail[];
  ebookLeads: EbookLead[];
  toolUsages: {
    disc: number;
    moneyAvatar: number;
    wheelOfLife: number;
    aiMentorChats: number;
    libraryReads: number;
  };
  dau: number;
  mau: number;
  questCompletionsTrend: QuestCompletionTrend[];
  aiFeatureCalls: {
    ai_mentor: number;
    book_match: number;
    quote_generation: number;
  };
  levelDistribution: LevelDistribution[];
  discDistribution: Record<string, number>;
  moneyDistribution: Record<string, number>;
  ghostDistribution: Record<string, number>;
  libraryDistribution: Record<string, number>;
  wheelAverages: number[];
  wheelFocusDistribution: number[];
  wheelTotalDocs: number;
}

export const fetchAdminStats = async (): Promise<AdminStats> => {
  try {
    // 1. Total Users
    const usersRef = collection(db, "users");
    const usersSnapshot = await getCountFromServer(usersRef);
    const totalUsers = usersSnapshot.data().count;

    // 2. We'll need to fetch user docs to see returning/active if we don't have specific queries
    // Cap at 1000 docs - totalUsers uses count query which is always accurate
    const usersQuery = await getDocs(query(usersRef, limit(1000)));
    let returningUsers = 0;
    let activeUsers = 0; // users who logged in recently or have activity

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const allUsersList: UserDetail[] = [];
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const thirtyDaysMs = 30 * oneDayMs;

    let dau = 0;
    let mau = 0;

    usersQuery.forEach((docSnap) => {
      const data = docSnap.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
      const lastLoginAt = data.lastLoginAt?.toDate ? data.lastLoginAt.toDate() : null;
      
      let isReturning = false;
      
      // Determine returning (used the app on a different day than creation)
      if (lastLoginAt) {
        const lastLoginTime = lastLoginAt.getTime();
        const createDay = createdAt.toLocaleDateString();
        const loginDay = lastLoginAt.toLocaleDateString();
        
        if (createDay !== loginDay) {
          isReturning = true;
          returningUsers++;
        }
        
        // Active in last 7 days
        if (lastLoginAt > oneWeekAgo) {
          activeUsers++;
        }

        // DAU: active in last 24h
        if (now - lastLoginTime <= oneDayMs) {
          dau++;
        }

        // MAU: active in last 30 days
        if (now - lastLoginTime <= thirtyDaysMs) {
          mau++;
        }
      } else if (data.totalXP > 0) {
        // Fallback for older users
        isReturning = true;
        returningUsers++;
      }

      allUsersList.push({
        id: docSnap.id,
        name: data.displayName || data.name || "ไม่ระบุชื่อ",
        email: data.email || "-",
        totalXP: data.totalXP || 0,
        createdAt: createdAt.toLocaleDateString('th-TH'),
        createdAtTs: createdAt.getTime(),
        lastLoginAt: lastLoginAt ? lastLoginAt.toLocaleDateString('th-TH') : "ไม่ระบุ",
        isReturning
      });
    });

    const topUsers = [...allUsersList].sort((a, b) => b.totalXP - a.totalXP).slice(0, 50);

    // 3. Tool usages using count queries
    
    // DISC
    const discRef = collection(db, "discResults");
    const discCount = await getCountFromServer(discRef);
    
    // Money Avatar
    const moneyRef = collection(db, "quiz_results");
    const moneyCount = await getCountFromServer(moneyRef);

    // Wheel of Life (Subcollection 'assessments' inside users)
    const wheelRef = collectionGroup(db, "assessments");
    const wheelCount = await getCountFromServer(wheelRef);

    // Library of Souls reads
    const libraryRef = collectionGroup(db, "library_souls");
    const libraryCount = await getCountFromServer(libraryRef);

    // AI Feature Calls (Baseline from historical data + new logs in 'ai_calls')
    const chatHistoryCount = await getCountFromServer(collectionGroup(db, "chat_history"));
    const quotesCount = await getCountFromServer(collection(db, "quotes"));
    const bookPlaylistCount = await getCountFromServer(collectionGroup(db, "book_playlist"));

    const aiCallsSnap = await getDocs(collection(db, "ai_calls"));
    const aiFeatureCalls = {
      ai_mentor: Math.ceil(chatHistoryCount.data().count / 2),
      book_match: bookPlaylistCount.data().count,
      quote_generation: quotesCount.data().count,
    };
    
    aiCallsSnap.forEach(docSnap => {
      const data = docSnap.data();
      const feature = data.feature as keyof typeof aiFeatureCalls;
      if (aiFeatureCalls[feature] !== undefined) {
        aiFeatureCalls[feature]++;
      }
    });

    const aiMentorChats = aiFeatureCalls.ai_mentor;

    // 4. Ebook leads — newest first, max 200
    const ebookSnap = await getDocs(
      query(collection(db, "ebook_leads"), orderBy("createdAt", "desc"), limit(200))
    );
    const ebookLeads: EbookLead[] = ebookSnap.docs.map(d => {
      const data = d.data();
      const ts = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
      return {
        id: d.id,
        email: data.email || "-",
        createdAt: ts.toLocaleDateString('th-TH'),
        createdAtTs: ts.getTime(),
      };
    });

    // 5. Level Distribution
    const levelBrackets: Record<string, number> = {
      "Lv. 1": 0,
      "Lv. 2-5": 0,
      "Lv. 6-10": 0,
      "Lv. 11-20": 0,
      "Lv. 21+": 0
    };
    allUsersList.forEach(u => {
      const level = Math.floor(u.totalXP / 100) + 1;
      if (level === 1) levelBrackets["Lv. 1"]++;
      else if (level <= 5) levelBrackets["Lv. 2-5"]++;
      else if (level <= 10) levelBrackets["Lv. 6-10"]++;
      else if (level <= 20) levelBrackets["Lv. 11-20"]++;
      else levelBrackets["Lv. 21+"]++;
    });
    const levelDistribution = Object.entries(levelBrackets).map(([range, count]) => ({
      range,
      count
    }));

    // 6. Quest completions trend (last 7 days)
    const questLogRef = collectionGroup(db, "quest_log");
    const questLogSnap = await getDocs(questLogRef);
    const completionsByDate: Record<string, number> = {};
    const last7Days: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
      last7Days.push(dateStr);
      completionsByDate[dateStr] = 0;
    }
    
    questLogSnap.forEach(docSnap => {
      const data = docSnap.data();
      const completedAt = data.completedAt;
      if (completedAt && completionsByDate[completedAt] !== undefined) {
        completionsByDate[completedAt]++;
      }
    });
    const questCompletionsTrend = last7Days.map(date => ({
      date,
      count: completionsByDate[date]
    }));

    // aiFeatureCalls is already calculated above

    // 8. Aggregating distributions for individual apps/assessments
    // DISC Distribution (with baseline stats from old project: 126,497 docs)
    const discSnap = await getDocs(collection(db, "discResults"));
    const discDistribution: Record<string, number> = { D: 31925, I: 10072, S: 43989, C: 40511 };
    discSnap.forEach(docSnap => {
      const data = docSnap.data();
      const res = (data.result || data.finalResult || "").trim().toUpperCase();
      if (res && ["D", "I", "S", "C"].includes(res)) {
        discDistribution[res]++;
      }
    });

    // Money Avatar Distribution (with baseline stats from old project: 374 docs)
    const moneySnap = await getDocs(collection(db, "quiz_results"));
    const moneyDistribution: Record<string, number> = {
      HIGH_RISK_HIGH_DISC: 2,
      MID_RISK_HIGH_DISC: 206,
      LOW_RISK_HIGH_DISC: 22,
      HIGH_RISK_MID_DISC: 2,
      MID_RISK_MID_DISC: 111,
      LOW_RISK_MID_DISC: 31,
      HIGH_RISK_LOW_DISC: 0,
      MID_RISK_LOW_DISC: 0,
      LOW_RISK_LOW_DISC: 0
    };
    moneySnap.forEach(docSnap => {
      const data = docSnap.data();
      const res = data.resultKey;
      if (res) {
        moneyDistribution[res] = (moneyDistribution[res] || 0) + 1;
      }
    });

    // Ghost in You Distribution
    let ghostDistribution: Record<string, number> = {};
    try {
      const ghostSnap = await getDoc(doc(db, "stats", "ghost_results"));
      if (ghostSnap.exists()) {
        ghostDistribution = ghostSnap.data() as Record<string, number>;
      }
    } catch (e) {
      console.error("Error reading ghost stats:", e);
    }

    // Wheel of Life aggregation (Members + Guests)
    const wheelSnap = await getDocs(collectionGroup(db, "assessments"));
    const guestSnap = await getDocs(query(collection(db, "user_reports"), where("type", "==", "wheel_of_life")));

    // Baseline stats from old project (6,738 documents)
    let wheelTotalDocs = 6738;
    const wheelAverages = [36276, 28345, 32205, 42404, 40511, 36222, 36679, 32921];
    const wheelFocusDistribution = [3453, 5231, 3530, 927, 318, 3435, 1544, 105];

    const processWheelDoc = (docSnap: any) => {
      const data = docSnap.data();
      if (data.type === 'wheel_of_life') {
        wheelTotalDocs++;
        
        // currentScores
        if (data.currentScores && Array.isArray(data.currentScores)) {
          for (let i = 0; i < 8; i++) {
            const val = Number(data.currentScores[i]) || 0;
            wheelAverages[i] += val;
          }
        }

        // selectedFocusAreas
        if (data.selectedFocusAreas && Array.isArray(data.selectedFocusAreas)) {
          data.selectedFocusAreas.forEach((areaIndex: any) => {
            const idx = Number(areaIndex);
            if (idx >= 0 && idx < 8) {
              wheelFocusDistribution[idx]++;
            }
          });
        }
      }
    };

    wheelSnap.forEach(processWheelDoc);
    guestSnap.forEach(processWheelDoc);

    // Compute averages
    if (wheelTotalDocs > 0) {
      for (let i = 0; i < 8; i++) {
        wheelAverages[i] = Number((wheelAverages[i] / wheelTotalDocs).toFixed(2));
      }
    }

    // Library of Souls aggregation
    const librarySnap = await getDocs(collectionGroup(db, "library_souls"));
    const libraryDistribution: Record<string, number> = {};
    librarySnap.forEach(docSnap => {
      const data = docSnap.data();
      const res = data.type;
      if (res) {
        libraryDistribution[res] = (libraryDistribution[res] || 0) + 1;
      }
    });

    return {
      totalUsers,
      activeUsers,
      returningUsers,
      topUsers,
      allUsers: allUsersList,
      ebookLeads,
      toolUsages: {
        disc: discCount.data().count + 126497,
        moneyAvatar: moneyCount.data().count + 374,
        wheelOfLife: wheelTotalDocs,
        aiMentorChats,
        libraryReads: librarySnap.size,
      },
      dau,
      mau,
      questCompletionsTrend,
      aiFeatureCalls,
      levelDistribution,
      discDistribution,
      moneyDistribution,
      ghostDistribution,
      libraryDistribution,
      wheelAverages,
      wheelFocusDistribution,
      wheelTotalDocs,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};
