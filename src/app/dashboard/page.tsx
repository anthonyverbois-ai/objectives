import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { LOCAL_USER_ID } from '../api/strava/callback/route';
import { VStack } from '@astryxdesign/core/Layout';
import { Center } from '@astryxdesign/core/Center';
import ConfidenceScore from '@/components/dashboard/ConfidenceScore';
import MetricsSummary from '@/components/dashboard/MetricsSummary';

export default async function DashboardPage() {
  const userActivities = await db.select().from(activities).where(eq(activities.userId, LOCAL_USER_ID)).orderBy(desc(activities.date)).all();

  return (
    <Center style={{ minHeight: '100vh', width: '100%', padding: 'var(--spacing-8)' }}>
      <VStack gap={8} style={{ width: '800px', maxWidth: '100%' }}>
        <h1>Ton Dashboard</h1>
        <MetricsSummary activities={userActivities} />
        <ConfidenceScore />
      </VStack>
    </Center>
  );
}
