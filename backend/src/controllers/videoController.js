const Video = require('../models/Video');
const User = require('../models/User');
const { notifyAdmins } = require('../utils/bot');
const path = require('path');
const fs = require('fs');

// Get all published videos (with search + category filter)
const getVideos = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = { isPublished: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'firstName username');

    const total = await Video.countDocuments(query);

    res.json({
      videos,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single video + increment views
const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('uploadedBy', 'firstName username');
    if (!video || !video.isPublished) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    // Add to user watch history
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { watchHistory: { video: video._id, watchedAt: new Date() } },
      });
    }

    res.json({ video });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Video.distinct('category', { isPublished: true });
    res.json({ categories: ['All', ...categories] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload video (admin only)
const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, tags, videoUrl, videoType } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    let finalVideoUrl = videoUrl || '';
    let thumbnailUrl = '';

    if (req.files) {
      if (req.files.video) {
        finalVideoUrl = `/uploads/videos/${req.files.video[0].filename}`;
      }
      if (req.files.thumbnail) {
        thumbnailUrl = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
      }
    }

    if (!finalVideoUrl) {
      return res.status(400).json({ error: 'Video file or URL is required' });
    }

    const video = await Video.create({
      title,
      description: description || '',
      category: category || 'Uncategorized',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      thumbnail: thumbnailUrl,
      videoUrl: finalVideoUrl,
      videoType: videoType || (req.files?.video ? 'upload' : 'external'),
      uploadedBy: req.user._id,
    });

    await notifyAdmins(
      `🎬 <b>New Video Added!</b>\n` +
      `📽 Title: ${title}\n` +
      `📂 Category: ${category || 'Uncategorized'}\n` +
      `👤 By: ${req.user.firstName || req.user.username}`
    );

    res.status(201).json({ video });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete video (admin only)
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    // Delete local files if uploaded
    if (video.videoType === 'upload') {
      const videoPath = path.join(__dirname, '../../', video.videoUrl);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    }
    if (video.thumbnail) {
      const thumbPath = path.join(__dirname, '../../', video.thumbnail);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    await video.deleteOne();

    await notifyAdmins(
      `🗑 <b>Video Deleted</b>\n` +
      `📽 Title: ${video.title}\n` +
      `👤 By Admin: ${req.user.firstName || req.user.username}`
    );

    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update video (admin only)
const updateVideo = async (req, res) => {
  try {
    const { title, description, category, tags, isPublished } = req.body;
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (category) video.category = category;
    if (tags) video.tags = tags.split(',').map(t => t.trim());
    if (isPublished !== undefined) video.isPublished = isPublished === 'true' || isPublished === true;

    if (req.files?.thumbnail) {
      video.thumbnail = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
    }

    await video.save();
    res.json({ video });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getVideos, getVideo, getCategories, uploadVideo, deleteVideo, updateVideo };
