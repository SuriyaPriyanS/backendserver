import mongoose from 'mongoose';
import { MEAL_TYPES } from '../config/constants.js';

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  calories: { type: Number, required: true },
  macros: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 }
  },
  micronutrients: {
    vitamins: { type: Map, of: Number },
    minerals: { type: Map, of: Number }
  }
}, { _id: false });

const mealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mealType: {
    type: String,
    enum: Object.values(MEAL_TYPES),
    required: true
  },
  foods: [foodItemSchema],
  totalCalories: {
    type: Number,
    required: true,
    default: 0
  },
  totalMacros: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 }
  },
  image: {
    url: { type: String },
    publicId: { type: String }
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  time: {
    type: String
  },
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [{ type: String }]
}, {
  timestamps: true
});

// Calculate totals before saving
mealSchema.pre('save', function(next) {
  if (this.foods && this.foods.length > 0) {
    let totalCalories = 0;
    const totalMacros = { protein: 0, carbs: 0, fat: 0, fiber: 0 };
    
    this.foods.forEach(food => {
      totalCalories += food.calories || 0;
      totalMacros.protein += food.macros?.protein || 0;
      totalMacros.carbs += food.macros?.carbs || 0;
      totalMacros.fat += food.macros?.fat || 0;
      totalMacros.fiber += food.macros?.fiber || 0;
    });
    
    this.totalCalories = totalCalories;
    this.totalMacros = totalMacros;
  }
  next();
});

// Index for efficient queries
mealSchema.index({ user: 1, date: -1 });
mealSchema.index({ user: 1, mealType: 1, date: -1 });

const Meal = mongoose.model('Meal', mealSchema);

export default Meal;
