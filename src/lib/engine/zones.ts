export type HeartRateZones = {
  z1: [number, number];
  z2: [number, number];
  z3: [number, number];
  z4: [number, number];
  z5: [number, number];
};

export function calculateKarvonenZones(restingHR: number, maxHR: number): HeartRateZones {
  const hrr = maxHR - restingHR; // Heart Rate Reserve
  
  const getZoneLimit = (percent: number) => Math.round(restingHR + (hrr * percent));

  return {
    z1: [getZoneLimit(0.50), getZoneLimit(0.60)], // 50-60%
    z2: [getZoneLimit(0.60), getZoneLimit(0.70)], // 60-70%
    z3: [getZoneLimit(0.70), getZoneLimit(0.80)], // 70-80%
    z4: [getZoneLimit(0.80), getZoneLimit(0.90)], // 80-90%
    z5: [getZoneLimit(0.90), getZoneLimit(1.00)], // 90-100%
  };
}

export function getZoneForHR(hr: number, zones: HeartRateZones): number {
  if (hr < zones.z1[0]) return 0;
  if (hr < zones.z2[0]) return 1;
  if (hr < zones.z3[0]) return 2;
  if (hr < zones.z4[0]) return 3;
  if (hr < zones.z5[0]) return 4;
  return 5;
}
