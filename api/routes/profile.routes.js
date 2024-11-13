const express = require('express');
const router = express.Router();
const { updateProfile, getProfile } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth.middleware');

router.put('/update', authenticateToken, updateProfile);
router.get('/', authenticateToken, getProfile);

module.exports = router;