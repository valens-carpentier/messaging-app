const config = {
    port: process.env.PORT || 3000,
    corsOrigin: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://messaging-app-bice.vercel.app'
      ],
    databaseUrl: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
    jwtSecret: process.env.JWT_SECRET
};

module.exports = config;