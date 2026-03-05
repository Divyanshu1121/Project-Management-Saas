const express = require('express');
const router = express.Router();
const { getGlobalMessages, getProjectMessages, getMentionSuggestions, uploadFile } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/global', protect, getGlobalMessages);
router.get('/project/:projectId', protect, getProjectMessages);
router.get('/mentions/suggestions', protect, getMentionSuggestions);
router.post('/upload', protect, upload.single('attachment'), uploadFile);

module.exports = router;
