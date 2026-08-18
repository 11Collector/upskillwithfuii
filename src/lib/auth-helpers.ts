import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

export const isStandalonePWA = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
};

export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      // Sync user document non-blocking in the background
      syncUserDocument(user).catch((err) =>
        console.error("Background syncUserDocument error:", err)
      );
    }
    return user;
  } catch (error: any) {
    if (
      error?.code === "auth/popup-closed-by-user" ||
      error?.code === "auth/cancelled-popup-request"
    ) {
      return null;
    }

    // On Android PWA (WebAPK) / Standalone mode, popups throw auth/internal-error or auth/popup-blocked
    // Automatically switch to Redirect flow seamlessly!
    if (
      error?.code === "auth/internal-error" ||
      error?.code === "auth/popup-blocked" ||
      error?.code === "auth/operation-not-supported-in-this-environment"
    ) {
      console.log("Popup unavailable on this environment, falling back to redirect...");
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr) {
        console.error("Redirect login fallback error:", redirectErr);
      }
    }

    console.error("Google sign-in error:", error);
    if (typeof window !== "undefined") {
      alert(`เข้าสู่ระบบไม่สำเร็จ: ${error?.code || error?.message || error}`);
    }
    throw error;
  }
};

export const syncUserDocument = async (user: User) => {
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );

    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        subscription_tier: "free",
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("Error syncing user document:", err);
  }
};

export const checkRedirectLoginResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      alert(`เข้าสู่ระบบสำเร็จ: ${result.user.displayName || result.user.email}`);
      syncUserDocument(result.user).catch(console.error);
      return result.user;
    }
    return null;
  } catch (err: any) {
    if (err?.code !== "auth/credential-already-in-use") {
      console.error("getRedirectResult error:", err);
      if (typeof window !== "undefined") {
        alert(`Redirect Error: ${err?.code || err?.message || err}`);
      }
    }
    return null;
  }
};

export const logoutUser = () => signOut(auth);
