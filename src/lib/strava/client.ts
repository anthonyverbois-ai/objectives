const STRAVA_API_URL = 'https://www.strava.com/api/v3';

export async function refreshStravaToken(refreshToken: string) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  if (!response.ok) throw new Error('Failed to refresh Strava token');
  return response.json();
}

export async function fetchActivities(accessToken: string, page: number = 1) {
  const url = new URL(`${STRAVA_API_URL}/athlete/activities`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('per_page', '100');
  
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Failed to fetch activities');
  return response.json();
}

export async function fetchActivityStreams(accessToken: string, activityId: number) {
  const keys = 'time,distance,velocity_smooth,heartrate,cadence,latlng,altitude';
  const url = `${STRAVA_API_URL}/activities/${activityId}/streams?keys=${keys}&key_by_type=true`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    if (response.status === 404) return null; 
    throw new Error('Failed to fetch activity streams');
  }
  return response.json();
}
