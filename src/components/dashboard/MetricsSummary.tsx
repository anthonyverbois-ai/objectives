'use client';

import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';

export default function MetricsSummary({ activities = [] }: { activities: any[] }) {
  const totalKm = activities.reduce((sum, act) => sum + (act.distance / 1000), 0);
  
  // Extraire la période (ex: depuis janvier 2026)
  let periodText = 'des 6 derniers mois';
  if (activities.length > 0) {
    // activities is ordered by desc(date) according to page.tsx
    const oldestDate = new Date(activities[activities.length - 1].date);
    const formatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
    periodText = `depuis ${formatter.format(oldestDate)}`;
  }

  return (
    <VStack gap={4}>
      <Text color="secondary" size="sm">Analyse basée sur tes entraînements {periodText}</Text>
      
      <HStack gap={4} style={{ width: '100%' }}>
        <VStack style={{ background: 'var(--color-surface-sunken)', padding: 'var(--spacing-4)', flex: 1, borderRadius: 'var(--radius-md)' }}>
          <Text size="sm" color="secondary">Volume Total</Text>
          <Text size="xl" weight="bold">{totalKm.toFixed(1)} km</Text>
        </VStack>
        <VStack style={{ background: 'var(--color-surface-sunken)', padding: 'var(--spacing-4)', flex: 1, borderRadius: 'var(--radius-md)' }}>
          <Text size="sm" color="secondary">Activités</Text>
          <Text size="xl" weight="bold">{activities.length} courses</Text>
        </VStack>
      </HStack>
    </VStack>
  );
}
