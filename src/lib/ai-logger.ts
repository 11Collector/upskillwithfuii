import { adminDb } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Logs a successful AI feature call to the Firestore 'ai_calls' collection.
 * 
 * @param userId - The ID of the user calling the feature.
 * @param feature - The name of the AI feature.
 */
export async function logAiCall(userId: string, feature: string) {
  try {
    await adminDb.collection("ai_calls").add({
      userId,
      feature,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error(`[AI Logger] Error logging AI call for ${feature}:`, error);
  }
}
