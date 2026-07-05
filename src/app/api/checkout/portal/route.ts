import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, isAuthError } from "@/lib/auth-middleware";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10" as any,
    })
  : null;

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  if (!stripe) {
    return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 });
  }

  const userSnap = await adminDb.collection("users").doc(authResult.uid).get();
  const userData = userSnap.exists ? userSnap.data() || {} : {};
  const stripeCustomerId = userData.stripeCustomerId;

  if (!stripeCustomerId) {
    return NextResponse.json({ error: "ยังไม่พบข้อมูลลูกค้า Stripe สำหรับบัญชีนี้" }, { status: 404 });
  }

  try {
    const origin = new URL(req.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe portal error:", error.message);
    return NextResponse.json({ error: error.message || "Cannot create customer portal session" }, { status: 500 });
  }
}
