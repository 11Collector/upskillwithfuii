import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

const DEFAULT_TRAIT_COUNTS: Record<string, number> = {
  MONK: 0,
  FUCK: 0,
  ZZZZ: 0,
  WORK: 0,
  NPC: 0,
  HELL: 0,
};

const DEFAULT_TOTAL = 0;

export async function GET() {
  try {
    const statsDocRef = adminDb.collection("analytics").doc("personalityzero");
    const docSnap = await statsDocRef.get();

    if (!docSnap.exists) {
      const percentages: Record<string, number> = {};
      Object.keys(DEFAULT_TRAIT_COUNTS).forEach((key) => {
        percentages[key] = 16.7;
      });

      return NextResponse.json({
        success: true,
        totalPlays: 0,
        traits: DEFAULT_TRAIT_COUNTS,
        percentages,
      });
    }

    const data = docSnap.data() || {};
    const traitsData = data.traits || {};

    const traits: Record<string, number> = {};
    const percentages: Record<string, number> = {};

    Object.keys(DEFAULT_TRAIT_COUNTS).forEach((traitKey) => {
      traits[traitKey] = Number(traitsData[traitKey] || 0);
    });

    const currentTotal = Object.values(traits).reduce((acc, c) => acc + c, 0);

    Object.keys(traits).forEach((traitKey) => {
      percentages[traitKey] =
        currentTotal > 0
          ? Math.round((traits[traitKey] / currentTotal) * 1000) / 10
          : 16.7;
    });

    return NextResponse.json({
      success: true,
      totalPlays: currentTotal,
      traits,
      percentages,
    });
  } catch (error: any) {
    console.error("[PersonalityZero API] GET Stats Error:", error);
    const percentages: Record<string, number> = {};
    Object.keys(DEFAULT_TRAIT_COUNTS).forEach((key) => {
      percentages[key] = 16.7;
    });

    return NextResponse.json({
      success: true,
      totalPlays: 0,
      traits: DEFAULT_TRAIT_COUNTS,
      percentages,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const trait = body?.trait;

    const validTraits = ["MONK", "FUCK", "ZZZZ", "WORK", "NPC", "HELL"];
    if (!trait || !validTraits.includes(trait)) {
      return NextResponse.json({ error: "Invalid trait" }, { status: 400 });
    }

    const statsDocRef = adminDb.collection("analytics").doc("personalityzero");

    await statsDocRef.set(
      {
        total_plays: FieldValue.increment(1),
        [`traits.${trait}`]: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[PersonalityZero API] POST Stats Error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to record stats" }, { status: 500 });
  }
}
