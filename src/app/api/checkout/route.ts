import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { verifyAuthToken, isAuthError } from "@/lib/auth-middleware";

const PlanSchema = z.enum([
  "monthly",
  "yearly",
  "founding_monthly",
  "founding_yearly",
  "lifetime",
]);

const CheckoutSchema = z.object({
  plan: PlanSchema.optional(),
  priceId: z.string().optional(),
});

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10" as any,
    })
  : null;

const getConfiguredPrices = () => ({
  monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_MONTHLY_PRICE_ID,
  yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  founding_monthly: process.env.STRIPE_PRO_FOUNDING_MONTHLY_PRICE_ID,
  founding_yearly: process.env.STRIPE_PRO_FOUNDING_YEARLY_PRICE_ID,
  lifetime: process.env.STRIPE_PRO_LIFETIME_PRICE_ID,
});

const resolvePlanByPriceId = (priceId: string) => {
  const entries = Object.entries(getConfiguredPrices());
  return (entries.find(([, configuredPriceId]) => configuredPriceId === priceId)?.[0] || "monthly") as z.infer<typeof PlanSchema>;
};

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  const body = await req.json().catch(() => null);
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 });
  }

  const requestOrigin = new URL(req.url).origin;
  const isLocalCheckout =
    requestOrigin.includes("localhost") ||
    requestOrigin.includes("127.0.0.1") ||
    requestOrigin.includes("[::1]");
  const origin = isLocalCheckout ? requestOrigin : (process.env.NEXT_PUBLIC_BASE_URL || requestOrigin);
  const plan = parsed.data.plan || (parsed.data.priceId ? resolvePlanByPriceId(parsed.data.priceId) : "monthly");
  const configuredPrices = getConfiguredPrices();
  const priceId = parsed.data.priceId || configuredPrices[plan];

  if (!priceId) {
    return NextResponse.json({ error: `Stripe price for ${plan} is missing` }, { status: 500 });
  }

  const isLifetime = plan === "lifetime";

  try {
    const sessionConfig: any = {
      ...(authResult.email ? { customer_email: authResult.email } : {}),
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isLifetime ? "payment" : "subscription",
      success_url: `${origin}/dashboard?checkout=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?checkout=cancelled`,
      metadata: {
        userId: authResult.uid,
        type: "pro_membership",
        plan,
      },
    };

    if (isLifetime) {
      sessionConfig.automatic_payment_methods = { enabled: true };
      sessionConfig.payment_intent_data = {
        metadata: {
          userId: authResult.uid,
          type: "pro_membership",
          plan,
        },
      };
    } else {
      sessionConfig.payment_method_types = ["card"];
      sessionConfig.subscription_data = {
        metadata: {
          userId: authResult.uid,
          type: "pro_membership",
          plan,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
