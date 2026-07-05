import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, isAuthError } from "@/lib/auth-middleware";

async function isProUser(uid: string) {
  const userSnap = await adminDb.collection("users").doc(uid).get();
  const userData = userSnap.exists ? userSnap.data() || {} : {};
  const subscriptionStatus = userData.subscriptionStatus || userData.subscription_status || "";
  const subscriptionTier = userData.subscriptionTier || userData.subscription_tier || "";

  return (
    userData.role === "premium" ||
    subscriptionTier === "pro" ||
    ["active", "trialing"].includes(subscriptionStatus) ||
    Boolean(userData.isLifetimeMember)
  );
}

export async function GET(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  if (!(await isProUser(authResult.uid))) {
    return NextResponse.json({ error: "E-Book นี้เป็นโบนัสสำหรับสมาชิก PRO ครับ" }, { status: 403 });
  }

  try {
    const filePath = path.join(process.cwd(), "private", "ebooks", "สร้างก่อนพร้อม-A5.pdf");
    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename*=UTF-8\'\'%E0%B8%AA%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%87%E0%B8%81%E0%B9%88%E0%B8%AD%E0%B8%99%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A1.pdf',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[ebook-download]", error);
    return NextResponse.json({ error: "ไม่พบไฟล์ E-Book" }, { status: 404 });
  }
}
