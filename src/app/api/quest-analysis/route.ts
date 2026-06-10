import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuthToken, isAuthError } from '@/lib/auth-middleware';
import { adminDb } from '@/lib/firebase-admin';

const QuestAnalysisSchema = z.object({
  level: z.number().int().min(1).max(1000).optional(),
});

const emojiRegex = /^\p{Emoji}/u;

function normalizeQuest(raw: string): string | null {
  const normalized = raw.trim().replace(/^(\p{Emoji})\s*/u, '$1 ');
  const isValid = emojiRegex.test(normalized) && normalized.length >= 5 && normalized.length <= 42;
  return isValid ? normalized : null;
}

async function callDeepSeek(prompt: string, maxTokens = 60): Promise<string> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });
  if (!response.ok) return '';
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = QuestAnalysisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const level = parsed.data.level ?? 1;

    // 1. ดึง chat history 30 ข้อความล่าสุด
    const historySnap = await adminDb
      .collection('users')
      .doc(authResult.uid)
      .collection('chat_history')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    const messages = historySnap.docs
      .map(d => d.data())
      .filter(d => d.role === 'user' && d.content?.trim())
      .map(d => d.content as string);

    // 2. ดึง user data (questPreferences + assessments)
    const userSnap = await adminDb.collection('users').doc(authResult.uid).get();
    const userData = userSnap.data() || {};
    const questPreferences = userData.questPreferences || null;
    const discType = userData.lastDisc?.finalResult?.charAt(0) || userData.lastDisc?.result?.charAt(0) || null;
    const wheelGoal = userData.lastWheel?.goal || null;
    const soulType = userData.lastLibrarySoul?.type || null;

    // 3. ถ้าไม่มี preferences และมีข้อความน้อยเกินไป → ไม่ทำ analysis
    const hasEnoughData = questPreferences || messages.length >= 5 || discType || wheelGoal;
    if (!hasEnoughData) {
      return NextResponse.json({ questTitle: null, wildcardTitle: null });
    }

    const chatSummary = messages.slice(0, 15).join('\n');

    const prefsSection = questPreferences
      ? `ความต้องการพิเศษของ user (ให้ความสำคัญสูงสุด):
- ด้านที่สนใจ: ${questPreferences.focus || 'ไม่ระบุ'}
- เรื่องค้างคา/เป้าหมาย: ${questPreferences.challenge || 'ไม่ระบุ'}
- ระยะเวลาที่ยอมรับ: ${questPreferences.duration || 'ไม่ระบุ'}
สร้าง Quest ให้ตรงกับความต้องการนี้โดยตรง\n`
      : '';

    const assessmentContext = [
      discType && `DISC Type: ${discType}`,
      soulType && `Soul Type: ${soulType}`,
      wheelGoal && `เป้าหมาย: "${wheelGoal}"`,
    ].filter(Boolean).join(' / ');

    // 4. CHALLENGE quest (ทุก level)
    const challengePrompt = `คุณเป็นผู้ช่วยสร้าง Daily Quest สำหรับแอปพัฒนาตัวเอง

${prefsSection}วิเคราะห์ข้อมูลด้านล่าง แล้วสร้าง Quest 1 ข้อที่:
- ทำเสร็จได้จริงภายในวันเดียว (action ชัดเจน)
- เกี่ยวข้องกับสิ่งที่ user สนใจหรือกังวล
- format: emoji 1 ตัว + เว้นวรรค + ข้อความภาษาไทยสั้นๆ
- ความยาวรวม 15-35 ตัวอักษร
- ห้ามพูดถึงการคุยกับ AI หรือใช้แอป
- ตอบเฉพาะ Quest title เท่านั้น ไม่มีข้อความอื่น ไม่มีเครื่องหมายคำพูด

ตัวอย่าง format ที่ถูกต้อง:
"🎯 ส่งเป้าหมายวันนี้ให้เพื่อนรับรู้"
"📵 งดโซเชียล 30 นาทีอยู่กับตัวเองเงียบๆ"
"✍️ จดสิ่งที่ค้างใจลง Note 1 ข้อ"

ข้อมูล: ${assessmentContext || '(ไม่มี)'}
ข้อความของ user:
${chatSummary || '(ยังไม่มีประวัติการสนทนา)'}`.trim();

    // 5. WILDCARD awareness quest (level 11+)
    const awarenessPrompt = level >= 11 ? `คุณเป็น Life Coach ผู้สร้าง Daily Quest สาย Awareness

ข้อมูล user: ${assessmentContext || '(ไม่มี)'}
Level: ${level} (ผ่านช่วง Habit Building มาแล้ว — ต้องการ Quest ที่ชวนสังเกตตัวเอง)

สร้าง Quest 1 ข้อที่:
- ชวนสังเกต / ตั้งคำถามกับตัวเอง ไม่ใช่แค่ทำ task
- ทำเสร็จได้ภายในวันเดียว — ยากขึ้นหมายถึงลึกขึ้น ไม่ใช่นานขึ้น
- ต่างจาก Quest ปกติ — เน้น reflection หรือ micro-experiment
- format: emoji 1 ตัว + เว้นวรรค + ข้อความภาษาไทยสั้นๆ
- ความยาวรวม 15-38 ตัวอักษร
- ตอบเฉพาะ Quest title เท่านั้น ไม่มีข้อความอื่น

ตัวอย่าง:
"🔍 สังเกตว่าวันนี้พูดว่า 'ไม่มีเวลา' กี่ครั้ง"
"🪞 เขียนสิ่งที่ทำซ้ำๆ แต่ยังไม่เปลี่ยน 1 ข้อ"
"🎭 วันนี้ลองตอบสนองต่างจากปกติในสถานการณ์ที่คุ้นเคย"`.trim() : null;

    // 6. Call DeepSeek (parallel ถ้ามี awareness quest)
    const [challengeRaw, wildcardRaw] = await Promise.all([
      callDeepSeek(challengePrompt, 60),
      awarenessPrompt ? callDeepSeek(awarenessPrompt, 70) : Promise.resolve(''),
    ]);

    return NextResponse.json({
      questTitle: normalizeQuest(challengeRaw),
      wildcardTitle: awarenessPrompt ? normalizeQuest(wildcardRaw) : null,
    });

  } catch {
    return NextResponse.json({ questTitle: null, wildcardTitle: null });
  }
}
