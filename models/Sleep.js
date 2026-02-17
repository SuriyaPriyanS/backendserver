import mongoose from 'mongoose';
import { SLEEP_PHASES } from '../config/constants.js';

const sleepPhaseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(SLEEP_PHASES),
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  }
}, { _id: false });

const sleepSchema = new mongoose.Schema({
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
  bedtime: {
    type: String,
    required: true
  },
  wakeTime: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 0
  },
  quality: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  consistency: {
    type: Number,
    min: 0,
    max: 100,
    default: 85
  },
  phases: [sleepPhaseSchema],
  interruptions: {
    type: Number,
    default: 0,
    min: 0
  },
  restfulness: {
    type: Number,
    min: 0,
    max: 100
  },
  environmentalFactors: {
    temperature: { type: Number },
    noise: { type: String, enum: ['quiet', 'moderate', 'loud'] },
    light: { type: String, enum: ['dark', 'dim', 'bright'] }
  },
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [{ type: String }],
  mood: {
    beforeSleep: { 
      type: String, 
      enum: ['excellent', 'good', 'neutral', 'poor', 'terrible'] 
    },
    afterWake: { 
      type: String, 
      enum: ['excellent', 'good', 'neutral', 'poor', 'terrible'] 
    }
  }
}, {
  timestamps: true
});

// Calculate phase percentages before saving
sleepSchema.pre('save', function(next) {
  if (this.phases && this.phases.length > 0 && this.durationMinutes) {
    const totalDuration = this.phases.reduce((sum, phase) => sum + phase.duration, 0);
    this.phases.forEach(phase => {
      phase.percentage = Math.round((phase.duration / totalDuration) * 100);
    });
  }
  next();
});

// Index for unique sleep record per user per date
sleepSchema.index({ user: 1, date: 1 }, { unique: true });

// Method to calculate sleep efficiency
sleepSchema.methods.calculateEfficiency = function() {
  if (!this.phases || this.phases.length === 0) return 0;
  
  const awakePhase = this.phases.find(p => p.type === SLEEP_PHASES.AWAKE);
  const awakeDuration = awakePhase ? awakePhase.duration : 0;
  const totalDuration = this.phases.reduce((sum, phase) => sum + phase.duration, 0);
  const sleepDuration = totalDuration - awakeDuration;
  
  return Math.round((sleepDuration / totalDuration) * 100);
};

const Sleep = mongoose.model('Sleep', sleepSchema);

export default Sleep;
