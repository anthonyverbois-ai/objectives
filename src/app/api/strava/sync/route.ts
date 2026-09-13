import { NextResponse } from 'next/server';
import { syncUserActivities } from '@/lib/strava/sync';
import { LOCAL_USER_ID } from '../callback/route';

export async function POST() {
  try {
    await syncUserActivities(LOCAL_USER_ID);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
