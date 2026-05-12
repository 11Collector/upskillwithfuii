import { NextResponse } from "next/server";

const adminCredentialsConfigured =
  !!process.env.FIREBASE_CLIENT_EMAIL && !!process.env.FIREBASE_PRIVATE_KEY;

export async function verifyAuthToken(req: Request): Promise<{ uid: string; email: string | undefined } | NextResponse> {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: missing token" }, { status: 401 });
  }

  if (!adminCredentialsConfigured) {
    console.warn("[auth] Firebase Admin credentials not configured — skipping token verification");
    try {
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
      return { uid: payload.user_id ?? payload.sub, email: payload.email };
    } catch {
      return NextResponse.json({ error: "Unauthorized: invalid token format" }, { status: 401 });
    }
  }

  try {
    const { getAdminAuth } = await import("./firebase-admin");
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch (err) {
    console.error("[auth] verifyIdToken failed:", err);
    return NextResponse.json({ error: "Unauthorized: invalid token" }, { status: 401 });
  }
}

export function isAuthError(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}
