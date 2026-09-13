import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, objectives, biometrics, activities, computedMetrics, confidenceScores } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { LOCAL_USER_ID } from '../../strava/callback/route';
import { generateConfidenceScore } from '@/lib/ai/coach';

export async function POST() {
  try {
    const user = await db.select().from(users).where(eq(users.id, LOCAL_USER_ID)).get();
    if (!user || !user.geminiApiKey) {
      return NextResponse.json({ error: 'User or Gemini API key not found' }, { status: 400 });
    }

    const objective = await db.select().from(objectives).where(eq(objectives.userId, LOCAL_USER_ID)).orderBy(desc(objectives.createdAt)).get();
    const biometric = await db.select().from(biometrics).where(eq(biometrics.userId, LOCAL_USER_ID)).get();

    if (!objective || !biometric) {
      return NextResponse.json({ error: 'Missing objective or biometrics' }, { status: 400 });
    }

    // Get latest computed metrics (for simplicity, just taking the most recent activity's metrics or aggregating)
    // In a real scenario we aggregate over the last N weeks. For MVP, let's just mock aggregation or sum it up.
    const allActivities = await db.select().from(activities).where(eq(activities.userId, LOCAL_USER_ID)).all();
    const totalKm = allActivities.reduce((acc, a) => acc + ((a.distance || 0) / 1000), 0);

    const contextData = {
      eventName: objective.eventName,
      eventDate: objective.eventDate,
      targetTime: objective.targetTime,
      distance: objective.distance,
      age: biometric.age,
      sex: biometric.sex,
      weight: biometric.weight,
      restingHR: biometric.restingHR,
      maxHR: biometric.maxHR,
      totalKm: totalKm.toFixed(2),
      aerobicEfficiency: 0, // Placeholder
      thresholdCadence: 0, // Placeholder
      timeInZone1: 0,
      timeInZone2: 0,
      timeInZone3: 0,
      timeInZone4: 0,
      timeInZone5: 0,
    };

    const aiResult = await generateConfidenceScore(user.geminiApiKey, contextData);

    const newScoreId = crypto.randomUUID();
    await db.insert(confidenceScores).values({
      id: newScoreId,
      userId: LOCAL_USER_ID,
      objectiveId: objective.id,
      score: aiResult.score,
      analysis: aiResult.summary,
      strengths: JSON.stringify(aiResult.strengths),
      weaknesses: JSON.stringify(aiResult.weaknesses),
      actions: JSON.stringify(aiResult.actions),
      computedAt: new Date(),
    });

    return NextResponse.json(aiResult);
  } catch (error: any) {
    console.error('Coach API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
