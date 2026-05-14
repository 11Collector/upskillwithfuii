import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { calculateRelativeWeek } from "@/utils/dashboardHelpers";

export const fetchDashboardData = async (uid: string, email: string | null) => {
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
    let totalQuota = (email === 'emotion.tuii@gmail.com' || level > 10) ? Infinity : level;
    chatQuota = { used: usedToday, total: totalQuota };

    if (userData.createdAt) {
      joinDate = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
    } else {
      await setDoc(doc(db, "users", uid), { createdAt: joinDate }, { merge: true });
    }
  } else {
    await setDoc(doc(db, "users", uid), { createdAt: joinDate }, { merge: true });
  }

  // คำนวณสัปดาห์ปัจจุบัน และ สัปดาห์ก่อนหน้า แบบ Relative
  const currentWeekInfo = calculateRelativeWeek(joinDate);
  const prevWeekTargetDate = new Date();
  prevWeekTargetDate.setDate(prevWeekTargetDate.getDate() - 7);
  const prevWeekInfo = calculateRelativeWeek(joinDate, prevWeekTargetDate);

  // 💡 2. ดึงข้อมูล Assessments และ Weekly Stats อย่างปลอดภัย
  const authWheelRef = collection(db, "users", uid, "assessments");

  let authWheelSnap = { empty: true, docs: [] } as any;
  let discSnap = { empty: true, docs: [] } as any;
  let moneySnap = { empty: true, docs: [] } as any;
  let librarySoulSnap = { empty: true, docs: [] } as any;
  let quoteSnap = { empty: true, docs: [] } as any;
  let thisWeekSnap = { exists: () => false, data: () => null } as any;
  let prevWeekSnap = { exists: () => false, data: () => null } as any;

  try {
    const results = await Promise.all([
      getDocs(query(authWheelRef, orderBy("createdAt", "desc"), limit(5))),
      getDocs(query(collection(db, "discResults"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(1))),
      getDocs(query(collection(db, "quiz_results"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(1))),
      getDocs(query(collection(db, "users", uid, "library_souls"), orderBy("createdAt", "desc"), limit(1))),
      getDocs(query(collection(db, "quotes"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(1))),
      getDoc(doc(db, "users", uid, "weekly_stats", currentWeekInfo.id)),
      getDoc(doc(db, "users", uid, "weekly_stats", prevWeekInfo.id))
    ]);
    
    authWheelSnap = results[0];
    discSnap = results[1];
    moneySnap = results[2];
    librarySoulSnap = results[3];
    quoteSnap = results[4];
    thisWeekSnap = results[5];
    prevWeekSnap = results[6];
  } catch (error) {
    console.error("Error fetching sub-collections, falling back to empty data:", error);
  }

  // --- จัดการข้อมูลแบบประเมิน ---
  let wheelData = null;
  if (!authWheelSnap.empty) {
    const latestWithAnalysis = authWheelSnap.docs.find((doc: any) => doc.data().analysis !== "");
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

  // --- จัดการข้อมูลสถิติรายสัปดาห์ ---
  let thisWeekData = null;
  let prevWeekData = null;

  if (thisWeekSnap.exists()) {
    thisWeekData = thisWeekSnap.data();
  }
  if (prevWeekSnap.exists()) {
    prevWeekData = prevWeekSnap.data();
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
    quoteData,
    thisWeekData,
    prevWeekData
  };
};
