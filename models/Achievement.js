import mongoose from 'mongoose';
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_RARITY } from '../config/constants.js';

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: Object.values(ACHIEVEMENT_CATEGORIES),
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  rarity: {
    type: String,
    enum: Object.values(ACHIEVEMENT_RARITY),
    default: ACHIEVEMENT_RARITY.COMMON
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  criteria: {
    type: {
      type: String,
      enum: ['value', 'streak', 'count', 'custom'],
      required: true
    },
    metric: {
      type: String
    },
    threshold: {
      type: Number
    },
    condition: {
      type: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
achievementSchema.index({ category: 1, isActive: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;
