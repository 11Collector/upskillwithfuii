import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  // Security Check: Optional CRON_SECRET to protect the endpoint from public runs
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // 1. Fetch all unsent wills
    const snapshot = await adminDb
      .collection('wills')
      .where('emailSent', '==', false)
      .limit(50) // process in batches of 50
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ processed: 0, sent: 0, message: "No pending wills found." });
    }

    let processedCount = 0;
    let sentCount = 0;
    const nowMs = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

    for (const docSnap of snapshot.docs) {
      processedCount++;
      const will = docSnap.data();
      const willId = docSnap.id;

      if (!will.userId || !will.email) continue;

      // 2. Fetch user's latest activity state
      const userDocSnap = await adminDb.collection('users').doc(will.userId).get();
      let isInactive = false;
      let displayName = will.displayName || "Upskiller";

      if (userDocSnap.exists) {
        const userData = userDocSnap.data() || {};
        displayName = userData.displayName || displayName;
        
        const lastActiveAt = userData.lastActiveAt?.toDate?.() || userData.lastActiveAt;
        const lastActiveDateStr = userData.lastActiveDate; // YYYY-MM-DD format

        let lastActiveTime = null;
        if (lastActiveAt) {
          lastActiveTime = new Date(lastActiveAt).getTime();
        } else if (lastActiveDateStr) {
          lastActiveTime = new Date(lastActiveDateStr).getTime();
        }

        if (lastActiveTime) {
          // If active date is older than 30 days
          if (nowMs - lastActiveTime >= thirtyDaysMs) {
            isInactive = true;
          }
        } else {
          // Fallback: If no activity record, check the will's own creation time
          const willCreatedAt = will.createdAt?.toDate?.() || new Date(will.createdAt);
          if (nowMs - new Date(willCreatedAt).getTime() >= thirtyDaysMs) {
            isInactive = true;
          }
        }
      } else {
        // User record deleted or doesn't exist; count as inactive
        isInactive = true;
      }

      // 3. Send email if user has been inactive for >= 30 days
      if (isInactive) {
        try {
          const emailResult = await resend.emails.send({
            from: 'ฟุ้ย <fuii@upskilleveryday.com>',
            to: will.email,
            subject: '✉️ ข้อความที่คุณฝากไว้ถึงตัวเองในวันสุดท้าย...',
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;color:#1A1A1A;background-color:#FAFAFA;border:1px solid #E0E0E0;border-radius:24px;">
                <div style="height:2px;background:#1A1A1A;margin-bottom:32px;"></div>
                
                <h3 style="margin:0 0 16px;font-size:18px;font-weight:800;letter-spacing:-0.02em;">สวัสดีครับคุณ ${displayName}</h3>
                
                <p style="color:#555;margin:0 0 24px;line-height:1.6;font-size:14px;">
                  เมื่อ 30 วันที่แล้ว ก่อนที่คุณจะก้าวห่างออกไปจากเส้นทางการฝึกฝนตัวเอง คุณได้เขียนข้อความสลักสติชิ้นนี้ฝากเอาไว้ให้กับตัวเองในอนาคต:
                </p>
                
                <div style="background-color:#FFF;border-left:3px solid #1A1A1A;padding:16px 20px;margin:24px 0;border-radius:8px;box-shadow:inset 0 1px 3px rgba(0,0,0,0.02);">
                  <p style="margin:0;font-style:italic;color:#1A1A1A;font-size:14px;line-height:1.6;font-weight:500;">
                    "${will.message}"
                  </p>
                </div>
                
                <p style="color:#555;margin:0 0 32px;line-height:1.6;font-size:14px;">
                  ชีวิตไม่ได้จบลงเมื่อวาน และวันนี้คุณยังได้รับโอกาสกลับมาเริ่มต้นใหม่อีกครั้งอย่างมีความหมาย... กลับมาอัปสกิลชีวิต คืนพลังโฟกัสกันนะครับ
                </p>
                
                <a href="https://www.upskilleveryday.com/dashboard"
                   style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;
                          padding:14px 28px;border-radius:12px;font-weight:700;font-size:14px;text-align:center;width:calc(100% - 56px);">
                  เข้าสู่บทเรียนชีวิตใหม่ของคุณ
                </a>
                
                <p style="color:#888;font-size:11px;margin-top:40px;line-height:1.6;text-align:center;border-top:1px solid #E0E0E0;padding-top:20px;">
                  หวังว่าคุณจะยังปลอดภัยดี และพร้อมที่จะท้าทายตัวเองอยู่เสมอครับ 🙂<br/>
                  — ฟุ้ย · <a href="https://www.upskilleveryday.com" style="color:#1A1A1A;text-decoration:underline;">upskilleveryday.com</a>
                </p>
                
                <div style="height:2px;background:#1A1A1A;margin-top:32px;"></div>
              </div>
            `,
          });

          if (emailResult.error) {
            console.error(`[resend error] for doc ${willId}:`, emailResult.error);
          } else {
            sentCount++;
            // Update Firestore so we don't send again
            await docSnap.ref.update({
              emailSent: true,
              emailSentAt: FieldValue.serverTimestamp()
            });
          }
        } catch (emailErr) {
          console.error(`[email sending failed] for doc ${willId}:`, emailErr);
        }
      }
    }

    return NextResponse.json({ processed: processedCount, sent: sentCount });
  } catch (err) {
    console.error('[send-inactive-emails cron error]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
