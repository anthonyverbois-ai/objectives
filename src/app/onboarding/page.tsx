'use client';

import { useState } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import ObjectiveForm from '@/components/onboarding/ObjectiveForm';
import BiometricsForm from '@/components/onboarding/BiometricsForm';
import StravaConnect from '@/components/onboarding/StravaConnect';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({});

  const handleObjectiveNext = async (objData: any) => {
    setData({ ...data, objective: objData });
    setStep(2);
  };

  const handleBiometricsNext = async (bioData: any) => {
    const fullData = { ...data, biometrics: bioData };
    
    await fetch('/api/user/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullData)
    });
    
    setStep(3);
  };

  return (
    <div className="min-h-screen w-full flex items-start justify-center p-6" style={{ background: 'var(--color-surface-sunken)', paddingTop: '10vh' }}>
      <div 
        className="w-full rounded-2xl shadow-sm p-8"
        style={{ 
          maxWidth: '440px',
          background: 'var(--color-surface-default)',
          border: '1px solid var(--color-border-default)'
        }}
      >
        <VStack gap={8} align="stretch">
          <ProgressBar 
            label={`Étape ${step} sur 3`} 
            value={step} 
            max={3} 
            isLabelHidden
          />
          
          {step === 1 && <ObjectiveForm onNext={handleObjectiveNext} />}
          {step === 2 && <BiometricsForm onNext={handleBiometricsNext} />}
          {step === 3 && <StravaConnect />}
        </VStack>
      </div>
    </div>
  );
}
