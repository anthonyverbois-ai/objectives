'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';

export default function StravaConnect() {
  const handleConnect = () => {
    window.location.href = '/api/strava/auth';
  };

  return (
    <VStack gap={8} align="stretch">
      <VStack gap={2}>
        <Heading level={3}>Dernière étape</Heading>
        <Text color="secondary">Connecte ton compte Strava pour permettre au Coach IA d'analyser ton entraînement passé.</Text>
      </VStack>
      
      <HStack hAlign="start" style={{ paddingTop: 'var(--spacing-4)' }}>
        <Button label="Connecter avec Strava" onClick={handleConnect} variant="primary" />
      </HStack>
    </VStack>
  );
}
