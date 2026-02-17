import mongoose from 'mongoose';
import { GOAL_TYPES, GOAL_STATUS } from '../config/constants.js';

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(GOAL_TYPES),
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  currentValue: {
    type: Number,
    required: true,
    default: 0
  },
  targetValue: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(GOAL_STATUS),
    default: GOAL_STATUS.ACTIVE
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  milestones: [{
    value: { type: Number, required: true },
    achieved: { type: Boolean, default: false },
    achievedDate: { type: Date }
  }],
  completedDate: {
    type: Date
  },
  category: {
    type: String,
    enum: ['fitness', 'nutrition', 'wellness', 'lifestyle']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate progress before saving
goalSchema.pre('save', function(next) {
  if (this.currentValue && this.targetValue) {
    this.progress = Math.min(
      Math.round((this.currentValue / this.targetValue) * 100),
      100
    );
    
    // Auto-complete goal if target is reached
    if (this.progress >= 100 && this.status === GOAL_STATUS.ACTIVE) {
      this.status = GOAL_STATUS.COMPLETED;
      this.completedDate = new Date();
    }
  }
  next();
});

// Indexes
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, type: 1 });

// Method to update progress
goalSchema.methods.updateProgress = function(newValue) {
  this.currentValue = newValue;
  
  // Check milestones
  if (this.milestones && this.milestones.length > 0) {
    this.milestones.forEach(milestone => {
      if (!milestone.achieved && this.currentValue >= milestone.value) {
        milestone.achieved = true;
        milestone.achievedDate = new Date();
      }
    });
  }
  
  return this.save();
};

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
