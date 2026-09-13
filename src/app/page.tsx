import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users, objectives } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { LOCAL_USER_ID } from './api/strava/callback/route';

export default async function Home() {
  const user = await db.select().from(users).where(eq(users.id, LOCAL_USER_ID)).get();
  
  if (!user || !user.stravaAccessToken) {
    redirect('/onboarding');
  }

  const obj = await db.select().from(objectives).where(eq(objectives.userId, LOCAL_USER_ID)).get();
  if (!obj) {
    redirect('/onboarding');
  }

  redirect('/dashboard');
}
