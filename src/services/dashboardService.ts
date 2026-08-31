import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc, DocumentData, QuerySnapshot, DocumentSnapshot } from "firebase/firestore";
import { calculateRelativeWeek, parseJoinDate } from "@/utils/dashboardHelpers";

export const fetchDashboardData = async (uid: string, email: string | null, displayName?: string | null) => {
  try {
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
      const adminEmails = Array.from(new Set(["emotion.tuii@gmail.com", "upskillwithfuii@gmail.com", ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").toLowerCase().split(",")].filter(Boolean)));
      let totalQuota = (email && adminEmails.includes(email.toLowerCase()) || level > 10) ? Infinity : level;
      chatQuota = { used: usedToday, total: totalQuota };

      joinDate = parseJoinDate(userData);

      // If user document didn't have any createdAt field stored yet
      if (!userData.createdAt && !userData.created_at && !userData.joinDate) {
        await setDoc(doc(db, "users", uid), { createdAt: joinDate }, { merge: true }).catch(() => {});
      }

      // backfill email/displayName ถ้ายังไม่มีใน doc
      const needsUpdate: Record<string, string> = {};
      if (email && !userData.email) needsUpdate.email = email;
      if (displayName && !userData.displayName) needsUpdate.displayName = displayName;
      if (Object.keys(needsUpdate).length > 0) {
        await setDoc(doc(db, "users", uid), needsUpdate, { merge: true }).catch(() => {});
      }

    // 🔥 Auto-assign sequential memberNumber if they are PRO but do not have a memberNumber yet
    const subscriptionStatus = userData.subscriptionStatus || userData.subscription_status || "";
    const subscriptionTier = userData.subscriptionTier || userData.subscription_tier || "";
    const isPro =
      userData.role === "premium" ||
      subscriptionTier === "pro" ||
      ["active", "trialing"].includes(subscriptionStatus) ||
      Boolean(userData.isLifetimeMember) ||
      Boolean(userData.isFoundingMember);

    if (isPro && (userData.memberNumber === undefined || userData.memberNumber === null)) {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("memberNumber", "desc"), limit(1));
        const highestSnap = await getDocs(q);
        let highest = 0;
        if (!highestSnap.empty) {
          highest = highestSnap.docs[0].data().memberNumber || 0;
        }
        const nextNumber = highest + 1;
        
        const plan = userData.subscriptionPlan || "";
        const shouldBeFounder =
          plan.startsWith("founding") ||
          plan === "yearly" ||
          plan === "lifetime" ||
          Boolean(userData.isLifetimeMember) ||
          Boolean(userData.isFoundingMember);

        // Save to Firestore
        await setDoc(doc(db, "users", uid), { 
          memberNumber: nextNumber,
          isFoundingMember: shouldBeFounder
        }, { merge: true });
        
        // Update local object in-memory
        userData.memberNumber = nextNumber;
        userData.isFoundingMember = shouldBeFounder;
      } catch (err) {
        console.error("Error auto-assigning memberNumber:", err);
      }
    }
  } else {
    await setDoc(doc(db, "users", uid), {
      createdAt: joinDate,
      ...(email ? { email } : {}),
      ...(displayName ? { displayName } : {}),
    }, { merge: true });
  }

  // 💡 1. ดึงข้อมูล Assessments เพื่อนำมาตรวจสอบและคำนวณวันเริ่มต้นอย่างถูกต้อง
  const authWheelRef = collection(db, "users", uid, "assessments");

  const emptyQuery = { empty: true, docs: [] } as unknown as QuerySnapshot<DocumentData>;
  const emptyDoc = { exists: () => false, data: () => undefined } as unknown as DocumentSnapshot<DocumentData>;

  let authWheelSnap: QuerySnapshot<DocumentData> = emptyQuery;
  let discSnap: QuerySnapshot<DocumentData> = emptyQuery;
  let moneySnap: QuerySnapshot<DocumentData> = emptyQuery;
  let librarySoulSnap: QuerySnapshot<DocumentData> = emptyQuery;
  let quoteSnap: QuerySnapshot<DocumentData> = emptyQuery;

  try {
    const results = await Promise.all([
      getDocs(query(authWheelRef, orderBy("createdAt", "desc"), limit(5))),
      getDocs(query(collection(db, "discResults"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(1))),
      getDocs(query(collection(db, "quiz_results"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(1))),
      getDocs(query(collection(db, "users", uid, "library_souls"), orderBy("createdAt", "desc"), limit(1))),
      getDocs(query(collection(db, "quotes"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(1))),
    ]);
    
    authWheelSnap = results[0];
    discSnap = results[1];
    moneySnap = results[2];
    librarySoulSnap = results[3];
    quoteSnap = results[4];
  } catch (error) {
    console.error("Error fetching assessment collections:", error);
  }

  // 💡 ตรวจสอบวันเริ่มกิจกรรมแรกสุด (Earliest Activity) เพื่อป้องกันปัญหา User เก่าแต่ createdAt เพิ่งถูกสร้าง
  let earliestActivityDate: Date | null = null;
  const checkDocDate = (docSnap: any) => {
    if (!docSnap) return;
    const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
    if (!data) return;
    const d = parseJoinDate(data);
    if (d && !isNaN(d.getTime())) {
      if (!earliestActivityDate || d.getTime() < earliestActivityDate.getTime()) {
        earliestActivityDate = d;
      }
    }
  };

  if (!authWheelSnap.empty) authWheelSnap.docs.forEach(checkDocDate);
  if (!discSnap.empty) discSnap.docs.forEach(checkDocDate);
  if (!moneySnap.empty) moneySnap.docs.forEach(checkDocDate);
  if (!librarySoulSnap.empty) librarySoulSnap.docs.forEach(checkDocDate);
  if (!quoteSnap.empty) quoteSnap.docs.forEach(checkDocDate);

  if (earliestActivityDate && earliestActivityDate.getTime() < joinDate.getTime()) {
    joinDate = earliestActivityDate;
    await setDoc(doc(db, "users", uid), { createdAt: joinDate }, { merge: true }).catch(() => {});
  }

  // คำนวณสัปดาห์ปัจจุบัน และ สัปดาห์ก่อนหน้า แบบ Relative ตาม joinDate ที่แท้จริง
  const currentWeekInfo = calculateRelativeWeek(joinDate);
  const prevWeekTargetDate = new Date();
  prevWeekTargetDate.setDate(prevWeekTargetDate.getDate() - 7);
  const prevWeekInfo = calculateRelativeWeek(joinDate, prevWeekTargetDate);

  const prevPrevWeekTargetDate = new Date();
  prevPrevWeekTargetDate.setDate(prevPrevWeekTargetDate.getDate() - 14);
  const prevPrevWeekInfo = calculateRelativeWeek(joinDate, prevPrevWeekTargetDate);

  // 💡 2. ดึงข้อมูล Weekly Stats ตาม Week ID ที่ถูกต้อง
  let thisWeekSnap: DocumentSnapshot<DocumentData> = emptyDoc;
  let prevWeekSnap: DocumentSnapshot<DocumentData> = emptyDoc;
  let prevPrevWeekSnap: DocumentSnapshot<DocumentData> = emptyDoc;

  try {
    const statsResults = await Promise.all([
      getDoc(doc(db, "users", uid, "weekly_stats", currentWeekInfo.id)),
      getDoc(doc(db, "users", uid, "weekly_stats", prevWeekInfo.id)),
      getDoc(doc(db, "users", uid, "weekly_stats", prevPrevWeekInfo.id))
    ]);
    thisWeekSnap = statsResults[0];
    prevWeekSnap = statsResults[1];
    prevPrevWeekSnap = statsResults[2];
  } catch (error) {
    console.error("Error fetching weekly_stats sub-collections, falling back to empty data:", error);
  }

  // --- จัดการข้อมูลแบบประเมิน ---
  let wheelData = null;
  if (!authWheelSnap.empty) {
    const latestDoc = authWheelSnap.docs.find((doc) => doc.data().analysis !== "") || authWheelSnap.docs[0];
    wheelData = {
      ...latestDoc.data(),
      id: latestDoc.id
    };
  }

  let discData = null;
  if (!discSnap.empty) {
    discData = discSnap.docs[0].data();
  } else if (userDocSnap.exists() && userDocSnap.data().lastDisc) {
    discData = userDocSnap.data().lastDisc;
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
  } catch (err: any) {
    console.error("Firebase quota exceeded or error fetching dashboard data:", err);
    const joinDate = new Date();
    return {
      userData: null,
      joinDate,
      chatQuota: { used: 0, total: Infinity },
      currentWeekInfo: calculateRelativeWeek(joinDate),
      prevWeekInfo: calculateRelativeWeek(joinDate),
      wheelData: null,
      discData: null,
      moneyData: null,
      librarySoulData: null,
      ghostResultData: null,
      quoteData: null,
      hasSoulGuide: false,
      thisWeekData: null,
      prevWeekData: null,
      prevPrevWeekData: null,
      isQuotaExceeded: err?.code === 'resource-exhausted'
    };
  }
};
