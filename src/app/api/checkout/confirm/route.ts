import { NextResponse } from "next/server";
import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, isAuthError } from "@/lib/auth-middleware";

const ConfirmCheckoutSchema = z.object({
  sessionId: z.string().min(1),
});

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10" as any,
    })
  : null;

async function updateUserSubscription({
  userId,
  stripeCustomerId,
  stripeSubscriptionId,
  status,
  plan,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: {
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status: string;
  plan?: string;
  currentPeriodEnd?: number | null;
  cancelAtPeriodEnd?: boolean | null;
}) {
  const isLifetime = plan === "lifetime";
  const isActive = isLifetime || ["active", "trialing", "complete", "paid"].includes(status);

  await adminDb.collection("users").doc(userId).set(
    {
      role: isActive ? "premium" : "free",
      subscription_tier: isActive ? "pro" : "free",
      subscriptionTier: isActive ? "pro" : "free",
      subscriptionStatus: isActive ? "active" : status,
      ...(plan ? { subscriptionPlan: plan } : {}),
      ...(stripeCustomerId ? { stripeCustomerId } : {}),
      ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
      ...(typeof currentPeriodEnd === "number"
        ? { currentPeriodEnd: new Date(currentPeriodEnd * 1000) }
        : {}),
      ...(typeof cancelAtPeriodEnd === "boolean" ? { cancelAtPeriodEnd } : {}),
      isFoundingMember: plan?.startsWith("founding") || plan === "yearly" || plan === "lifetime" || false,
      isLifetimeMember: isLifetime,
      subscriptionUpdatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  if (!stripe) {
    return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ConfirmCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);

    if (session.metadata?.type !== "pro_membership" || session.metadata.userId !== authResult.uid) {
      return NextResponse.json({ error: "Checkout session does not match this user" }, { status: 403 });
    }

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Checkout is not paid yet" }, { status: 409 });
    }

    const plan = session.metadata.plan || "monthly";

    if (session.mode === "subscription") {
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
      const subscriptionData = subscription as any;

      await updateUserSubscription({
        userId: authResult.uid,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
        stripeSubscriptionId: subscriptionId,
        status: subscriptionData?.status || "active",
        plan,
        currentPeriodEnd: subscriptionData?.current_period_end,
        cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
      });

      return NextResponse.json({ success: true, plan });
    }

    await updateUserSubscription({
      userId: authResult.uid,
      stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
      stripeSubscriptionId: null,
      status: "active",
      plan,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Confirm checkout error:", error.message);
    return NextResponse.json({ error: error.message || "Confirm checkout failed" }, { status: 500 });
  }
}
