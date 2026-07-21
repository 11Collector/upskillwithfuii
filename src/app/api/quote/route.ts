import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuthToken, isAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAiCall } from '@/lib/ai-logger';
import { adminDb } from '@/lib/firebase-admin';

const QuoteSchema = z.object({
  prompt: z.string().min(1).max(100000),
  type: z.string().optional(),
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

  const body = await req.json().catch(() => null);
  const parsed = QuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { prompt, type } = parsed.data;

  // Check Daily Quota for Free Tier (authenticated users only)
  const isExemptFromDailyLimit = ['wheel', 'second_brain_scan', 'second_brain'].includes(type || '');
  if (!isAuthError(authResult) && !isExemptFromDailyLimit) {
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
          { 
            role: "system", 
            content: type === "second_brain_scan"
              ? "คุณคือ AI ผู้ช่วยสแกนระบบความคิดของ 'พี่ฟุ้ย' ทำหน้าที่วิเคราะห์ความเชื่อมโยงเชิงแนวคิดซ่อนเร้น (Serendipitous & Cross-Domain Insights) ระหว่างหัวข้อและเนื้อหาของโน้ตต่างๆ โดยเฉพาะไอเดียที่มองเผินๆ เหมือนไม่เกี่ยวข้องกัน แต่มีรากฐานทางความคิดเชื่อมโยงกันอย่างน่าทึ่ง\n\nกฎเหล็กการตอบกลับ:\n1. คุณต้องตอบกลับในรูปแบบ JSON Array เท่านั้น ห้ามมีข้อความอื่นเกริ่นนำหรือสรุป นอกเหนือจาก JSON\n2. ตัวอย่างรูปแบบ JSON:\n[\n  {\n    \"source\": \"[ID ของโน้ต A]\",\n    \"target\": \"[ID ของโน้ต B]\",\n    \"score\": [ตัวเลขคะแนนความสัมพันธ์เชิงความหมาย 60 ถึง 100 ตามความหนาแน่นของความหมายแนวคิดที่ใกล้เคียงกัน],\n    \"reason\": \"[คำอธิบายจุดเชื่อมโยงซ่อนเร้นของสองโน้ตนี้อย่างสั้นกระชับ 1 ประโยค 15-20 คำ ภาษาเขียนเป็นกันเองแบบพี่ฟุ้ย]\"\n  }\n]\n3. เลือกวิเคราะห์จับคู่เชื่อมโยงเฉพาะคู่ที่สัมพันธ์กันเชิงแนวคิดจริงๆ เท่านั้น เน้นคู่น่าทึ่งที่ส่งเสริมความคิดสร้างสรรค์ (หา 1-4 คู่ที่เชื่อมกันได้ลงตัวที่สุด)"
              : type === "second_brain"
                ? "คุณคือ 'พี่ฟุ้ย' ที่ปรึกษาแนว Humble Expert (พี่ชายที่เก่งกว่าเล่าให้ฟัง) พูดจาเป็นกันเอง ตรงประเด็น ใช้ตรรกะความจริง (Reality Check) และให้คำแนะนำกับ Action Plan ที่สั้น กระชับ ตรงประเด็นมากๆ (ห้ามเขียนข้อความยาวเฟื้อย แต่ละข้อของ Action Plan ห้ามยาวเกิน 1 ประโยคสั้นๆ) และห้ามใช้คำลงท้ายแบบผู้หญิงหรืออ่อนหวาน เช่น 'คะ', 'ค่ะ', 'นะ', 'นะคะ' โดยเด็ดขาด"
                : "คุณคือที่ปรึกษาและ Life Coach ที่เชี่ยวชาญการวิเคราะห์ศักยภาพมนุษย์ พูดจาเป็นกันเอง อบอุ่น และให้คำแนะนำที่นำไปใช้ได้จริง"
          },
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