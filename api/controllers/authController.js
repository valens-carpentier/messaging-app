const passport = require("passport");
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

const registerUser = async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword
        }
      });
      
      // Remove password from response
      const { password: _, ...userData } = user;
      res.status(201).json(userData);
    } catch (error) {
      res.status(400).json({ error: "Registration failed" });
    }
  }

  const loginUser = async (req, res) => {
    try {
      // Test database connection
      await prisma.$connect();
      console.log('Successfully connected to database');

      const { email, password } = req.body;
      console.log('Attempting to find user:', email);  // Debug log
      
      const user = await prisma.user.findUnique({ where: { email } });
      console.log('User found:', user ? 'yes' : 'no');  // Debug log
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const token = jwt.sign(
        { id: user.id, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ token });
    } catch (error) {
      console.error('Detailed error:', error);  // Full error details
      res.status(400).json({ 
        error: "Login failed", 
        details: error.message,
        code: error.code 
      });
    }
  }

  module.exports = {
    registerUser,
    loginUser
  }