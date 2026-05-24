import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuthToken, isAuthError } from '@/lib/auth-middleware';

const MONEY_LABELS: Record<string, string> = {
  HIGH_RISK_HIGH_DISC: "นักลงทุนสายระบบ (กล้าเสี่ยง วางแผนเก่ง)",
  MID_RISK_HIGH_DISC:  "เครื่องจักรปั้นพอร์ต (สาย DCA ระยะยาว)",
  LOW_RISK_HIGH_DISC:  "ผู้พิทักษ์เงินฝาก (ชอบความปลอดภัย)",
  HIGH_RISK_LOW_DISC:  "สายกาว All-in (FOMO สูง ขาดวินัย)",
  MID_RISK_LOW_DISC:   "สายเปย์ตามฟีล (ใช้จ่ายตามอารมณ์)",
  LOW_RISK_LOW_DISC:   "สายเดือนชนเดือน (เงินตึง ไม่มีเผื่อ)",
};

const BookMatchSchema = z.object({
  soulType: z.string(),
  soulTitle: z.string().nullable().optional(),
  soulDescription: z.string().nullable().optional(),
  soulVibe: z.string().nullable().optional(),
  discType: z.string().nullable().optional(),
  moneyType: z.string().nullable().optional(),
  wheelGoal: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  const body = await req.json().catch(() => null);
  const parsed = BookMatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { soulType, soulTitle, soulDescription, soulVibe, discType, moneyType, wheelGoal } = parsed.data;

  const soulContext = [
    soulTitle && `ชื่อ: "${soulTitle}"`,
    soulVibe && `Vibe: ${soulVibe}`,
    soulDescription && `ลักษณะ: ${soulDescription}`,
  ].filter(Boolean).join('\n');

  const discContext = discType
    ? `\n- DISC Type: ${discType} (ใช้ปรับโทนเหตุผลให้เหมาะกับบุคลิกนี้)`
    : '';

  const moneyContext = moneyType && MONEY_LABELS[moneyType]
    ? `\n- Money Type: ${MONEY_LABELS[moneyType]} (แนะนำหนังสือหมวด Money ให้ตรงกับนิสัยการเงินนี้)`
    : '';

  const goalContext = wheelGoal
    ? `\n- เป้าหมายชีวิต: "${wheelGoal}" (แนะนำเล่มที่ช่วยเรื่องนี้อย่างน้อย 1 เล่ม)`
    : '';

  // สร้าง instruction การกระจายหนังสือตาม assessment ที่มี
  const availableProfiles = [
    `Soul Type: ${soulType} (${soulTitle || ''}) — หลักสำคัญที่สุด`,
    discType ? `DISC Type: ${discType} — บุคลิกการทำงาน` : null,
    moneyType && MONEY_LABELS[moneyType] ? `Money Type: ${MONEY_LABELS[moneyType]} — นิสัยการเงิน` : null,
    wheelGoal ? `เป้าหมายชีวิต: "${wheelGoal}"` : null,
  ].filter(Boolean);

  const distributionNote = availableProfiles.length === 1
    ? `แนะนำหนังสือ 4 เล่ม โดยทุกเล่มต้อง match กับ Soul Type นี้`
    : `แนะนำหนังสือ 4 เล่ม กระจายให้ครอบคลุม ${availableProfiles.length} มิติที่มี — ไม่ต้องแบ่งเท่าๆ กัน ให้ AI ตัดสินใจว่าเล่มไหนเหมาะที่สุด`;

  const prompt = `คุณเป็นผู้เชี่ยวชาญด้านหนังสือที่เข้าใจว่าคนแต่ละแบบเติบโตด้วยหนังสือคนละประเภท

ข้อมูลผู้ใช้:
${availableProfiles.map(p => `- ${p}`).join('\n')}
${soulDescription ? `\nรายละเอียด Soul: ${soulDescription}` : ''}

${distributionNote}
- เป็นหนังสือจริงที่มีอยู่ (ชื่อและผู้แต่งต้องถูกต้อง 100%)
- Nonfiction หรือ Fiction ก็ได้ — เลือกหนังสือที่มีคนอ่านและรีวิวพอสมควร มีคนรู้จักในวงกว้าง ไม่ใช่หนังสือ no-name ที่แทบไม่มีใครรู้จัก
- ถ้าเป้าหมายชีวิตมี keyword ชัดเจน (เช่น "one person business", "เปลี่ยนงาน", "ลงทุน") ให้มีอย่างน้อย 1 เล่มที่ตรงกับ keyword นั้นโดยตรง — priority สูงกว่า personality match
- เหตุผลต้องระบุว่า match กับมิติไหนของผู้ใช้ (1-2 ประโยค ภาษาไทย)
- ห้ามซ้ำหมวดเกิน 2 เล่มต่อหมวด

ตอบเป็น JSON array เท่านั้น ไม่มีข้อความอื่น (แนะนำมา 7 เล่มเผื่อคัดออก):
[
  {"title":"ชื่อหนังสือ","author":"ผู้แต่ง","category":"หมวด","reason":"เหตุผล"},
  ...
]`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) return NextResponse.json({ books: [] });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '';

    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const candidates = JSON.parse(jsonStr);
    if (!Array.isArray(candidates)) return NextResponse.json({ books: [] });

    // Verify each book against Google Books API (parallel)
    const verified = await Promise.all(
      candidates.slice(0, 7).map(async (book: { title: string; author: string; reason: string; category: string }) => {
        try {
          const q = encodeURIComponent(`intitle:${book.title} inauthor:${book.author}`);
          const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=totalItems`, {
            signal: AbortSignal.timeout(3000),
          });
          const gbData = await res.json();
          return gbData.totalItems > 0 ? book : null;
        } catch {
          return book; // ถ้า verify ไม่ได้ ให้ผ่านไปก่อน
        }
      })
    );

    const validBooks = verified.filter(Boolean).slice(0, 4);
    // ถ้า verify แล้วได้น้อยกว่า 4 ให้เอา unverified มาเสริม
    if (validBooks.length < 4) {
      const unverified = candidates.filter((b: { title: string }) => !validBooks.some((v: { title: string } | null) => v?.title === b.title));
      validBooks.push(...unverified.slice(0, 4 - validBooks.length));
    }

    return NextResponse.json({ books: validBooks.slice(0, 4) });
  } catch {
    return NextResponse.json({ books: [] });
  }
}
