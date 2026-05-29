import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const Schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    console.error('[ebook-lead]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
