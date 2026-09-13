'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { useState } from 'react';

export default function BiometricsForm({ onNext }: { onNext: (data: any) => void }) {
  const [age, setAge] = useState<number | null>(null);
  const [sex, setSex] = useState('M');
  const [weight, setWeight] = useState<number | null>(null);
  const [restingHR, setRestingHR] = useState<number | null>(null);
  const [maxHR, setMaxHR] = useState<number | null>(null);

  const handleSubmit = () => {
    if (age && weight && restingHR && maxHR) {
      onNext({ age, sex, weight, restingHR, maxHR });
    }
  };

  return (
    <VStack gap={8} align="stretch">
      <VStack gap={2}>
        <Heading level={3}>Profil athlète</Heading>
        <Text color="secondary">Pour analyser tes données cardiaques avec précision.</Text>
      </VStack>

      <FormLayout direction="vertical">
        <FormLayout direction="horizontal">
          <NumberInput label="Âge" value={age} onChange={setAge} />
          <NumberInput label="Poids" units="kg" value={weight} onChange={setWeight} />
        </FormLayout>

        <VStack gap={2} align="stretch">
          <Text size="sm" weight="medium">Sexe (biologique)</Text>
          <SegmentedControl value={sex} onChange={setSex} label="Sexe">
            <SegmentedControlItem value="M" label="Homme" />
            <SegmentedControlItem value="F" label="Femme" />
          </SegmentedControl>
        </VStack>

        <FormLayout direction="horizontal">
          <NumberInput label="FC Repos" units="bpm" value={restingHR} onChange={setRestingHR} />
          <VStack gap={1}>
             <NumberInput label="FC Max" units="bpm" value={maxHR} onChange={setMaxHR} />
             <Text size="sm" color="secondary">Par défaut: 220 - ton âge</Text>
          </VStack>
        </FormLayout>
      </FormLayout>

      <HStack hAlign="end" style={{ paddingTop: 'var(--spacing-4)' }}>
        <Button label="Continuer" onClick={handleSubmit} variant="primary" />
      </HStack>
    </VStack>
  );
}
