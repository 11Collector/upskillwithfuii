import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuthToken, isAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAiCall } from '@/lib/ai-logger';

function isProUser(userData: any) {
  const subscriptionStatus = userData.subscriptionStatus || userData.subscription_status || "";
  const subscriptionTier = userData.subscriptionTier || userData.subscription_tier || "";

  return (
    userData.role === "premium" ||
    subscriptionTier === "pro" ||
    ["active", "trialing"].includes(subscriptionStatus) ||
    Boolean(userData.isLifetimeMember)
  );
}

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  const rl = checkRateLimit(`extract-note:${authResult.uid}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "ส่งคำขอมากเกินไป กรุณารอสักครู่แล้วลองอีกครั้งครับ" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    // 1. Check PRO status
    const userRef = adminDb.collection("users").doc(authResult.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() || {} : {};

    if (!isProUser(userData)) {
      return NextResponse.json(
        { error: "ฟีเจอร์นี้เป็นสิทธิ์สำหรับสมาชิก PRO เท่านั้นครับ" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.chatMessage) {
      return NextResponse.json({ error: "Missing chatMessage in request body" }, { status: 400 });
    }
    const { chatMessage, userMessage } = body;

    // Call DeepSeek to extract insights and action plan
    const prompt = `ข้อความแชทคำแนะนำของพี่ฟุ้ย:
"""
${chatMessage}
"""

${userMessage ? `บริบทคำถามของผู้ใช้:
"""
${userMessage}
"""` : ""}

ช่วยวิเคราะห์ข้อมูลเพื่อบันทึกลงในคลังสมองที่สอง (Second Brain) ของผู้ใช้
ให้คุณสกัดและตกผลึกแผนปฏิบัติงาน (Action Items) และสรุปข้อคิดที่สามารถนำไปทำตามได้จริง
โดยส่งกลับข้อมูลมาในรูปแบบ JSON วัตถุเพียงอย่างเดียว (JSON Object ONLY) ห้ามมีคำเกริ่นนำหรือเครื่องหมายตกแต่ง markdown ใดๆ ทั้งสิ้น:
{
  "title": "ชื่อบันทึกสรุปที่กระชับและดึงดูดใจ (เช่น แผนรับมือหมดไฟฉบับเร่งด่วน, แนวคิดทำสมาธิรายวัน)",
  "category": "หนึ่งในหมวดหมู่เหล่านี้เท่านั้น: 'พัฒนาตัวเอง', 'การเงิน & ลงทุน', 'ธุรกิจ', 'หนังสือ'",
  "content": "เนื้อหาบันทึกในรูปแบบข้อความธรรมดา (Plain Text) เท่านั้น ห้ามใช้เครื่องหมายจัดฟอร์แมตที่เป็นมาร์กดาวน์ เช่น เครื่องหมายดอกจัน (**) หรือเครื่องหมายสี่เหลี่ยม (#) โดยเด็ดขาด ให้ใช้การขึ้นบรรทัดใหม่และสัญลักษณ์หัวข้อธรรมดา เช่น - หรือตัวเลขในการแบ่งข้อความเพื่อความอ่านง่าย โดยมีความยาวประมาณ 200-450 คำ"
}`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a professional assistant that parses coaching chats into structured JSON notes with a title, category, and plain text content." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return NextResponse.json({ error: errBody.error?.message || "DeepSeek API failed" }, { status: response.status });
    }

    const resData = await response.json();
    let text = resData.choices[0].message.content.trim();
    
    // Clean JSON markdown blocks if any
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    }

    const noteObj = JSON.parse(text);
    let content = noteObj.content || "";
    
    // Double-clean markdown indicators for plain text safety
    content = content
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/^- \[ [x ] \]\s+/gm, '- ') // convert markdown checkbox to bullet list
      .trim();

    // Save to Firestore users/{uid}/second_brain
    const notesRef = adminDb.collection("users").doc(authResult.uid).collection("second_brain");
    const createdAtStr = new Date().toISOString();
    const docRef = await notesRef.add({
      title: noteObj.title || "บันทึกสรุปจากการสนทนา",
      category: noteObj.category || "พัฒนาตัวเอง",
      content: content,
      createdAt: createdAtStr,
      updatedAt: createdAtStr
    });

    logAiCall(authResult.uid, "extract_note").catch(() => {});

    return NextResponse.json({ noteId: docRef.id });
  } catch (error: any) {
    console.error("Extract Note Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
