import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  stravaAthleteId: integer('strava_athlete_id'),
  stravaAccessToken: text('strava_access_token'),
  stravaRefreshToken: text('strava_refresh_token'),
  stravaTokenExpiresAt: integer('strava_token_expires_at'),
  geminiApiKey: text('gemini_api_key'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const objectives = sqliteTable('objectives', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  eventName: text('event_name').notNull(),
  eventDate: text('event_date').notNull(),
  targetTime: integer('target_time').notNull(),
  distance: real('distance').notNull(),
  status: text('status').default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const biometrics = sqliteTable('biometrics', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  age: integer('age').notNull(),
  sex: text('sex').notNull(),
  weight: real('weight').notNull(),
  restingHR: integer('resting_hr').notNull(),
  maxHR: integer('max_hr').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  stravaId: integer('strava_id').notNull().unique(),
  name: text('name'),
  sportType: text('sport_type'),
  date: text('date').notNull(),
  distance: real('distance'),
  movingTime: integer('moving_time'),
  elapsedTime: integer('elapsed_time'),
  elevationGain: real('elevation_gain'),
  avgHeartrate: real('avg_heartrate'),
  maxHeartrate: real('max_heartrate'),
  avgCadence: real('avg_cadence'),
  avgSpeed: real('avg_speed'),
  hasStreams: integer('has_streams', { mode: 'boolean' }).default(false),
  rawStreams: text('raw_streams'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const computedMetrics = sqliteTable('computed_metrics', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  activityId: text('activity_id').references(() => activities.id),
  objectiveId: text('objective_id').references(() => objectives.id),
  avgPacePerKm: real('avg_pace_per_km'),
  aerobicEfficiency: real('aerobic_efficiency'),
  cadenceAtThreshold: real('cadence_at_threshold'),
  timeInZone1: integer('time_in_zone1'),
  timeInZone2: integer('time_in_zone2'),
  timeInZone3: integer('time_in_zone3'),
  timeInZone4: integer('time_in_zone4'),
  timeInZone5: integer('time_in_zone5'),
  computedAt: integer('computed_at', { mode: 'timestamp' }),
});

export const confidenceScores = sqliteTable('confidence_scores', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  objectiveId: text('objective_id').references(() => objectives.id),
  score: integer('score').notNull(),
  analysis: text('analysis').notNull(),
  strengths: text('strengths'),
  weaknesses: text('weaknesses'),
  actions: text('actions'),
  computedAt: integer('computed_at', { mode: 'timestamp' }),
});
