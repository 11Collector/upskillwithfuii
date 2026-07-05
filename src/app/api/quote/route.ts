import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuthToken, isAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAiCall } from '@/lib/ai-logger';
import { adminDb } from '@/lib/firebase-admin';

const QuoteSchema = z.object({
  prompt: z.string().min(1).max(5000),
});

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  const uid = isAuthError(authResult)
    ? (req.headers.get("x-forwarded-for") ?? "guest")
    : authResult.uid;

  const rl = checkRateLimit(`quote:${uid}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
  }

  // Check Daily Quota for Free Tier (authenticated users only)
  if (!isAuthError(authResult)) {
    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() || {} : {};

    const subscriptionStatus = userData.subscriptionStatus || userData.subscription_status || "";
    const subscriptionTier = userData.subscriptionTier || userData.subscription_tier || "";
    const isProMember =
      userData.role === "premium" ||
      subscriptionTier === "pro" ||
      ["active", "trialing"].includes(subscriptionStatus) ||
      Boolean(userData.isLifetimeMember);

    if (!isProMember) {
      const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
      const currentDay = userData.quoteDailyDate || "";
      const currentCount = currentDay === todayKey ? Number(userData.quoteDailyCount || 0) : 0;

      if (currentCount >= 1) {
        return NextResponse.json({ error: "คุณใช้โควตาสร้างคำคมฟรีครบ 1 ครั้งในวันนี้แล้ว อัปเกรดเป็น PRO เพื่อสุ่มสร้างได้ไม่จำกัดครับ" }, { status: 403 });
      }

      await userRef.set({
        quoteDailyDate: todayKey,
        quoteDailyCount: currentCount + 1
      }, { merge: true });
    }
  }

  const body = await req.json().catch(() => null);
  const parsed = QuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { prompt } = parsed.data;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          // ปรับ System ให้เป็นที่ปรึกษาที่ฉลาดและอบอุ่น ตามสไตล์ที่คุณฟุ้ยต้องการ
          { role: "system", content: "คุณคือที่ปรึกษาและ Life Coach ที่เชี่ยวชาญการวิเคราะห์ศักยภาพมนุษย์ พูดจาเป็นกันเอง อบอุ่น และให้คำแนะนำที่นำไปใช้ได้จริง" },
          { role: "user", content: prompt }
        ],
        stream: false,
        temperature: 0.4, // ลดลงนิดหน่อยเพื่อให้แผน 7 วันมีความสมเหตุสมผล ไม่เพ้อฝันเกินไป
        max_tokens: 1500  // 🔥 เพิ่มเป็น 1500 เพื่อให้ครอบคลุมเนื้อหาทั้งหมด ไม่โดนตัดจบ
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || "DeepSeek API Error" }, { status: response.status });
    }

    const data = await response.json();
    const generatedQuote = data.choices[0].message.content.trim();

    logAiCall(uid, "quote_generation").catch(() => {});

    return NextResponse.json({ quote: generatedQuote });

  } catch (error: any) {
    console.error("DeepSeek Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}