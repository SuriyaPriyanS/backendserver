import mongoose from 'mongoose';

const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  earned: {
    type: Boolean,
    default: false
  },
  earnedDate: {
    type: Date
  },
  progress: {
    current: { type: Number, default: 0 },
    target: { type: Number }
  },
  notified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure one achievement per user
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

// Index for queries
userAchievementSchema.index({ user: 1, earned: 1 });

// Method to unlock achievement
userAchievementSchema.methods.unlock = function() {
  this.earned = true;
  this.earnedDate = new Date();
  return this.save();
};

const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

export default UserAchievement;
