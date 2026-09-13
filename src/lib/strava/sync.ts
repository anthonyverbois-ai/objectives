import { db } from '../db';
import { users, activities } from '../db/schema';
import { eq } from 'drizzle-orm';
import { fetchActivities, fetchActivityStreams, refreshStravaToken } from './client';

export async function syncUserActivities(userId: string) {
  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!user || !user.stravaAccessToken) throw new Error('User not connected to Strava');

  let accessToken = user.stravaAccessToken;
  
  // Refresh token if expired
  if (user.stravaTokenExpiresAt && user.stravaTokenExpiresAt < Date.now() / 1000) {
    const refreshed = await refreshStravaToken(user.stravaRefreshToken!);
    accessToken = refreshed.access_token;
    await db.update(users).set({
      stravaAccessToken: refreshed.access_token,
      stravaRefreshToken: refreshed.refresh_token,
      stravaTokenExpiresAt: refreshed.expires_at,
    }).where(eq(users.id, userId));
  }

  // Fetch recent activities (e.g. past 6 months)
  const sixMonthsAgo = Math.floor(Date.now() / 1000) - (6 * 30 * 24 * 60 * 60);
  const acts = await fetchActivities(accessToken, sixMonthsAgo);

  for (const act of acts) {
    if (act.type !== 'Run') continue; // Only process runs for now

    const existingAct = await db.select().from(activities).where(eq(activities.stravaId, act.id)).get();
    
    if (!existingAct) {
      // Insert new activity
      const newActId = crypto.randomUUID();
      await db.insert(activities).values({
        id: newActId,
        userId,
        stravaId: act.id,
        name: act.name,
        sportType: act.type,
        date: act.start_date,
        distance: act.distance,
        movingTime: act.moving_time,
        elapsedTime: act.elapsed_time,
        elevationGain: act.total_elevation_gain,
        avgHeartrate: act.average_heartrate,
        maxHeartrate: act.max_heartrate,
        avgCadence: act.average_cadence,
        avgSpeed: act.average_speed,
        createdAt: new Date(),
      });

      // Fetch and save streams if not already fetched
      if (act.has_heartrate) {
        const streams = await fetchActivityStreams(accessToken, act.id);
        if (streams) {
          await db.update(activities).set({
            hasStreams: true,
            rawStreams: JSON.stringify(streams),
          }).where(eq(activities.id, newActId));
        }
      }
    }
  }
}
