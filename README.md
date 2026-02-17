# Health & Wellness Backend API

A comprehensive, production-ready backend API for a health and wellness tracking application built with Node.js, Express.js, and MongoDB.

## 🌟 Features

### Core Features
- ✅ **User Authentication & Authorization** - JWT-based auth with refresh tokens
- ✅ **Health Metrics Tracking** - Steps, calories, water intake, sleep monitoring
- ✅ **Nutrition Tracking** - Meal logging with macronutrient breakdown and image uploads
- ✅ **Activity Tracking** - Workout logging with comprehensive performance metrics
- ✅ **Sleep Analysis** - Sleep phase tracking, quality scoring, and pattern analysis
- ✅ **Goals Management** - Create, track, and complete personal health goals
- ✅ **Achievements System** - Gamification with auto-unlocking achievements
- ✅ **Dashboard Analytics** - Comprehensive health insights and wellness scoring

### Advanced Features
- 📊 **Trend Analysis** - Historical data tracking and pattern recognition
- 🎯 **Progress Tracking** - Goal milestones and achievement progress
- 📈 **Analytics** - Nutrition analytics, activity statistics, sleep analysis
- 🔒 **Secure** - Helmet.js security, JWT authentication, input validation
- 📁 **File Upload** - Cloudinary integration for image storage
- 🎨 **Well Structured** - Clean MVC architecture with separation of concerns

## 🛠️ Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Validation**: express-validator
- **Security**: Helmet, bcryptjs, CORS
- **Environment**: dotenv
- **Logging**: Morgan

## 📋 Prerequisites

Before running this application, ensure you have:

- Node.js (v16 or higher)
- MongoDB (v5 or higher) - Local installation or MongoDB Atlas account
- Cloudinary account (for image uploads) - Optional but recommended

## 🚀 Getting Started

### 1. Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/health_wellness_db
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/health_wellness_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service
# On Windows:
net start MongoDB

# On macOS/Linux:
sudo systemctl start mongod
```

**Option B: MongoDB Atlas**
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in `.env`

### 4. Seed Database (Optional)

Populate the database with initial achievements:

```bash
npm run seed
```

### 5. Run the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:4000`

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "dateOfBirth": "1990-01-15",
  "gender": "male"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Health Metrics Endpoints

#### Get Today's Metrics
```http
GET /api/health/metrics/today
Authorization: Bearer <token>
```

#### Update Steps
```http
PUT /api/health/metrics/steps
Authorization: Bearer <token>
Content-Type: application/json

{
  "steps": 5000,
  "distance": 3.5,
  "activeMinutes": 45,
  "caloriesBurned": 250
}
```

#### Log Water Intake
```http
PUT /api/health/metrics/water
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 250
}
```

#### Get Wellness Score
```http
GET /api/health/wellness-score
Authorization: Bearer <token>
```

#### Get Metric Trends
```http
GET /api/health/trends?metric=steps&days=7
Authorization: Bearer <token>
```

### Nutrition Endpoints

#### Log Meal
```http
POST /api/nutrition/meals
Authorization: Bearer <token>
Content-Type: application/json

{
  "mealType": "breakfast",
  "foods": [
    {
      "name": "Oatmeal",
      "quantity": 1,
      "unit": "bowl",
      "calories": 300,
      "macros": {
        "protein": 10,
        "carbs": 50,
        "fat": 5,
        "fiber": 8
      }
    }
  ],
  "date": "2024-01-05",
  "time": "08:00",
  "notes": "Healthy breakfast"
}
```

#### Get Meals
```http
GET /api/nutrition/meals?page=1&limit=20&mealType=breakfast
Authorization: Bearer <token>
```

#### Upload Meal Image
```http
POST /api/nutrition/meals/:id/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

#### Get Nutrition Analytics
```http
GET /api/nutrition/analytics?days=7
Authorization: Bearer <token>
```

### Activity Endpoints

#### Log Activity
```http
POST /api/activities
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "running",
  "name": "Morning Run",
  "duration": 30,
  "distance": { "value": 5, "unit": "km" },
  "calories": 300,
  "steps": 6000,
  "intensity": "moderate",
  "date": "2024-01-05",
  "notes": "Great run in the park"
}
```

#### Get Activities
```http
GET /api/activities?page=1&limit=20&type=running
Authorization: Bearer <token>
```

#### Get Activity Statistics
```http
GET /api/activities/stats?days=30
Authorization: Bearer <token>
```

### Sleep Endpoints

#### Log Sleep
```http
POST /api/sleep
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-05",
  "bedtime": "22:30",
  "wakeTime": "06:30",
  "duration": "8h",
  "durationMinutes": 480,
  "quality": 85,
  "phases": [
    { "type": "light", "duration": 120 },
    { "type": "deep", "duration": 180 },
    { "type": "rem", "duration": 150 },
    { "type": "awake", "duration": 30 }
  ]
}
```

#### Get Sleep Analysis
```http
GET /api/sleep/analysis?days=30
Authorization: Bearer <token>
```

### Goals Endpoints

#### Create Goal
```http
POST /api/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "steps",
  "title": "Walk 10,000 steps daily",
  "description": "Maintain 10k steps for a month",
  "currentValue": 0,
  "targetValue": 300000,
  "unit": "steps",
  "targetDate": "2024-02-05",
  "category": "fitness"
}
```

#### Get Goals
```http
GET /api/goals?status=active
Authorization: Bearer <token>
```

#### Complete Goal
```http
POST /api/goals/:id/complete
Authorization: Bearer <token>
```

### Achievements Endpoints

#### Get All Achievements
```http
GET /api/achievements
Authorization: Bearer <token>
```

#### Get User's Earned Achievements
```http
GET /api/achievements/user
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### Get Dashboard Data
```http
GET /api/dashboard
Authorization: Bearer <token>
```

#### Get Daily Summary
```http
GET /api/dashboard/summary?date=2024-01-05
Authorization: Bearer <token>
```

#### Get Insights
```http
GET /api/dashboard/insights
Authorization: Bearer <token>
```

## 🗂️ Project Structure

```
backend/
├── config/
│   ├── constants.js      # Application constants and enums
│   └── database.js       # MongoDB connection configuration
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── healthMetricController.js
│   ├── nutritionController.js
│   ├── activityController.js
│   ├── sleepController.js
│   ├── goalController.js
│   ├── achievementController.js
│   └── dashboardController.js
├── middleware/
│   ├── auth.js          # JWT authentication middleware
│   ├── errorHandler.js  # Error handling middleware
│   ├── upload.js        # File upload middleware
│   └── validation.js    # Request validation middleware
├── models/
│   ├── User.js
│   ├── HealthMetric.js
│   ├── Meal.js
│   ├── Activity.js
│   ├── Sleep.js
│   ├── Goal.js
│   ├── Achievement.js
│   └── UserAchievement.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── health.js
│   ├── nutrition.js
│   ├── activities.js
│   ├── sleep.js
│   ├── goals.js
│   ├── achievements.js
│   └── dashboard.js
├── scripts/
│   └── seedDatabase.js  # Database seeding script
├── utils/
│   └── cloudinary.js    # Cloudinary configuration
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js           # Main application entry point
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-Origin Resource Sharing protection
- **JWT** - Secure token-based authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation and sanitization
- **Cookie security** - httpOnly and secure flags
- **Rate limiting ready** - Can be easily integrated

## 🎯 Key Features Explained

### Wellness Score Calculation
The wellness score is calculated based on four key metrics with equal weights:
- **Steps**: Progress toward daily step goal (25%)
- **Calories**: Calorie balance (25%)
- **Water**: Hydration level (25%)
- **Sleep**: Sleep duration vs target (25%)

### Achievement System
Achievements are automatically checked and unlocked based on:
- **Value-based**: Reaching specific metric thresholds
- **Count-based**: Completing a certain number of activities
- **Streak-based**: Maintaining consecutive days of activity

### Goal Tracking
Goals support:
- Multiple goal types (steps, weight, calories, etc.)
- Progress tracking with percentage completion
- Milestones with achievement dates
- Status management (active, completed, abandoned)

## 🧪 Testing the API

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Using Postman
1. Import the API endpoints
2. Set up an environment variable for the token
3. Use the token in Authorization header: `Bearer <token>`

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Verify network access if using MongoDB Atlas

### Port Already in Use
```bash
# Find process using port 4000
netstat -ano | findstr :4000

# Kill the process (Windows)
taskkill /PID <process_id> /F
```

### Cloudinary Upload Errors
- Verify Cloudinary credentials in `.env`
- Check file size limits (default 5MB)
- Ensure supported file types (JPEG, PNG, WebP)

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Server port | No | 4000 |
| NODE_ENV | Environment | No | development |
| MONGODB_URI | MongoDB connection string | Yes | - |
| JWT_SECRET | JWT secret key | Yes | - |
| JWT_REFRESH_SECRET | Refresh token secret | Yes | - |
| JWT_EXPIRES_IN | Token expiration | No | 24h |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | No | - |
| CLOUDINARY_API_KEY | Cloudinary API key | No | - |
| CLOUDINARY_API_SECRET | Cloudinary API secret | No | - |
| FRONTEND_URL | Frontend URL for CORS | No | http://localhost:5173 |

## 🚀 Deployment

### Deploying to Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main
```

### Deploying to Railway/Render
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically on push

## 📊 Performance Considerations

- **Database Indexing**: All frequently queried fields are indexed
- **Pagination**: Implemented for all list endpoints
- **Lean Queries**: Using Mongoose lean() where appropriate
- **Connection Pooling**: MongoDB connection pool configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Contact & Support

For bugs, feature requests, or questions:
- Create an issue in the repository
- Email: support@healthwellness.com

---

Built with ❤️ using Node.js, Express.js, and MongoDB
