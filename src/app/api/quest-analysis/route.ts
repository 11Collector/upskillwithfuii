import { NextResponse } from 'next/server';
import { verifyAuthToken, isAuthError } from '@/lib/auth-middleware';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  try {
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

    // 2. ดึง questPreferences ถ้ามี
    const userSnap = await adminDb.collection('users').doc(authResult.uid).get();
    const questPreferences = userSnap.data()?.questPreferences || null;

    // 3. ถ้าไม่มี preferences และมีข้อความน้อยเกินไป → ไม่ทำ analysis
    if (!questPreferences && messages.length < 5) {
      return NextResponse.json({ questTitle: null });
    }

    const chatSummary = messages.slice(0, 15).join('\n');

    const prefsSection = questPreferences
      ? `ความต้องการพิเศษของ user (ให้ความสำคัญสูงสุด):
- ด้านที่สนใจ: ${questPreferences.focus || 'ไม่ระบุ'}
- เรื่องค้างคา/เป้าหมาย: ${questPreferences.challenge || 'ไม่ระบุ'}
- ระยะเวลาที่ยอมรับ: ${questPreferences.duration || 'ไม่ระบุ'}
สร้าง Quest ให้ตรงกับความต้องการนี้โดยตรง\n`
      : '';

    // 4. ส่งให้ DeepSeek วิเคราะห์
    const prompt = `คุณเป็นผู้ช่วยสร้าง Daily Quest สำหรับแอปพัฒนาตัวเอง

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

ข้อความของ user:
${chatSummary || '(ยังไม่มีประวัติการสนทนา)'}`.trim();

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
        max_tokens: 60,
      }),
    });

    if (!response.ok) return NextResponse.json({ questTitle: null });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '';

    // 4. Normalize — ensure single space after leading emoji
    const normalized = raw.replace(/^(\p{Emoji})\s*/u, '$1 ');

    // 5. Validate output — ต้องมี emoji ขึ้นต้น และความยาวเหมาะสม
    const emojiRegex = /^\p{Emoji}/u;
    const isValid = emojiRegex.test(normalized) && normalized.length >= 5 && normalized.length <= 42;

    return NextResponse.json({ questTitle: isValid ? normalized : null });

  } catch {
    return NextResponse.json({ questTitle: null });
  }
}
