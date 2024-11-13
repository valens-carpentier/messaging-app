const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const messageRoutes = require("./routes/message.routes");
const profileRoutes = require("./routes/profile.routes");
const cleanup = require("./utils/cleanup");

app.use(cors({
  origin: "http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/profile", profileRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle cleanup on app termination
process.on('SIGINT', async () => {
  console.log('Cleaning up...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cleaning up...');
  await cleanup();
  process.exit(0);
});

module.exports = app;