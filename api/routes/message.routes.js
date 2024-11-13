const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesByRecipientID } = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/send', authenticateToken, sendMessage);
router.get('/conversation/:recipientId', authenticateToken, getMessagesByRecipientID);

module.exports = router;
