import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { LOCAL_USER_ID } from '../api/strava/callback/route';
import { VStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Heading';
import ConfidenceScore from '@/components/dashboard/ConfidenceScore';
import MetricsSummary from '@/components/dashboard/MetricsSummary';

export default async function DashboardPage() {
  const userActivities = await db.select().from(activities).where(eq(activities.userId, LOCAL_USER_ID)).orderBy(desc(activities.date)).all();

  return (
    <div className="min-h-screen w-full p-8" style={{ background: 'var(--color-surface-sunken)' }}>
      <VStack gap={8} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Heading level={2}>Ton Dashboard</Heading>

        <MetricsSummary activities={userActivities} />
        <ConfidenceScore activityCount={userActivities.length} />

      </VStack>
    </div>
  );
}
