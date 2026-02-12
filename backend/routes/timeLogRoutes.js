const express = require('express');
const router = express.Router();
const { logTime, getTimeLogs } = require('../controllers/timeLogController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTimeLogs)
    .post(protect, logTime);

module.exports = router;
