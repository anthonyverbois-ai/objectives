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
  const timeInZones = [0, 0, 0, 0, 0, 0]; // index 0 is below Z1

  let totalValidHR = 0;
  let hrCount = 0;
  let totalPace = 0; // sum of seconds per km
  let paceCount = 0;

  let z4CadenceSum = 0;
  let z4CadenceCount = 0;

  if (hrData && timeData && hrData.length === timeData.length) {
    for (let i = 1; i < hrData.length; i++) {
      const hr = hrData[i];
      const deltaT = timeData[i] - timeData[i - 1];
      
      const zoneIdx = getZoneForHR(hr, zones);
      timeInZones[zoneIdx] += deltaT;

      totalValidHR += hr;
      hrCount++;

      // Cadence at threshold (Z4)
      if (zoneIdx === 4 && cadenceData && cadenceData[i]) {
        z4CadenceSum += cadenceData[i] * 2; // Strava usually provides 1 leg SPM, multiply by 2
        z4CadenceCount++;
      }
    }
  }

  if (velocityData && hrData) {
    for (let i = 0; i < velocityData.length; i++) {
      const v = velocityData[i];
      if (v > 0) {
        const paceSecKm = 1000 / v;
        totalPace += paceSecKm;
        paceCount++;
      }
    }
  }

  const avgHR = hrCount > 0 ? totalValidHR / hrCount : null;
  const avgPacePerKm = paceCount > 0 ? totalPace / paceCount : null;
  const aerobicEfficiency = (avgPacePerKm && avgHR) ? avgPacePerKm / avgHR : null;
  const cadenceAtThreshold = z4CadenceCount > 0 ? z4CadenceSum / z4CadenceCount : null;

  return {
    timeInZone1: timeInZones[1],
    timeInZone2: timeInZones[2],
    timeInZone3: timeInZones[3],
    timeInZone4: timeInZones[4],
    timeInZone5: timeInZones[5],
    avgPacePerKm,
    aerobicEfficiency,
    cadenceAtThreshold,
  };
}
