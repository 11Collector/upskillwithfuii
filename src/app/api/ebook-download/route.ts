import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { verifyAuthToken, isAuthError } from "@/lib/auth-middleware";

export async function GET(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  try {
    const filePath = path.join(process.cwd(), "private", "ebooks", "สร้างก่อนพร้อม-A5.pdf");
    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename*=UTF-8\'\'%E0%B8%AA%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%87%E0%B8%81%E0%B9%88%E0%B8%AD%E0%B8%99%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A1.pdf',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[ebook-download]", error);
    return NextResponse.json({ error: "ไม่พบไฟล์ E-Book" }, { status: 404 });
  }
}
