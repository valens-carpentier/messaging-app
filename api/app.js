const express = require("express");
const app = express();
const cors = require("cors");
const config = require("./config/config");
const authRoutes = require("./routes/auth.routes");
const messageRoutes = require("./routes/message.routes");
const profileRoutes = require("./routes/profile.routes");
const cleanup = require("./utils/cleanup");
const path = require('path');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set!');
  process.exit(1);
}

if (!config.corsOrigin || config.corsOrigin.length === 0) {
  console.error('CORS_ORIGIN is not properly configured!');
  process.exit(1);
}

const corsOptions = {
  origin: function(origin, callback) {
    console.log('Request origin:', origin);
    console.log('Allowed origins:', config.corsOrigin);
    
    if (!origin || config.corsOrigin.includes(origin)) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
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