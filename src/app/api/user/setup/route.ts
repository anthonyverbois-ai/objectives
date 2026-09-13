import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, objectives, biometrics } from '@/lib/db/schema';
import { LOCAL_USER_ID } from '../../strava/callback/route';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const data = await request.json();
  
  try {
    let user = await db.select().from(users).where(eq(users.id, LOCAL_USER_ID)).get();
    if (!user) {
      await db.insert(users).values({ id: LOCAL_USER_ID, createdAt: new Date() });
    }

    await db.insert(objectives).values({
      id: crypto.randomUUID(),
      userId: LOCAL_USER_ID,
      eventName: data.objective.eventName,
      eventDate: data.objective.eventDate,
      targetTime: data.objective.targetTime,
      distance: data.objective.distance,
      createdAt: new Date(),
    });

    await db.insert(biometrics).values({
      id: crypto.randomUUID(),
      userId: LOCAL_USER_ID,
      age: data.biometrics.age,
      sex: data.biometrics.sex,
      weight: data.biometrics.weight,
      restingHR: data.biometrics.restingHR,
      maxHR: data.biometrics.maxHR,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
