import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10" as any,
});

async function main() {
  try {
    const sessionConfig: any = {
      customer_email: "test@example.com",
      line_items: [{
        price: "price_1TLz1BPpEmfCgSDJptz3hFJ7",
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/report-review?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      metadata: { userId: "test1234", type: "deep_report" },
      mode: "payment",
      payment_method_types: ["card", "promptpay"],
      payment_intent_data: { 
        metadata: { userId: "test1234", type: "deep_report" }
      }
    };
    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log("Success! URL:", session.url);
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}
main();
