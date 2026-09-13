'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Center } from '@astryxdesign/core/Center';
import { useState } from 'react';

export default function ConfidenceScore({ activityCount }: { activityCount: number }) {
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (activityCount === 0) {
    return (
      <Center 
        className="w-full rounded-2xl p-8 border border-dashed"
        style={{ borderColor: 'var(--color-border-default)' }}
      >
        <VStack gap={4} align="center" style={{ textAlign: 'center' }}>
          <Heading level={3}>Données insuffisantes</Heading>
          <Text color="secondary">
            Le Coach IA a besoin d'au moins une course récente pour évaluer ton niveau et calculer ton score de confiance.
          </Text>
        </VStack>
      </Center>
    );
  }

  const fetchScore = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/coach/score', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setScoreData(data);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Erreur réseau ou timeout");
    }
    setLoading(false);
  };

  if (errorMsg) {
    return (
      <VStack gap={4} align="center" className="p-8">
        <Text>{errorMsg}</Text>
        <Button label="Réessayer" onClick={fetchScore} isDisabled={loading} variant="primary" />
      </VStack>
    );
  }

  if (!scoreData) {
    return (
      <VStack gap={4} align="center" className="p-8">
        <Text>Le coach est prêt à analyser ton entraînement.</Text>
        <Button label={loading ? "Calcul en cours..." : "Générer mon score"} onClick={fetchScore} isDisabled={loading} variant="primary" />
      </VStack>
    );
  }

  return (
    <VStack gap={6} style={{ background: 'var(--color-surface-default)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
      <HStack align="center" gap={4}>
        <h1 style={{ fontSize: '3rem', color: scoreData.score > 70 ? 'green' : scoreData.score > 40 ? 'orange' : 'red' }}>
          {scoreData.score}%
        </h1>
        <Heading level={3}>Score de Confiance</Heading>
      </HStack>
      <Text weight="medium">{scoreData.summary}</Text>
      
      <HStack gap={4} align="start">
        <VStack gap={2} style={{ flex: 1 }}>
          <Heading level={4} style={{ color: 'green' }}>Points Forts</Heading>
          <ul style={{ paddingLeft: '20px' }}>
            {scoreData.strengths?.map((s: string, i: number) => <li key={i}><Text>{s}</Text></li>)}
          </ul>
        </VStack>
        <VStack gap={2} style={{ flex: 1 }}>
          <Heading level={4} style={{ color: 'red' }}>Points Faibles</Heading>
          <ul style={{ paddingLeft: '20px' }}>
            {scoreData.weaknesses?.map((s: string, i: number) => <li key={i}><Text>{s}</Text></li>)}
          </ul>
        </VStack>
      </HStack>
      
      <VStack gap={2}>
        <Heading level={4}>Actions Concrètes</Heading>
        <ul style={{ paddingLeft: '20px' }}>
          {scoreData.actions?.map((s: string, i: number) => <li key={i}><Text>{s}</Text></li>)}
        </ul>
      </VStack>

      <HStack hAlign="end">
        <Button label={loading ? "Recalcul..." : "Recalculer le score"} onClick={fetchScore} isDisabled={loading} />
      </HStack>
    </VStack>
  );
}
