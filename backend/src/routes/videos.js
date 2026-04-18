const express = require('express');
const router = express.Router();
const {
  getVideos, getVideo, getCategories,
  uploadVideo, deleteVideo, updateVideo
} = require('../controllers/videoController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getVideos);
router.get('/categories', getCategories);
router.get('/:id', authMiddleware, getVideo);

// Admin only
router.post(
  '/',
  adminMiddleware,
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  uploadVideo
);
router.put(
  '/:id',
  adminMiddleware,
  upload.fields([{ name: 'thumbnail', maxCount: 1 }]),
  updateVideo
);
router.delete('/:id', adminMiddleware, deleteVideo);

module.exports = router;
