import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc, DocumentData, QuerySnapshot, DocumentSnapshot } from "firebase/firestore";
import { calculateRelativeWeek } from "@/utils/dashboardHelpers";

export const fetchDashboardData = async (uid: string, email: string | null, displayName?: string | null) => {
  // 1. ดึงข้อมูล User Profile ก่อนเป็นอันดับแรก (สำคัญสุด)
  const userDocSnap = await getDoc(doc(db, "users", uid));
  let joinDate = new Date();
  let chatQuota = { used: 0, total: 0 };
  let userData = null;

  if (userDocSnap.exists()) {
    userData = userDocSnap.data();

    // 🔥 Calculate AI Mentor Quota
    const level = Math.floor((userData.totalXP || 0) / 100) + 1;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    let usedToday = userData.chatUsageDate === today ? (userData.dailyChatCount || 0) : 0;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",")[0];
    let totalQuota = (adminEmail && email === adminEmail || level > 10) ? Infinity : level;
    chatQuota = { used: usedToday, total: totalQuota };

    if (userData.createdAt) {
      joinDate = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
    } else {
      await setDoc(doc(db, "users", uid), { createdAt: joinDate }, { merge: true });
    }
    // backfill email/displayName ถ้ายังไม่มีใน doc
    const needsUpdate: Record<string, string> = {};
    if (email && !userData.email) needsUpdate.email = email;
    if (displayName && !userData.displayName) needsUpdate.displayName = displayName;
    if (Object.keys(needsUpdate).length > 0) {
      await setDoc(doc(db, "users", uid), needsUpdate, { merge: true });
    }
  } else {
    await setDoc(doc(db, "users", uid), {
      createdAt: joinDate,
      ...(email ? { email } : {}),
      ...(displayName ? { displayName } : {}),
    }, { merge: true });
  }

  // คำนวณสัปดาห์ปัจจุบัน และ สัปดาห์ก่อนหน้า แบบ Relative
  const currentWeekInfo = calculateRelativeWeek(joinDate);
  const prevWeekTargetDate = new Date();
  prevWeekTargetDate.setDate(prevWeekTargetDate.getDate() - 7);
  const prevWeekInfo = calculateRelativeWeek(joinDate, prevWeekTargetDate);

  const prevPrevWeekTargetDate = new Date();
  prevPrevWeekTargetDate.setDate(prevPrevWeekTargetDate.getDate() - 14);
  const prevPrevWeekInfo = calculateRelativeWeek(joinDate, prevPrevWeekTargetDate);

  // 💡 2. ดึงข้อมูล Assessments และ Weekly Stats อย่างปลอดภัย
  const authWheelRef = collection(db, "users", uid, "assessments");

  const emptyQuery = { empty: true, docs: [] } as unknown as QuerySnapshot<DocumentData>;
  const emptyDoc = { exists: () => false, data: () => undefined } as unknown as DocumentSnapshot<DocumentData>;

  let authWheelSnap: QuerySnapshot<DocumentData> = emptyQuery;
  let discSnap: QuerySnapshot<DocumentData> = emptyQuery;
  let moneySnap: QuerySnapshot<DocumentData> = emptyQuery;
  let librarySoulSnap: QuerySnapshot<DocumentData> = emptyQuery;
  let quoteSnap: QuerySnapshot<DocumentData> = emptyQuery;
  let thisWeekSnap: DocumentSnapshot<DocumentData> = emptyDoc;
  let prevWeekSnap: DocumentSnapshot<DocumentData> = emptyDoc;
  let prevPrevWeekSnap: DocumentSnapshot<DocumentData> = emptyDoc;

  try {
    const results = await Promise.all([
      getDocs(query(authWheelRef, orderBy("createdAt", "desc"), limit(5))),
      getDocs(query(collection(db, "discResults"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(1))),
      getDocs(query(collection(db, "quiz_results"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(1))),
      getDocs(query(collection(db, "users", uid, "library_souls"), orderBy("createdAt", "desc"), limit(1))),
      getDocs(query(collection(db, "quotes"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(1))),
      getDoc(doc(db, "users", uid, "weekly_stats", currentWeekInfo.id)),
      getDoc(doc(db, "users", uid, "weekly_stats", prevWeekInfo.id)),
      getDoc(doc(db, "users", uid, "weekly_stats", prevPrevWeekInfo.id))
    ]);
    
    authWheelSnap = results[0];
    discSnap = results[1];
    moneySnap = results[2];
    librarySoulSnap = results[3];
    quoteSnap = results[4];
    thisWeekSnap = results[5];
    prevWeekSnap = results[6];
    prevPrevWeekSnap = results[7];
  } catch (error) {
    console.error("Error fetching sub-collections, falling back to empty data:", error);
  }

  // --- จัดการข้อมูลแบบประเมิน ---
  let wheelData = null;
  if (!authWheelSnap.empty) {
    const latestWithAnalysis = authWheelSnap.docs.find((doc) => doc.data().analysis !== "");
    wheelData = latestWithAnalysis ? latestWithAnalysis.data() : authWheelSnap.docs[0].data();
  }

  let discData = null;
  if (!discSnap.empty) {
    discData = discSnap.docs[0].data();
  }

  let moneyData = null;
  if (!moneySnap.empty) {
    moneyData = moneySnap.docs[0].data();
  }

  let librarySoulData = null;
  if (!librarySoulSnap.empty) {
    librarySoulData = librarySoulSnap.docs[0].data();
  } else if (userDocSnap.exists() && userDocSnap.data().lastLibrarySoul) {
    librarySoulData = { type: userDocSnap.data().lastLibrarySoul };
  }

  let quoteData = null;
  if (!quoteSnap.empty) {
    quoteData = quoteSnap.docs[0].data();
  }

  // Ghost in You — เก็บไว้ใน users/{uid}.lastGhostResult + lastGhostResultFull
  const _ghostFull = userDocSnap.exists() ? (userDocSnap.data() as any).lastGhostResultFull : null;
  const _ghostPrimary = userDocSnap.exists() ? (userDocSnap.data() as any).lastGhostResult : null;
  const ghostResultData = _ghostPrimary
    ? { primary: _ghostPrimary, secondary: _ghostFull?.secondary ?? null }
    : null;

  // --- จัดการข้อมูลสถิติรายสัปดาห์ ---
  let thisWeekData = null;
  let prevWeekData = null;
  let prevPrevWeekData = null;

  if (thisWeekSnap.exists()) {
    thisWeekData = thisWeekSnap.data();
  }
  if (prevWeekSnap.exists()) {
    prevWeekData = prevWeekSnap.data();
  }
  if (prevPrevWeekSnap.exists()) {
    prevPrevWeekData = prevPrevWeekSnap.data();
  }

  return {
    userData,
    joinDate,
    chatQuota,
    currentWeekInfo,
    prevWeekInfo,
    wheelData,
    discData,
    moneyData,
    librarySoulData,
    ghostResultData,
    quoteData,
    hasSoulGuide: !!(userData?.hasSoulGuide),
    thisWeekData,
    prevWeekData,
    prevPrevWeekData
  };
};
