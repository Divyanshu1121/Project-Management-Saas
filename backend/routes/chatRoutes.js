const express = require('express');
const router = express.Router();
const { getGlobalMessages, getProjectMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/global', protect, getGlobalMessages);
router.get('/project/:projectId', protect, getProjectMessages);

module.exports = router;
