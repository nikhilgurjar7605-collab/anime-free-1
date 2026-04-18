const express = require('express');
const router = express.Router();
const {
  getStats, getUsers, toggleBan,
  toggleAdmin, getAllVideos, broadcastMessage
} = require('../controllers/adminController');
const { adminMiddleware } = require('../middleware/auth');

router.use(adminMiddleware);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/videos', getAllVideos);
router.put('/users/:id/ban', toggleBan);
router.put('/users/:id/admin', toggleAdmin);
router.post('/broadcast', broadcastMessage);

module.exports = router;
