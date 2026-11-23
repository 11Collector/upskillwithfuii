import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, isAuthError } from "@/lib/auth-middleware";

export async function GET(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;
  try {
    const userDoc = await adminDb.collection("users").doc(authResult.uid).get();
    return NextResponse.json({ hasAccess: userDoc.data()?.ebookPurchased === true });
  } catch (error) {
    console.error("E-book access lookup failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "ตรวจสอบสิทธิ์ไม่สำเร็จ" }, { status: 500 });
  }
}
