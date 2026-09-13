import { fetchActivities } from './src/lib/strava/client';
import { db } from './src/lib/db/index';
import { users } from './src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { LOCAL_USER_ID } from './src/app/api/strava/callback/route';

async function test() {
  const user = await db.select().from(users).where(eq(users.id, LOCAL_USER_ID)).get();
  const acts = await fetchActivities(user!.stravaAccessToken!, undefined); // no 'after'
  console.log(`Fetched ${acts.length} acts without 'after'`);
  if (acts.length > 0) {
    console.log(`Most recent: ${acts[0].start_date}`);
    console.log(`Oldest: ${acts[acts.length - 1].start_date}`);
  }
}
test();
