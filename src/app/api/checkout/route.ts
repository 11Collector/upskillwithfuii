import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { verifyAuthToken, isAuthError } from "@/lib/auth-middleware";

const CheckoutSchema = z.object({
  isSubscription: z.boolean().optional(),
  priceId: z.string().optional(),
});

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10" as any, 
    })
  : null;

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  const body = await req.json().catch(() => null);
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  // uid/email มาจาก verified token เท่านั้น — ไม่รับจาก client
  const uid = authResult.uid;
  const email = authResult.email;
  const { isSubscription } = parsed.data;

  try {
    const origin = new URL(req.url).origin;

    if (!stripe) {
      console.error("❌ Stripe API Error: STRIPE_SECRET_KEY is missing");
      return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 });
    }

    const REPORT_PRICE_ID = process.env.STRIPE_REPORT_PRICE_ID;
    const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!REPORT_PRICE_ID || (isSubscription && !SUBSCRIPTION_PRICE_ID)) {
      return NextResponse.json({ error: "Stripe price configuration missing" }, { status: 500 });
    }

    const priceIdToUse = isSubscription ? SUBSCRIPTION_PRICE_ID! : REPORT_PRICE_ID;

    // 3. ตั้งค่า Session Config
    const sessionConfig: any = {
      ...(email && { customer_email: email }),
      line_items: [{
        price: priceIdToUse, 
        quantity: 1,
      }],
      success_url: `${origin}/report-review?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
      metadata: { 
        userId: uid,
        type: isSubscription ? "membership" : "deep_report" 
      },
    };

    // 4. 🔥 แยกโหมดเพื่อป้องกัน Error ของ PromptPay
    if (isSubscription) {
      // โหมดรายเดือน (ใช้บัตรเท่านั้น)
      sessionConfig.mode = "subscription";
      sessionConfig.payment_method_types = ["card"]; 
    } else {
      // โหมดจ่ายครั้งเดียว (เปิดใช้ Automatic เพื่อเอา PromptPay!)
      sessionConfig.mode = "payment";
      sessionConfig.automatic_payment_methods = { enabled: true };
      sessionConfig.payment_intent_data = { 
        metadata: { userId: uid, type: "deep_report" }
      };
    }


    const session = await stripe.checkout.sessions.create(sessionConfig);
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("❌ Stripe API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}