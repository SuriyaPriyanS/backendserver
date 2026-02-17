export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  PREMIUM: 'premium'
};

export const ACTIVITY_TYPES = {
  RUNNING: 'running',
  WALKING: 'walking',
  CYCLING: 'cycling',
  SWIMMING: 'swimming',
  GYM: 'gym',
  YOGA: 'yoga',
  SPORTS: 'sports',
  HIKING: 'hiking',
  DANCING: 'dancing',
  OTHER: 'other'
};

export const INTENSITY_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  VERY_HIGH: 'very_high'
};

export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack'
};

export const SLEEP_PHASES = {
  LIGHT: 'light',
  DEEP: 'deep',
  REM: 'rem',
  AWAKE: 'awake'
};

export const GOAL_TYPES = {
  STEPS: 'steps',
  WEIGHT: 'weight',
  CALORIES: 'calories',
  WORKOUT_FREQUENCY: 'workout_frequency',
  WATER_INTAKE: 'water_intake',
  SLEEP_HOURS: 'sleep_hours',
  BODY_FAT: 'body_fat',
  MUSCLE_MASS: 'muscle_mass'
};

export const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
  PAUSED: 'paused'
};

export const ACHIEVEMENT_CATEGORIES = {
  STEPS: 'steps',
  NUTRITION: 'nutrition',
  SLEEP: 'sleep',
  WORKOUT: 'workout',
  STREAK: 'streak',
  MILESTONE: 'milestone'
};

export const ACHIEVEMENT_RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

export const NOTIFICATION_TYPES = {
  ACHIEVEMENT: 'achievement',
  GOAL_PROGRESS: 'goal_progress',
  REMINDER: 'reminder',
  MILESTONE: 'milestone',
  SOCIAL: 'social'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

export const WELLNESS_WEIGHTS = {
  STEPS: 0.25,
  CALORIES: 0.25,
  WATER: 0.25,
  SLEEP: 0.25
};
