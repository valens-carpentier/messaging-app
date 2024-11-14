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
      await prisma.$connect();
      const { email, password } = req.body;
      
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Update user status to ONLINE
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'ONLINE' }
      });
      
      const token = jwt.sign(
        { id: user.id, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log('Generated token:', token.substring(0, 20) + '...');
      
      res.json({ token });
    } catch (error) {
      console.error('Detailed error:', error);
      res.status(400).json({ 
        error: "Login failed", 
        details: error.message,
        code: error.code 
      });
    }
  }

  const logoutUser = async (req, res) => {
    try {
      const userId = req.user.id; // From auth middleware
      
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'OFFLINE' }
      });
      
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(400).json({ error: "Logout failed" });
    }
  }

  module.exports = {
    registerUser,
    loginUser,
    logoutUser
  }