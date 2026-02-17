import mongoose from 'mongoose';
import { ACTIVITY_TYPES, INTENSITY_LEVELS } from '../config/constants.js';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(ACTIVITY_TYPES),
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  distance: {
    value: { type: Number, min: 0 },
    unit: { type: String, enum: ['km', 'mi', 'm'], default: 'km' }
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  steps: {
    type: Number,
    default: 0,
    min: 0
  },
  intensity: {
    type: String,
    enum: Object.values(INTENSITY_LEVELS),
    required: true
  },
  heartRate: {
    average: { type: Number },
    max: { type: Number },
    min: { type: Number }
  },
  route: {
    name: { type: String },
    coordinates: [{
      lat: Number,
      lng: Number,
      timestamp: Date
    }]
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  notes: {
    type: String,
    maxlength: 500
  },
  weather: {
    temperature: { type: Number },
    conditions: { type: String },
    humidity: { type: Number }
  },
  performanceMetrics: {
    pace: { type: String },
    speed: { type: Number },
    elevation: { type: Number },
    cadence: { type: Number }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
activitySchema.index({ user: 1, date: -1 });
activitySchema.index({ user: 1, type: 1, date: -1 });

// Calculate average pace if distance and duration are provided
activitySchema.pre('save', function(next) {
  if (this.distance?.value && this.duration && !this.performanceMetrics?.pace) {
    const distanceKm = this.distance.unit === 'mi' 
      ? this.distance.value * 1.60934 
      : this.distance.value;
    const durationHours = this.duration / 60;
    const paceMinPerKm = durationHours * 60 / distanceKm;
    const minutes = Math.floor(paceMinPerKm);
    const seconds = Math.round((paceMinPerKm - minutes) * 60);
    
    if (!this.performanceMetrics) this.performanceMetrics = {};
    this.performanceMetrics.pace = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  next();
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
