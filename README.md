# Vira1ine 🚀

**AI-Powered Content Analytics Platform for Gen Z Creators**

Vira1ine helps social media creators track trends, find optimal posting times, and grow their audience with data-driven AI insights.

![Vira1ine](https://img.shields.io/badge/MERN-Stack-blue) ![AI Powered](https://img.shields.io/badge/AI-Powered-purple)

## ✨ Features

- 📊 **Real-time Analytics Dashboard** - Track views, likes, comments, and engagement across all platforms
- ⏰ **Optimal Posting Times** - AI-powered recommendations based on your historical performance
- 🎯 **Trend Analysis** - Stay ahead with Gen Z content trends and viral predictions
- 🤖 **AI Content Insights** - Get content suggestions and performance predictions
- 📱 **Multi-Platform Support** - Track Instagram, TikTok, YouTube, Twitter, and more
- 📈 **Growth Tracking** - Monitor your progress with detailed charts and metrics
- #️⃣ **Hashtag Performance** - Discover which hashtags drive the most engagement
- 🎨 **Beautiful Dark UI** - Modern, Gen Z-friendly interface with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React** 18 with Vite
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Zustand** for state management
- **Framer Motion** for animations
- **Socket.io Client** for real-time updates
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **OpenAI API** for AI-powered insights
- **Socket.io** for real-time features
- **Bcrypt** for password hashing
- **Helmet** for security
- **Express Rate Limit** for API protection

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd content-analytics-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   **Server** (`.env` in `/server`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/vira1ine
   JWT_SECRET=your_super_secret_jwt_key
   OPENAI_API_KEY=your_openai_api_key_here
   CLIENT_URL=http://localhost:5173
   ```

   **Client** (`.env` in `/client`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both client and server)
   npm run dev

   # Or run separately:
   npm run server  # Backend on port 5000
   npm run client  # Frontend on port 5173
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
vira1ine/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand stores
│   │   ├── styles/        # Global styles
│   │   └── App.jsx        # Main app component
│   ├── index.html
│   └── package.json
│
├── server/                # Node.js backend
│   ├── middleware/        # Auth middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── server.js         # Express server
│   └── package.json
│
└── package.json          # Root package.json
```

## 🎯 Key Features Explained

### 1. Analytics Dashboard
- View all your content metrics in one place
- Filter by daily, weekly, or monthly periods
- Interactive charts showing engagement over time
- Platform breakdown and content type performance

### 2. Posts Management
- Add and track posts from multiple platforms
- Update metrics as they grow
- Filter by platform
- View engagement rates and performance

### 3. Optimal Posting Times
- AI analyzes your historical post performance
- Recommends best days and times to post
- Shows average engagement for each time slot
- Helps maximize reach and engagement

### 4. AI Trends (Pro Feature)
- Trending topics for Gen Z audience
- Personalized content suggestions
- Recommended hashtags
- Platform-specific advice

### 5. Profile Management
- Update account information
- Connect social media accounts
- View subscription status

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `PUT /api/posts/:id/metrics` - Update metrics

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/posting-times` - Get optimal posting times
- `GET /api/analytics/growth-trends` - Get growth trends

### AI Features (Pro/Enterprise)
- `POST /api/ai/analyze-post/:id` - Analyze specific post
- `POST /api/ai/analyze-new` - Analyze draft content
- `GET /api/ai/trending-insights` - Get trending insights
- `GET /api/ai/performance-report` - Get AI performance report
- `GET /api/ai/content-ideas` - Get content ideas

## 🎨 Color Scheme

```css
Primary Blue:   #0ea5e9
Accent Purple:  #d946ef
Background:     #030712 (gray-950)
Cards:          #111827 (gray-900)
```

## 🔮 Future Enhancements

- [ ] Social media OAuth integration
- [ ] Automated post scheduling
- [ ] Team collaboration features
- [ ] Advanced AI predictions
- [ ] Export reports to PDF
- [ ] Mobile app
- [ ] Browser extension
- [ ] Competitor analysis

## 📝 License

MIT License - feel free to use this project for your portfolio or commercial purposes!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👨‍💻 Developer

**Developed by Lanz Andrei Colico**

---

**Happy Creating! 🎉**
