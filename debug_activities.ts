import { db } from './src/lib/db/index';
import { activities } from './src/lib/db/schema';
import { desc } from 'drizzle-orm';

async function debug() {
  const allActs = await db.select().from(activities).orderBy(desc(activities.date)).all();
  console.log(`Total activities: ${allActs.length}`);
  if (allActs.length === 0) return;

  const mostRecentDate = new Date(allActs[0].date).getTime();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const recentThreshold = mostRecentDate - thirtyDaysInMs;

  let longestRunDistance = 0;
  for (const act of allActs) {
    const actTime = new Date(act.date).getTime();
    const isRecent = actTime >= recentThreshold;
    const distKm = (act.distance || 0) / 1000;
    
    if (isRecent && distKm > longestRunDistance) {
      longestRunDistance = distKm;
    }
  }

  console.log(`Most recent date: ${new Date(mostRecentDate).toISOString()}`);
  console.log(`Recent threshold: ${new Date(recentThreshold).toISOString()}`);
  console.log(`Calculated longest run (recent): ${longestRunDistance.toFixed(2)} km`);

  console.log('\nTop 5 recent runs:');
  const recentActs = allActs.filter(a => new Date(a.date).getTime() >= recentThreshold);
  recentActs.slice(0, 5).forEach(a => {
    console.log(`- ${new Date(a.date).toISOString().split('T')[0]}: ${(a.distance! / 1000).toFixed(2)} km`);
  });
}

debug();
