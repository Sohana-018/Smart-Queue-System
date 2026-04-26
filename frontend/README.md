# 🕒 Smart Queue System with Real-Time Analytics

A full-stack MERN application designed to optimize customer waiting experiences through gamification and real-time data tracking.

## 🌟 Key Features
- **Gamified Waiting:** Integrated Snake Game to keep customers engaged.
- **Live Tech Feed:** Interactive, clickable news ticker fetching live data from The Verge via RSS.
- **FIFO Automation:** Backend logic handles queue flow automatically.
- **Data Insights:** Admin dashboard calculates real-time metrics like **Average Wait Time** and **Total Throughput**.

## 📊 Data Analysis Focus
This project tracks the lifecycle of a ticket from `joinedAt` to `completedAt`. By calculating the difference, the system provides staff with actionable service-speed metrics.

## 🛠️ Tech Stack
- **Frontend:** React.js, Axios, CSS Keyframes
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **APIs:** RSS-to-JSON for live news

## 🚀 Setup
1. Clone the repository.
2. In `/backend`, create a `.env` file with `MONGO_URI`.
3. Run `npm install` in both folders.
4. Use `npm start` for the backend and `npm run dev` for the frontend.
