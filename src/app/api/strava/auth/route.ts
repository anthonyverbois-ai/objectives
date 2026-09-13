import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Missing Strava configuration' }, { status: 500 });
  }

  const scope = 'activity:read_all,profile:read_all';
  const url = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&approval_prompt=auto&scope=${scope}`;
  
  return NextResponse.redirect(url);
}
