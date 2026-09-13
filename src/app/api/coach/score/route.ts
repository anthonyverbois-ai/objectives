import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, objectives, biometrics, activities, confidenceScores } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { LOCAL_USER_ID } from '../../strava/callback/route';
import { generateConfidenceScore } from '@/lib/ai/coach';
import { computeActivityMetrics } from '@/lib/engine/metrics';

export async function POST() {
  try {
    const user = await db.select().from(users).where(eq(users.id, LOCAL_USER_ID)).get();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!user || !apiKey) {
      return NextResponse.json({ error: 'User or Gemini API key not found' }, { status: 400 });
    }

    const objective = await db.select().from(objectives).where(eq(objectives.userId, LOCAL_USER_ID)).orderBy(desc(objectives.createdAt)).get();
    const biometric = await db.select().from(biometrics).where(eq(biometrics.userId, LOCAL_USER_ID)).get();

    if (!objective || !biometric) {
      return NextResponse.json({ error: 'Missing objective or biometrics' }, { status: 400 });
    }

    const allActivities = await db.select().from(activities).where(eq(activities.userId, LOCAL_USER_ID)).orderBy(desc(activities.date)).all();
    
    if (allActivities.length === 0) {
      return NextResponse.json({ error: 'No activities found' }, { status: 400 });
    }

    const mostRecentDate = new Date(allActivities[0].date).getTime();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    
    // Build a 12-week macrocycle array
    const weeklyData = Array.from({ length: 12 }, (_, i) => ({
      weekOffset: i, // 0 = cette semaine, 1 = semaine dernière, etc.
      totalKm: 0,
      longestRun: 0,
      sumAe: 0,
      countAe: 0,
      totalZ1Z2: 0,
      totalZ3Z4Z5: 0,
      z4SpeedSum: 0,
      z4SpeedCount: 0,
    }));

    for (const act of allActivities) {
      const actTime = new Date(act.date).getTime();
      const weekIndex = Math.floor((mostRecentDate - actTime) / msPerWeek);
      
      if (weekIndex >= 0 && weekIndex < 12) {
        const week = weeklyData[weekIndex];
        const distKm = (act.distance || 0) / 1000;
        
        week.totalKm += distKm;
        if (distKm > week.longestRun) week.longestRun = distKm;

        if (act.hasStreams && act.rawStreams) {
          try {
            const streams = JSON.parse(act.rawStreams);
            const metrics = computeActivityMetrics(streams, biometric.restingHR, biometric.maxHR);
            
            week.totalZ1Z2 += (metrics.timeInZone1 || 0) + (metrics.timeInZone2 || 0);
            week.totalZ3Z4Z5 += (metrics.timeInZone3 || 0) + (metrics.timeInZone4 || 0) + (metrics.timeInZone5 || 0);
            
            if (metrics.speedAtThreshold) {
              week.z4SpeedSum += metrics.speedAtThreshold;
              week.z4SpeedCount++;
            }

            if (metrics.aerobicEfficiency) {
              week.sumAe += metrics.aerobicEfficiency;
              week.countAe++;
            }
          } catch (e) {}
        }
      }
    }

    // Format weekly output for AI
    const macrocycleSummary = weeklyData.map(w => {
      const ae = w.countAe > 0 ? (w.sumAe / w.countAe).toFixed(2) : 'N/A';
      const polarization = (w.totalZ1Z2 > 0 || w.totalZ3Z4Z5 > 0) 
        ? `${Math.round((w.totalZ1Z2 / (w.totalZ1Z2 + w.totalZ3Z4Z5)) * 100)}% Endurance` 
        : 'N/A';
        
      let thresholdPace = 'N/A';
      if (w.z4SpeedCount > 0) {
        const avgZ4Speed = w.z4SpeedSum / w.z4SpeedCount; // m/s
        if (avgZ4Speed > 0) {
          const paceSec = 1000 / avgZ4Speed;
          const mins = Math.floor(paceSec / 60);
          const secs = Math.floor(paceSec % 60);
          thresholdPace = `${mins}:${secs.toString().padStart(2, '0')}/km`;
        }
      }

      return `S-${w.weekOffset} : Vol=${w.totalKm.toFixed(1)}km | Sortie Longue=${w.longestRun.toFixed(1)}km | Eff(Z2)=${ae} | Ratio=${polarization} | Seuil=${thresholdPace}`;
    }).reverse(); // Reverse so it goes from S-11 to S-0 (chronological order)

    let weeksToEvent = -1;
    if (objective.eventDate) {
      const eventTime = new Date(objective.eventDate).getTime();
      const diffMs = eventTime - Date.now();
      weeksToEvent = Math.max(0, Math.round(diffMs / msPerWeek));
    }

    const contextData = {
      eventName: objective.eventName,
      eventDate: objective.eventDate,
      weeksToEvent,
      targetTime: objective.targetTime,
      distance: objective.distance,
      age: biometric.age,
      sex: biometric.sex,
      weight: biometric.weight,
      restingHR: biometric.restingHR,
      maxHR: biometric.maxHR,
      macrocycleSummary: macrocycleSummary.join('\n')
    };

    const aiResult = await generateConfidenceScore(apiKey, contextData);

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
