import { NextResponse } from "next/server";
import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, isAuthError } from "@/lib/auth-middleware";

const Schema = z.object({ sessionId: z.string().min(1) });
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" as any })
  : null;

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;
  if (!stripe) return NextResponse.json({ error: "ระบบชำระเงินยังไม่พร้อมใช้งาน" }, { status: 500 });
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลชำระเงินไม่ถูกต้อง" }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);
    if (session.metadata?.type !== "ebook" || session.metadata.userId !== authResult.uid) {
      return NextResponse.json({ error: "รายการชำระเงินไม่ตรงกับบัญชีนี้" }, { status: 403 });
    }
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "กำลังรอยืนยันการชำระเงิน หากจ่ายผ่าน PromptPay กรุณารอสักครู่แล้วรีเฟรชหน้านี้" }, { status: 409 });
    }
    await adminDb.collection("users").doc(authResult.uid).set({
      ebookPurchased: true,
      ebookPurchasedAt: FieldValue.serverTimestamp(),
      ebookStripeSessionId: session.id,
    }, { merge: true });
    return NextResponse.json({ hasAccess: true });
  } catch (error) {
    console.error("E-book checkout confirmation failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "ยืนยันการชำระเงินไม่สำเร็จ" }, { status: 500 });
  }
}
