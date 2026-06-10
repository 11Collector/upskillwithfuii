import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import { checkRateLimit } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const snapshot = await adminDb.collection('ebook_leads').count().get();
    return NextResponse.json({ count: snapshot.data().count });
  } catch (err) {
    console.error('[ebook-lead count]', err);
    return NextResponse.json({ count: 0 });
  }
}

const Schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  // route นี้เปิด public (lead capture) — กัน spam/email bombing ด้วย IP rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = checkRateLimit(`ebook-lead:${ip}`, 3, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
  }

  try {
    const body = await req.json();
    const { email } = Schema.parse(body);
    const normalised = email.trim().toLowerCase();

    // Upsert — avoid duplicate entries
    const existing = await adminDb
      .collection('ebook_leads')
      .where('email', '==', normalised)
      .limit(1)
      .get();

    if (existing.empty) {
      await adminDb.collection('ebook_leads').add({
        email: normalised,
        source: 'ebook-landing',
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // Await so Vercel doesn't terminate the function before email is sent
    const emailResult = await resend.emails.send({
      from: 'ฟุ้ย <fuii@upskilleveryday.com>',
      to: normalised,
      subject: '📖 สร้างก่อนพร้อม — ดาวน์โหลด E-Book ได้เลยครับ',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a;">
          <div style="height:4px;background:#7B1818;border-radius:2px;margin-bottom:32px;"></div>
          <h2 style="margin:0 0 8px;font-size:20px;">ขอบคุณครับ! 🙏</h2>
          <p style="color:#5a5a5a;margin:0 0 24px;line-height:1.6;">
            กด Download ด้านล่างได้เลยนะครับ ไม่มีเงื่อนไขอะไรทั้งนั้น
          </p>
          <a href="https://upskilleveryday.com/%E0%B8%AA%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%87%E0%B8%81%E0%B9%88%E0%B8%AD%E0%B8%99%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A1-A5.pdf"
             style="display:inline-block;background:#7B1818;color:#fff;text-decoration:none;
                    padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;">
            ดาวน์โหลด E-Book ฟรี
          </a>
          <p style="color:#aaa;font-size:12px;margin-top:32px;line-height:1.6;">
            หวังว่าจะมีอย่างน้อยหนึ่งหน้าที่ทำให้คุณ "เอะใจ" ครับ 🙂<br/>
            — ฟุ้ย · <a href="https://upskilleveryday.com" style="color:#7B1818;">upskilleveryday.com</a>
          </p>
          <div style="height:4px;background:#7B1818;border-radius:2px;margin-top:32px;"></div>
        </div>
      `,
    });
    if (emailResult.error) console.error('[resend]', emailResult.error);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    console.error('[ebook-lead]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
