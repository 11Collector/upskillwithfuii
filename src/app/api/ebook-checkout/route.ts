import { NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyAuthToken, isAuthError } from "@/lib/auth-middleware";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" as any })
  : null;

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;
  if (!stripe) return NextResponse.json({ error: "ระบบชำระเงินยังไม่พร้อมใช้งาน" }, { status: 500 });

  try {
    const requestOrigin = new URL(req.url).origin;
    const isLocal = /localhost|127\.0\.0\.1|\[::1\]/.test(requestOrigin);
    const origin = isLocal ? requestOrigin : process.env.NEXT_PUBLIC_BASE_URL || requestOrigin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "thb",
          unit_amount: 45000,
          product_data: { name: "E-Book สร้างก่อนพร้อม", description: "ไฟล์ PDF ดาวน์โหลดได้หลังชำระเงิน" },
        },
        quantity: 1,
      }],
      customer_email: authResult.email,
      payment_method_types: ["card", "promptpay"],
      success_url: `${origin}/ebook?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ebook?checkout=cancelled`,
      metadata: { type: "ebook", userId: authResult.uid },
      payment_intent_data: { metadata: { type: "ebook", userId: authResult.uid } },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("E-book checkout error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "เปิดหน้าชำระเงินไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  }
}
