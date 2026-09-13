'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { useState } from 'react';

export default function ConfidenceScore() {
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchScore = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coach/score', { method: 'POST' });
      const data = await res.json();
      setScoreData(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!scoreData) {
    return (
      <VStack gap={4} align="center">
        <p>Pas encore de score calculé.</p>
        <Button label={loading ? "Calcul en cours..." : "Générer mon score"} onClick={fetchScore} isDisabled={loading} />
      </VStack>
    );
  }

  return (
    <VStack gap={6} style={{ background: 'var(--color-surface-default)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
      <HStack align="center" gap={4}>
        <h1 style={{ fontSize: '3rem', color: scoreData.score > 70 ? 'green' : scoreData.score > 40 ? 'orange' : 'red' }}>
          {scoreData.score}%
        </h1>
        <h2>Score de Confiance</h2>
      </HStack>
      <p style={{ fontWeight: 'bold' }}>{scoreData.summary}</p>
      
      <HStack gap={4} align="start">
        <VStack gap={2} style={{ flex: 1 }}>
          <h3 style={{ color: 'green' }}>Points Forts</h3>
          <ul style={{ paddingLeft: '20px' }}>
            {scoreData.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
          </ul>
        </VStack>
        <VStack gap={2} style={{ flex: 1 }}>
          <h3 style={{ color: 'red' }}>Points Faibles</h3>
          <ul style={{ paddingLeft: '20px' }}>
            {scoreData.weaknesses?.map((s: string, i: number) => <li key={i}>{s}</li>)}
          </ul>
        </VStack>
      </HStack>
      
      <VStack gap={2}>
        <h3>Actions Concrètes</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {scoreData.actions?.map((s: string, i: number) => <li key={i}>{s}</li>)}
        </ul>
      </VStack>

      <Button label={loading ? "Recalcul..." : "Recalculer le score"} onClick={fetchScore} isDisabled={loading} />
    </VStack>
  );
}
