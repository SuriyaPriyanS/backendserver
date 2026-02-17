import mongoose from 'mongoose';

const healthMetricSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  steps: {
    current: { type: Number, default: 0 },
    target: { type: Number, default: 10000 },
    distance: { type: Number, default: 0 }, // in km
    activeMinutes: { type: Number, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
    avgPace: { type: String }
  },
  calories: {
    consumed: { type: Number, default: 0 },
    burned: { type: Number, default: 0 },
    target: { type: Number, default: 2000 },
    remaining: { type: Number, default: 2000 },
    basalRate: { type: Number, default: 1680 },
    macros: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 }
    }
  },
  water: {
    current: { type: Number, default: 0 }, // in ml
    target: { type: Number, default: 2500 },
    glasses: { type: Number, default: 0 },
    lastIntake: { type: Date },
    hydrationLevel: { type: Number, default: 0 } // percentage
  },
  sleep: {
    duration: { type: Number, default: 0 }, // in hours
    target: { type: Number, default: 8 },
    quality: { type: Number, default: 0, min: 0, max: 100 },
    deepSleep: { type: Number, default: 0 },
    lightSleep: { type: Number, default: 0 },
    remSleep: { type: Number, default: 0 },
    bedtime: { type: String },
    wakeTime: { type: String }
  },
  heartRate: {
    resting: { type: Number },
    average: { type: Number },
    max: { type: Number },
    min: { type: Number }
  },
  bloodPressure: {
    systolic: { type: Number },
    diastolic: { type: Number },
    timestamp: { type: Date }
  },
  weight: {
    value: { type: Number },
    unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' }
  }
}, {
  timestamps: true
});

// Compound index for user and date (ensures one record per user per day)
healthMetricSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate remaining calories
healthMetricSchema.pre('save', function(next) {
  if (this.calories) {
    this.calories.remaining = this.calories.target - (this.calories.consumed - this.calories.burned);
  }
  if (this.water) {
    this.water.glasses = this.water.current / 250;
    this.water.hydrationLevel = Math.round((this.water.current / this.water.target) * 100);
  }
  next();
});

// Method to update steps
healthMetricSchema.methods.addSteps = function(steps, distance, activeMinutes, caloriesBurned) {
  this.steps.current += steps;
  if (distance) this.steps.distance += distance;
  if (activeMinutes) this.steps.activeMinutes += activeMinutes;
  if (caloriesBurned) {
    this.steps.caloriesBurned += caloriesBurned;
    this.calories.burned += caloriesBurned;
  }
  return this.save();
};

// Method to log water intake
healthMetricSchema.methods.addWater = function(amount) {
  this.water.current += amount;
  this.water.lastIntake = new Date();
  return this.save();
};

// Method to log meal
healthMetricSchema.methods.addMeal = function(calories, macros = {}) {
  this.calories.consumed += calories;
  if (macros.protein) this.calories.macros.protein += macros.protein;
  if (macros.carbs) this.calories.macros.carbs += macros.carbs;
  if (macros.fat) this.calories.macros.fat += macros.fat;
  if (macros.fiber) this.calories.macros.fiber += macros.fiber;
  return this.save();
};

const HealthMetric = mongoose.model('HealthMetric', healthMetricSchema);

export default HealthMetric;
