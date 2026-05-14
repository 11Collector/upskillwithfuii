import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const PUBLISH_SECRET = "Fuii!3538";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { secret, title, slug, excerpt, summary, category, readTime, date, content } = body;

    if (secret !== PUBLISH_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Missing required fields: title, slug, content" }, { status: 400 });
    }

    const snapshot = await adminDb.collection("articles").orderBy("id", "desc").limit(1).get();
    const lastId = snapshot.empty ? 0 : (snapshot.docs[0].data().id ?? 0);
    const nextId = lastId + 1;

    await adminDb.collection("articles").add({
      id: nextId,
      title,
      slug,
      excerpt: excerpt ?? "",
      summary: summary ?? "",
      category: category ?? "พัฒนาตัวเอง",
      readTime: readTime ?? "3 นาที",
      date: date ?? new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
      content,
    });

    return NextResponse.json({
      success: true,
      id: nextId,
      slug,
      url: `/library/${slug}`,
    });
  } catch (error: any) {
    console.error("publish-article error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
