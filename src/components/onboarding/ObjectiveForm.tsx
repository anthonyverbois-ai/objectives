'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { DateInput } from '@astryxdesign/core/DateInput';
import { TimeInput } from '@astryxdesign/core/TimeInput';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { useState, useEffect } from 'react';

// Dictionnaires de temps standards en fonction de la distance
const STANDARD_TIMES: Record<string, { label: string, value: string }[]> = {
  '5000': [
    { label: 'Sub 20m', value: '00:19:59' },
    { label: 'Sub 25m', value: '00:24:59' },
    { label: 'Sub 30m', value: '00:29:59' },
  ],
  '10000': [
    { label: 'Sub 40m', value: '00:39:59' },
    { label: 'Sub 45m', value: '00:44:59' },
    { label: 'Sub 50m', value: '00:49:59' },
    { label: 'Sub 1h', value: '00:59:59' },
  ],
  '21097': [
    { label: 'Sub 1h30', value: '01:29:59' },
    { label: 'Sub 1h45', value: '01:44:59' },
    { label: 'Sub 2h', value: '01:59:59' },
  ],
  '42195': [
    { label: 'Sub 3h', value: '02:59:59' },
    { label: 'Sub 3h30', value: '03:29:59' },
    { label: 'Sub 4h', value: '03:59:59' },
    { label: 'Sub 4h30', value: '04:29:59' },
  ]
};

export default function ObjectiveForm({ onNext }: { onNext: (data: any) => void }) {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState<any>(undefined);
  
  const [distancePreset, setDistancePreset] = useState('42195');
  const [customDistance, setCustomDistance] = useState<number | null>(null);

  const [timePreset, setTimePreset] = useState<string>('other');
  const [targetTimeStr, setTargetTimeStr] = useState<string | undefined>(undefined);

  // Reset du choix de temps quand on change de distance
  useEffect(() => {
    setTimePreset('other');
    setTargetTimeStr(undefined);
  }, [distancePreset]);

  const handleSubmit = () => {
    let finalTimeStr = timePreset === 'other' ? targetTimeStr : timePreset;
    let timeInSeconds = 0;
    
    if (finalTimeStr) {
      const parts = finalTimeStr.split(':');
      const hours = parseInt(parts[0] || '0', 10);
      const minutes = parseInt(parts[1] || '0', 10);
      const seconds = parseInt(parts[2] || '0', 10);
      timeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
    }
    
    const finalDistance = distancePreset === 'other' ? (customDistance || 0) : parseFloat(distancePreset);

    if (eventName && eventDate && timeInSeconds > 0 && finalDistance > 0) {
      onNext({
        eventName,
        eventDate,
        targetTime: timeInSeconds,
        distance: finalDistance,
      });
    }
  };

  const currentStandardTimes = STANDARD_TIMES[distancePreset];

  return (
    <VStack gap={8} align="stretch">
      <VStack gap={2}>
        <Heading level={3}>Quel est ton prochain objectif ?</Heading>
        <Text color="secondary">Définissons la ligne d'arrivée ensemble, sans pression.</Text>
      </VStack>

      <FormLayout direction="vertical">
        <TextInput
          label="Nom de l'événement"
          placeholder="ex: Marathon de Paris"
          value={eventName}
          onChange={setEventName}
        />
        
        <DateInput
          label="Date de l'événement"
          value={eventDate}
          onChange={setEventDate}
          format="date_long"
        />

        <VStack gap={2} align="stretch">
          <Text size="sm" weight="medium">Distance</Text>
          <SegmentedControl value={distancePreset} onChange={setDistancePreset} label="Distance">
            <SegmentedControlItem value="5000" label="5k" />
            <SegmentedControlItem value="10000" label="10k" />
            <SegmentedControlItem value="21097" label="Semi" />
            <SegmentedControlItem value="42195" label="Marathon" />
            <SegmentedControlItem value="other" label="Autre" />
          </SegmentedControl>
          
          {distancePreset === 'other' && (
            <NumberInput
              label="Distance personnalisée (mètres)"
              value={customDistance}
              onChange={setCustomDistance}
            />
          )}
        </VStack>

        <VStack gap={2} align="stretch">
          <Text size="sm" weight="medium">Chrono cible</Text>
          
          {currentStandardTimes && (
            <SegmentedControl value={timePreset} onChange={setTimePreset} label="Chrono Rapide">
              {currentStandardTimes.map((t) => (
                <SegmentedControlItem key={t.value} value={t.value} label={t.label} />
              ))}
              <SegmentedControlItem value="other" label="Précis" />
            </SegmentedControl>
          )}

          {(!currentStandardTimes || timePreset === 'other') && (
            <TimeInput
              label={currentStandardTimes ? "Temps exact (HH:MM:SS)" : "Chrono cible (HH:MM:SS)"}
              placeholder="03:45:00"
              value={targetTimeStr as any}
              onChange={setTargetTimeStr as any}
              hourFormat="24h"
              hasSeconds={true}
              nativePicker="never"
            />
          )}
        </VStack>
      </FormLayout>

      <HStack hAlign="end" style={{ paddingTop: 'var(--spacing-4)' }}>
        <Button label="Continuer" onClick={handleSubmit} variant="primary" />
      </HStack>
    </VStack>
  );
}
