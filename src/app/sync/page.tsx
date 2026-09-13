'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { VStack } from '@astryxdesign/core/Layout';
import { Center } from '@astryxdesign/core/Center';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';

export default function SyncPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const syncStarted = useRef(false);

  useEffect(() => {
    if (syncStarted.current) return;
    syncStarted.current = true;

    const performSync = async () => {
      try {
        const res = await fetch('/api/strava/sync', { method: 'POST' });
        if (!res.ok) {
          throw new Error('Erreur lors de la synchronisation');
        }
        // Redirect to dashboard once sync is complete
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.message);
      }
    };

    performSync();
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: 'var(--color-surface-sunken)' }}>
      <div 
        className="w-full max-w-md rounded-2xl shadow-sm p-10 text-center"
        style={{ 
          background: 'var(--color-surface-default)',
          border: '1px solid var(--color-border-default)'
        }}
      >
        {error ? (
          <VStack gap={4}>
            <Heading level={3}>Échec de la synchronisation</Heading>
            <Text color="secondary">{error}</Text>
          </VStack>
        ) : (
          <VStack gap={8} align="center">
            <VStack gap={2}>
              <Heading level={3}>Préparation du Coach IA...</Heading>
              <Text color="secondary">Importation et analyse de tes 6 derniers mois d'entraînement sur Strava.</Text>
            </VStack>
            
            <div className="w-full max-w-[200px] mx-auto">
              <ProgressBar 
                label="Synchronisation en cours" 
                isLabelHidden 
                isIndeterminate 
                variant="accent"
              />
            </div>
            
            <Text size="sm" color="secondary">Cela peut prendre quelques secondes.</Text>
          </VStack>
        )}
      </div>
    </div>
  );
}
