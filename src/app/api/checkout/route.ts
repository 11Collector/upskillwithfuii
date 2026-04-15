import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10" as any, 
    })
  : null;

export async function POST(req: Request) {
  try {
    const { uid, email, isSubscription } = await req.json();
    const origin = new URL(req.url).origin;

    if (!stripe) {
      console.error("❌ Stripe API Error: STRIPE_SECRET_KEY is missing");
      return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 });
    }

    // 1. ตรวจสอบข้อมูลเบื้องต้น (อีเมลไม่มีไม่เป็นไร ให้กรอกใน Stripe ได้)
    if (!uid) {
      return NextResponse.json({ error: "Missing User ID" }, { status: 400 });
    }

    // 2. กำหนด Price ID สำหรับ Report (ที่คุณฟุ้ยให้มา)
    const REPORT_PRICE_ID = "price_1TLz1BPpEmfCgSDJptz3hFJ7"; 
    
    // 💡 ปล. ถ้าในอนาคตคุณฟุ้ยมี priceId ของรายเดือนค่อยส่งผ่าน body มา หรือเซ็ตตัวแปรไว้ตรงนี้ครับ
    const priceIdToUse = isSubscription ? "ใส่_ID_รายเดือนตรงนี้" : REPORT_PRICE_ID;

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


    console.log(`🚀 Creating ${sessionConfig.mode} session for: ${email}`);
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("❌ Stripe API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}