import dotenv from 'dotenv';
import connectDatabase from '../config/database.js';
import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_RARITY } from '../config/constants.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('📦 Seeding database...\n');

    // Connect to MongoDB
    await connectDatabase();

    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('✅ Cleared existing achievements');

    // Create predefined achievements
    const achievements = [
      {
        title: 'First Steps',
        description: 'Complete your first workout',
        category: ACHIEVEMENT_CATEGORIES.WORKOUT,
        icon: '👟',
        rarity: ACHIEVEMENT_RARITY.COMMON,
        points: 10,
        criteria: { type: 'count', metric: 'activities', threshold: 1 }
      },
      {
        title: 'Consistency King',
        description: 'Maintain a 7-day streak',
        category: ACHIEVEMENT_CATEGORIES.STREAK,
        icon: '🔥',
        rarity: ACHIEVEMENT_RARITY.RARE,
        points: 30,
        criteria: { type: 'streak', metric: 'currentStreak', threshold: 7 }
      },
      {
        title: 'Marathon Master',
        description: 'Maintain a 30-day streak',
        category: ACHIEVEMENT_CATEGORIES.STREAK,
        icon: '👑',
        rarity: ACHIEVEMENT_RARITY.EPIC,
        points: 100,
        criteria: { type: 'streak', metric: 'currentStreak', threshold: 30 }
      },
      {
        title: 'Step Counter',
        description: 'Reach 10,000 steps in a day',
        category: ACHIEVEMENT_CATEGORIES.STEPS,
        icon: '🚶',
        rarity: ACHIEVEMENT_RARITY.COMMON,
        points: 15,
        criteria: { type: 'value', metric: 'steps.current', threshold: 10000 }
      },
      {
        title: 'Distance Warrior',
        description: 'Reach 20,000 steps in a day',
        category: ACHIEVEMENT_CATEGORIES.STEPS,
        icon: '🏃',
        rarity: ACHIEVEMENT_RARITY.RARE,
        points: 40,
        criteria: { type: 'value', metric: 'steps.current', threshold: 20000 }
      },
      {
        title: 'Hydration Hero',
        description: 'Meet your water goal for the day',
        category: ACHIEVEMENT_CATEGORIES.NUTRITION,
        icon: '💧',
        rarity: ACHIEVEMENT_RARITY.COMMON,
        points: 10,
        criteria: { type: 'value', metric: 'water.current', threshold: 2500 }
      },
      {
        title: 'Early Bird',
        description: 'Log 10 workouts',
        category: ACHIEVEMENT_CATEGORIES.WORKOUT,
        icon: '⏰',
        rarity: ACHIEVEMENT_RARITY.COMMON,
        points: 25,
        criteria: { type: 'count', metric: 'activities', threshold: 10 }
      },
      {
        title: 'Fitness Enthusiast',
        description: 'Log 50 workouts',
        category: ACHIEVEMENT_CATEGORIES.WORKOUT,
        icon: '🏋️',
        rarity: ACHIEVEMENT_RARITY.EPIC,
        points: 75,
        criteria: { type: 'count', metric: 'activities', threshold: 50 }
      },
      {
        title: 'Sleep Champion',
        description: 'Get 8 hours of sleep',
        category: ACHIEVEMENT_CATEGORIES.SLEEP,
        icon: '😴',
        rarity: ACHIEVEMENT_RARITY.COMMON,
        points: 15,
        criteria: { type: 'value', metric: 'sleep.duration', threshold: 8 }
      },
      {
        title: 'Century Club',
        description: 'Log 100 activities',
        category: ACHIEVEMENT_CATEGORIES.MILESTONE,
        icon: '💯',
        rarity: ACHIEVEMENT_RARITY.LEGENDARY,
        points: 150,
        criteria: { type: 'count', metric: 'activities', threshold: 100 }
      }
    ];

    await Achievement.insertMany(achievements);
    console.log(`✅ Created ${achievements.length} achievements\n`);

    console.log('📋 Achievement Summary:');
    const countByCategory = {};
    const countByRarity = {};
    
    achievements.forEach(a => {
      countByCategory[a.category] = (countByCategory[a.category] || 0) + 1;
      countByRarity[a.rarity] = (countByRarity[a.rarity] || 0) + 1;
    });

    console.log('\nBy Category:');
    Object.entries(countByCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

    console.log('\nBy Rarity:');
    Object.entries(countByRarity).forEach(([rarity, count]) => {
      console.log(`  ${rarity}: ${count}`);
    });

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
