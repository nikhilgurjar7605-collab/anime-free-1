const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Get watch history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({ path: 'watchHistory.video', select: 'title thumbnail duration views' });
    res.json({ history: user.watchHistory.reverse().slice(0, 50) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
