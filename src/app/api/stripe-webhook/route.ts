import { NextResponse } from "next/server";
import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10" as any,
    })
  : null;

const getPlanFromPrice = (priceId?: string | null) => {
  if (!priceId) return "pro";
  const entries = [
    ["monthly", process.env.STRIPE_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_MONTHLY_PRICE_ID],
    ["yearly", process.env.STRIPE_PRO_YEARLY_PRICE_ID],
    ["founding_monthly", process.env.STRIPE_PRO_FOUNDING_MONTHLY_PRICE_ID],
    ["founding_yearly", process.env.STRIPE_PRO_FOUNDING_YEARLY_PRICE_ID],
    ["lifetime", process.env.STRIPE_PRO_LIFETIME_PRICE_ID],
  ] as const;
  return entries.find(([, envPriceId]) => envPriceId === priceId)?.[0] || "pro";
};

const updateUserSubscription = async ({
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
}) => {
  const isLifetime = plan === "lifetime";
  const isActive = isLifetime || ["active", "trialing"].includes(status);

  await adminDb.collection("users").doc(userId).set(
    {
      role: isActive ? "premium" : "free",
      subscription_tier: isActive ? "pro" : "free",
      subscriptionTier: isActive ? "pro" : "free",
      subscriptionStatus: status,
      ...(plan ? { subscriptionPlan: plan } : {}),
      ...(stripeCustomerId ? { stripeCustomerId } : {}),
      ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
      ...(typeof currentPeriodEnd === "number"
        ? { currentPeriodEnd: new Date(currentPeriodEnd * 1000) }
        : {}),
      ...(typeof cancelAtPeriodEnd === "boolean" ? { cancelAtPeriodEnd } : {}),
      isFoundingMember: plan?.startsWith("founding") || false,
      isLifetimeMember: isLifetime,
      subscriptionUpdatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
};

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook secret missing" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error: any) {
    console.error("❌ Stripe webhook signature error:", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type === "pro_membership" && session.metadata.userId) {
        if (session.mode === "payment") {
          const priceId = session.metadata.priceId || null;
          await updateUserSubscription({
            userId: session.metadata.userId,
            stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
            stripeSubscriptionId: null,
            status: "active",
            plan: session.metadata.plan || getPlanFromPrice(priceId),
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
          });
          return NextResponse.json({ received: true });
        }

        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        const subscription = subscriptionId
          ? await stripe.subscriptions.retrieve(subscriptionId)
          : null;
        const subscriptionData = subscription as any;

        const priceId = subscriptionData?.items.data[0]?.price.id;
        const plan = session.metadata.plan || getPlanFromPrice(priceId);

        await updateUserSubscription({
          userId: session.metadata.userId,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
          stripeSubscriptionId: subscriptionId,
          status: subscriptionData?.status || "active",
          plan,
          currentPeriodEnd: subscriptionData?.current_period_end,
          cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
        });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionData = subscription as any;
      const userId = subscription.metadata?.userId;
      if (userId) {
        const priceId = subscription.items.data[0]?.price.id;
        await updateUserSubscription({
          userId,
          stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          plan: subscription.metadata?.plan || getPlanFromPrice(priceId),
          currentPeriodEnd: subscriptionData.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceData = invoice as any;
      const subscriptionId = typeof invoiceData.subscription === "string" ? invoiceData.subscription : invoiceData.subscription?.id;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const subscriptionData = subscription as any;
        const userId = subscription.metadata?.userId;
        if (userId) {
          await updateUserSubscription({
            userId,
            stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            plan: subscription.metadata?.plan || getPlanFromPrice(subscription.items.data[0]?.price.id),
            currentPeriodEnd: subscriptionData.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Stripe webhook handler error:", error.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
