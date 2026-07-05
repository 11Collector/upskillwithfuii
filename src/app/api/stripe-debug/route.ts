import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY || "";
  const keyLength = key.length;
  const keyPrefix = key.substring(0, 15);
  const keySuffix = key.substring(key.length - 5);
  
  if (!key) {
    return NextResponse.json({ error: "No key configured" });
  }
  
  try {
    const stripe = new Stripe(key, { apiVersion: "2024-04-10" as any });
    // ทดลองดึงข้อมูล Balance เพื่อดูว่าคีย์นี้ทำงานกับ Stripe ได้สำเร็จไหม
    const balance = await stripe.balance.retrieve();
    return NextResponse.json({
      success: true,
      keyLength,
      keyPrefix,
      keySuffix,
      msg: "Stripe Key is valid and connected successfully!",
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      keyLength,
      keyPrefix,
      keySuffix,
      error: err.message,
    });
  }
}
