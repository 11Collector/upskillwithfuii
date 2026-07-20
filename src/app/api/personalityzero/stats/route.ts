import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_TRAIT_COUNTS: Record<string, number> = {
  MONK: 0,
  FUCK: 0,
  ZZZZ: 0,
  WORK: 0,
  NPC: 0,
  HELL: 0,
};

export async function GET() {
  try {
    const statsDocRef = adminDb.collection("analytics").doc("personalityzero");
    const docSnap = await statsDocRef.get();

    if (!docSnap.exists) {
      const percentages: Record<string, number> = {
        MONK: 16.7,
        FUCK: 16.7,
        ZZZZ: 16.7,
        WORK: 16.7,
        NPC: 16.7,
        HELL: 16.7,
      };

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

    Object.keys(DEFAULT_TRAIT_COUNTS).forEach((traitKey) => {
      traits[traitKey] = Number(traitsData[traitKey] || 0);
    });

    // totalPlays is strictly computed as the sum of all trait counts to guarantee exact consistency
    const totalPlays = Object.values(traits).reduce((acc, c) => acc + c, 0);

    const percentages: Record<string, number> = {};
    Object.keys(traits).forEach((traitKey) => {
      percentages[traitKey] =
        totalPlays > 0
          ? Math.round((traits[traitKey] / totalPlays) * 1000) / 10
          : 16.7;
    });

    return NextResponse.json({
      success: true,
      totalPlays,
      traits,
      percentages,
    });
  } catch (error: any) {
    console.error("[PersonalityZero API] GET Stats Error:", error);
    const percentages: Record<string, number> = {
      MONK: 16.7,
      FUCK: 16.7,
      ZZZZ: 16.7,
      WORK: 16.7,
      NPC: 16.7,
      HELL: 16.7,
    };

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
    const statsDocRef = adminDb.collection("analytics").doc("personalityzero");

    if (body?.reset === true) {
      await statsDocRef.set({
        total_plays: 0,
        traits: {
          MONK: 0,
          FUCK: 0,
          ZZZZ: 0,
          WORK: 0,
          NPC: 0,
          HELL: 0,
        },
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ success: true, reset: true });
    }

    let trait = body?.trait;
    if (trait === "NPC?") trait = "NPC";

    const validTraits = ["MONK", "FUCK", "ZZZZ", "WORK", "NPC", "HELL"];
    if (!trait || !validTraits.includes(trait)) {
      return NextResponse.json({ error: "Invalid trait" }, { status: 400 });
    }

    const docSnap = await statsDocRef.get();

    if (!docSnap.exists) {
      await statsDocRef.set({
        total_plays: 1,
        traits: {
          MONK: trait === "MONK" ? 1 : 0,
          FUCK: trait === "FUCK" ? 1 : 0,
          ZZZZ: trait === "ZZZZ" ? 1 : 0,
          WORK: trait === "WORK" ? 1 : 0,
          NPC: trait === "NPC" ? 1 : 0,
          HELL: trait === "HELL" ? 1 : 0,
        },
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await statsDocRef.set(
        {
          total_plays: FieldValue.increment(1),
          traits: {
            [trait]: FieldValue.increment(1),
          },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[PersonalityZero API] POST Stats Error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to record stats" }, { status: 500 });
  }
}
