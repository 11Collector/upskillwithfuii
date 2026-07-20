import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_COMMENTS = [
  {
    id: "default-1",
    personaCode: "FUCK",
    personaTitle: "THE FURY",
    commentText: "ทะเลาะกับเพื่อนร่วมงานเสร็จ เพิ่งลากตัวเองมาทำแบบประเมิน ปวดหัวมาก 🤬",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "default-2",
    personaCode: "ZZZZ",
    personaTitle: "THE EXHAUSTED",
    commentText: "หาวไป 10 รอบระหว่างกดตอบข้อ 1 ถึงข้อ 8 ขอนอนต่อละนะ 👋",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "default-3",
    personaCode: "HELL",
    personaTitle: "THE CHAOS AGENT",
    commentText: "ส่งลิงก์ไปให้ป่วนกลุ่มไลน์ออฟฟิศเรียบร้อย รอโดนบ่นเลย 5555",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: "default-4",
    personaCode: "WORK",
    personaTitle: "THE OVERACHIEVER",
    commentText: "กดอู้งานมาทำ 2 นาที ต้องรีบกลับไปปั่นสไลด์ต่อละ เดดไลน์ค้ำคอ 😭",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("personalityzero_comments")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, comments: [] });
    }

    const comments = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        personaCode: data.personaCode || "NPC",
        personaTitle: data.personaTitle || "THE DEFAULT",
        commentText: data.commentText || "",
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    console.error("[PersonalityZero Comments] GET Error:", error);
    return NextResponse.json({ success: true, comments: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const personaCode = body?.personaCode;
    const personaTitle = body?.personaTitle;
    const commentText = body?.commentText?.trim();

    if (!commentText || commentText.length === 0) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    if (commentText.length > 150) {
      return NextResponse.json({ error: "Comment text too long (max 150 chars)" }, { status: 400 });
    }

    const docRef = await adminDb.collection("personalityzero_comments").add({
      personaCode: personaCode || "NPC",
      personaTitle: personaTitle || "THE DEFAULT",
      commentText: commentText,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    console.error("[PersonalityZero Comments] POST Error:", error);
    return NextResponse.json({ success: false, error: "Failed to post comment" }, { status: 500 });
  }
}
