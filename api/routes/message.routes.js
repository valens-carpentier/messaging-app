const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getMessagesByRecipientID, 
  getConversations, 
  getAvailableUsers,
  upload 
} = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/send', authenticateToken, upload.single('image'), sendMessage);
router.get('/conversation/:recipientId', authenticateToken, getMessagesByRecipientID);
router.get('/conversations', authenticateToken, getConversations);
router.get('/available-users', authenticateToken, getAvailableUsers);

module.exports = router;
