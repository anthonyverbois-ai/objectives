import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const LOCAL_USER_ID = 'local-mvp-user';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/?error=access_denied', request.url));
  }
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
  }

  const data = await response.json();

  const existingUser = await db.select().from(users).where(eq(users.id, LOCAL_USER_ID)).get();
  
  if (existingUser) {
    await db.update(users).set({
      stravaAthleteId: data.athlete.id,
      stravaAccessToken: data.access_token,
      stravaRefreshToken: data.refresh_token,
      stravaTokenExpiresAt: data.expires_at,
    }).where(eq(users.id, LOCAL_USER_ID));
  } else {
    await db.insert(users).values({
      id: LOCAL_USER_ID,
      stravaAthleteId: data.athlete.id,
      stravaAccessToken: data.access_token,
      stravaRefreshToken: data.refresh_token,
      stravaTokenExpiresAt: data.expires_at,
      createdAt: new Date(),
    });
  }

  // Redirect to the new visual sync page instead of the api directly
  return NextResponse.redirect(new URL('/sync', request.url));
}
