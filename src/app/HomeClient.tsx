"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { usePWAInstall } from "@/lib/pwa";

// Modular Home Components
import HeroSection from "@/components/home/HeroSection";
import ToolsGridSection from "@/components/home/ToolsGridSection";
import OnePercentSection from "@/components/home/OnePercentSection";
import JourneySection from "@/components/home/JourneySection";
import PitchSection from "@/components/home/PitchSection";
import Footer from "@/components/home/Footer";
import UpgradeModal, { ProPlan } from "@/components/home/UpgradeModal";
import StoryModal from "@/components/home/StoryModal";
import IOSInstallGuideModal from "@/components/home/IOSInstallGuideModal";
import VinylPlayer from "@/components/home/VinylPlayer";

// ==========================================
// Content (ภาษาไทย)
// ==========================================
const t = {
  authWelcome: "สวัสดี, คุณ",
  authSub: "พร้อมที่จะขยับขีดจำกัดของตัวเองในวันนี้หรือยัง?",
  dashboardBtn: "เข้าสู่ Personal Growth OS",
  logout: "Logout",
  pitchBeta: "YOUR PERSONAL GROWTH OS",
  pitchTitle1: "ระบบปฏิบัติการ",
  pitchTitle2: "พัฒนาชีวิตส่วนตัวของคุณ",
  pitchList: [
    "Identity OS — ถอดรหัสตัวตนและเป้าหมายชีวิต",
    "XP & Quests — เควสต์รายวัน อัปเลเวลตัวตน",
    "Upskill Brain — คลังสมองอ่านสรุปและจดบันทึก",
    "AI Mentor — ปรึกษา Mindset กับพี่ฟุ้ย 24 ชม.",
  ],
  loginGoogle: "เริ่มต้นใช้งาน",
  loginRemark: "สมัครฟรีใน 5 วินาที · ข้อมูลส่วนตัวปลอดภัย 100%",
  footer: "© 2026 อัพสกิลกับฟุ้ย",
  tools: {
    wheel: {
      name: "Wheel Of Life",
      desc: "เช็กสมดุลชีวิต 8 ด้าน พร้อม AI วางแผน 7 วัน",
      gimmick: "500K+ Views บน Social",
    },
    disc: {
      name: "Who Are You ?",
      desc: "ค้นหาตัวตนและการสื่อสารในที่ทำงานผ่าน DISC",
      gimmick: "ผู้ใช้งาน 120k+ คน",
    },
    money: {
      name: "Money Avatar",
      desc: "ถอดรหัสสไตล์การเงินของคุณ",
      gimmick: "วิเคราะห์เจาะลึกระดับ PRO",
    },
    quotes: {
      name: "คมสัดสัด",
      desc: "สร้างคำคมฮีลใจเฉพาะคุณ",
      gimmick: "Vibe ดี โดนใจ Gen Z",
    },
  },
};

export default function HomeClient() {
  const { deferredPrompt, isIOS, handleInstallClick } = usePWAInstall();
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isProLoaded, setIsProLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [onePercentDay, setOnePercentDay] = useState(365);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [billingPlan, setBillingPlan] = useState<ProPlan>("monthly");
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const inApp =
      /FBAN|FBAV|FB_IAB|Instagram|Threads|Line\/|MicroMessenger|BytedanceWebview|musical_ly|Twitter|Snapchat/i.test(
        ua
      );
    setIsInAppBrowser(inApp);
  }, []);

  useEffect(() => {
    document.body.classList.add("bg-polkadot-white");
    return () => {
      document.body.classList.remove("bg-polkadot-white");
    };
  }, []);

  const handleUpgrade = async (plan: ProPlan = billingPlan) => {
    if (!user) return alert("Please login first");

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        alert("เกิดข้อผิดพลาด: " + (data.error || "ไม่สามารถเปิดหน้าชำระเงินได้"));
      }
    } catch (err) {
      console.error(err);
      alert("ระบบชำระเงินขัดข้อง กรุณาลองใหม่อีกครั้ง");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsProLoaded(false);
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data() || {};
            const subscriptionStatus =
              data.subscriptionStatus || data.subscription_status || "";
            const subscriptionTier =
              data.subscriptionTier || data.subscription_tier || "";
            const isPremium =
              data.role === "premium" ||
              subscriptionTier === "pro" ||
              ["active", "trialing"].includes(subscriptionStatus) ||
              Boolean(data.isLifetimeMember);
            setIsPro(isPremium);
          } else {
            setIsPro(false);
          }
        } catch (e) {
          console.error(e);
          setIsPro(false);
        }
        setIsProLoaded(true);
      } else {
        setIsPro(false);
        setIsProLoaded(true);
      }
      setLoading(false);
    });
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (user) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }, [user]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      let loggedInUser: User | null = null;
      try {
        const result = await signInWithPopup(auth, googleProvider);
        loggedInUser = result.user;
      } catch (popupError: any) {
        if (
          popupError?.code === "auth/popup-blocked" ||
          popupError?.code === "auth/cancelled-popup-request"
        ) {
          await signInWithRedirect(auth, googleProvider);
          return;
        } else if (popupError?.code === "auth/popup-closed-by-user") {
          return;
        } else {
          throw popupError;
        }
      }

      if (!loggedInUser) return;

      const userRef = doc(db, "users", loggedInUser.uid);

      await setDoc(
        userRef,
        {
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );

      const userSnap = await getDoc(userRef);

      let isPremium = false;
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: loggedInUser.uid,
          email: loggedInUser.email,
          displayName: loggedInUser.displayName,
          photoURL: loggedInUser.photoURL,
          subscription_tier: "free",
          createdAt: serverTimestamp(),
        });
      } else {
        const data = userSnap.data() || {};
        const subscriptionStatus =
          data.subscriptionStatus || data.subscription_status || "";
        const subscriptionTier =
          data.subscriptionTier || data.subscription_tier || "";
        isPremium =
          data.role === "premium" ||
          subscriptionTier === "pro" ||
          ["active", "trialing"].includes(subscriptionStatus) ||
          Boolean(data.isLifetimeMember);
      }
      setIsPro(isPremium);
      setIsProLoaded(true);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      setIsProLoaded(true);
      if (error?.code !== "auth/popup-closed-by-user") {
        console.error("Login failed:", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-red-800" size={40} />
      </div>
    );
  }

  return (
    <>
      <div className="w-full font-sans">
        {/* --- 1. Hero Section (Guest / User Banner) --- */}
        <HeroSection
          user={user}
          isPro={isPro}
          isProLoaded={isProLoaded}
          deferredPrompt={deferredPrompt}
          isIOS={isIOS}
          handleInstallClick={handleInstallClick}
          onOpenIOSInstallGuide={() => setShowIOSInstallGuide(true)}
          handleLogout={handleLogout}
          handleLogin={handleLogin}
          isLoggingIn={isLoggingIn}
          t={{
            authWelcome: t.authWelcome,
            authSub: t.authSub,
            logout: t.logout,
            dashboardBtn: t.dashboardBtn,
          }}
        />

        {/* --- 2. Interactive 1% Everyday Section --- */}
        {!user && (
          <OnePercentSection
            onePercentDay={onePercentDay}
            setOnePercentDay={setOnePercentDay}
          />
        )}

        {/* --- 3. The 3-Phase Journey Section --- */}
        {!user && <JourneySection />}

        {/* --- 4. Growth OS Tools Grid Section --- */}
        <ToolsGridSection t={t} />

        {/* --- 5. Pitch / Value Proposition Section --- */}
        {!user && (
          <PitchSection
            pitchBeta={t.pitchBeta}
            pitchTitle1={t.pitchTitle1}
            pitchTitle2={t.pitchTitle2}
            pitchList={t.pitchList}
            loginGoogle={t.loginGoogle}
            loginRemark={t.loginRemark}
            isInAppBrowser={isInAppBrowser}
            isLoggingIn={isLoggingIn}
            handleLogin={handleLogin}
          />
        )}

        {/* --- 6. Footer --- */}
        <Footer
          footerText={t.footer}
          onOpenStory={() => setShowStoryModal(true)}
        />

        {/* --- 7. Modals --- */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          billingPlan={billingPlan}
          setBillingPlan={setBillingPlan}
          onUpgrade={handleUpgrade}
        />

        <StoryModal
          isOpen={showStoryModal}
          onClose={() => setShowStoryModal(false)}
        />

        <IOSInstallGuideModal
          isOpen={showIOSInstallGuide}
          onClose={() => setShowIOSInstallGuide(false)}
        />
      </div>

      {/* --- 8. 💿 Clean Maroon Floating Vinyl Music Player --- */}
      <VinylPlayer
        hide={showUpgradeModal || showStoryModal || showIOSInstallGuide}
      />
    </>
  );
}
