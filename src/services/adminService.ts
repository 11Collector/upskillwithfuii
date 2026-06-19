import { db } from "@/lib/firebase";
import { collection, getDocs, getCountFromServer, query, collectionGroup, where, orderBy, limit } from "firebase/firestore";

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
}

export const fetchAdminStats = async (): Promise<AdminStats> => {
  try {
    // 1. Total Users
    const usersRef = collection(db, "users");
    const usersSnapshot = await getCountFromServer(usersRef);
    const totalUsers = usersSnapshot.data().count;

    // 2. We'll need to fetch user docs to see returning/active if we don't have specific queries
    // Cap ที่ 1000 docs — totalUsers ใช้ count query ด้านบนซึ่งแม่นเสมอ
    const usersQuery = await getDocs(query(usersRef, limit(1000)));
    let returningUsers = 0;
    let activeUsers = 0; // users who logged in recently or have activity

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const allUsersList: UserDetail[] = [];

    usersQuery.forEach((docSnap) => {
      const data = docSnap.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
      const lastLoginAt = data.lastLoginAt?.toDate ? data.lastLoginAt.toDate() : null;
      
      let isReturning = false;
      
      // Determine returning (used the app on a different day than creation)
      if (lastLoginAt) {
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

    // AI Mentor (This one is tricky, maybe count how many users have chatUsageDate or just totalXP)
    // We can count collectionGroup("chat_history") or similar, but let's check users' totalXP as a proxy or just see if there's a chat collection.
    // Let's assume there is a collection 'chatHistory' or we sum up dailyChatCount
    let aiMentorChats = 0;
    usersQuery.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.dailyChatCount) {
            aiMentorChats += data.dailyChatCount;
        }
    });

    // Let's try collectionGroup("chats") just in case
    try {
        const chatsRef = collectionGroup(db, "chats");
        const chatsCount = await getCountFromServer(chatsRef);
        if (chatsCount.data().count > aiMentorChats) {
            aiMentorChats = chatsCount.data().count;
        }
    } catch (e) {
        // ignore
    }

    // Ebook leads — newest first, max 200
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

    return {
      totalUsers,
      activeUsers,
      returningUsers,
      topUsers,
      allUsers: allUsersList,
      ebookLeads,
      toolUsages: {
        disc: discCount.data().count,
        moneyAvatar: moneyCount.data().count,
        wheelOfLife: wheelCount.data().count,
        aiMentorChats,
        libraryReads: libraryCount.data().count,
      }
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};
