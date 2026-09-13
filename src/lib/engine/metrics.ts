import { calculateKarvonenZones, getZoneForHR } from './zones';

type Streams = {
  time?: { data: number[] };
  heartrate?: { data: number[] };
  cadence?: { data: number[] };
  velocity_smooth?: { data: number[] };
};

export function computeActivityMetrics(streams: Streams, restingHR: number, maxHR: number) {
  const hrData = streams.heartrate?.data;
  const cadenceData = streams.cadence?.data;
  const velocityData = streams.velocity_smooth?.data;
  const timeData = streams.time?.data;

  const zones = calculateKarvonenZones(restingHR, maxHR);
  const timeInZones = [0, 0, 0, 0, 0, 0]; 

  let z2ValidHR = 0;
  let z2Velocity = 0;
  let z2Count = 0;

  let z4VelocitySum = 0;
  let z4Count = 0;

  if (hrData && timeData && hrData.length === timeData.length) {
    for (let i = 1; i < hrData.length; i++) {
      const hr = hrData[i];
      const deltaT = timeData[i] - timeData[i - 1];
      
      const zoneIdx = getZoneForHR(hr, zones);
      timeInZones[zoneIdx] += deltaT;

      const v = velocityData && velocityData[i] ? velocityData[i] : 0;

      // Efficience calculée uniquement en Zone 2 et si en mouvement
      if (zoneIdx === 2 && v > 0) {
        z2ValidHR += hr;
        z2Velocity += v;
        z2Count++;
      }

      // Vitesse au seuil (Z4)
      if (zoneIdx === 4 && v > 0) {
        z4VelocitySum += v;
        z4Count++;
      }
    }
  }

  // Aerobic Efficiency = Meters per Heartbeat IN ZONE 2
  // (avgVelocity * 60) / avgHR
  let aerobicEfficiency = null;
  if (z2Count > 0) {
    const avgHR = z2ValidHR / z2Count;
    const avgVelocity = z2Velocity / z2Count;
    aerobicEfficiency = (avgVelocity * 60) / avgHR;
  }

  // Vitesse au seuil en m/s
  const speedAtThreshold = z4Count > 0 ? z4VelocitySum / z4Count : null;

  return {
    timeInZone1: timeInZones[1],
    timeInZone2: timeInZones[2],
    timeInZone3: timeInZones[3],
    timeInZone4: timeInZones[4],
    timeInZone5: timeInZones[5],
    aerobicEfficiency,
    speedAtThreshold,
  };
}
