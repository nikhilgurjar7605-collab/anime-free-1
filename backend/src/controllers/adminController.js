const User = require('../models/User');
const Video = require('../models/Video');
const { notifyAdmins } = require('../utils/bot');

// Dashboard stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVideos = await Video.countDocuments();
    const publishedVideos = await Video.countDocuments({ isPublished: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalViews = await Video.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const topVideos = await Video.find().sort({ views: -1 }).limit(5);

    res.json({
      stats: {
        totalUsers,
        totalVideos,
        publishedVideos,
        bannedUsers,
        totalViews: totalViews[0]?.total || 0,
      },
      recentUsers,
      topVideos,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { telegramId: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ban / Unban user
const toggleBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isAdmin) return res.status(403).json({ error: 'Cannot ban an admin' });

    user.isBanned = !user.isBanned;
    await user.save();

    await notifyAdmins(
      `${user.isBanned ? '🚫' : '✅'} <b>User ${user.isBanned ? 'Banned' : 'Unbanned'}</b>\n` +
      `👤 ${user.firstName} (@${user.username})\n` +
      `🆔 ${user.telegramId}`
    );

    res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Promote/demote admin
const toggleAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({ message: `User ${user.isAdmin ? 'promoted to admin' : 'demoted from admin'}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all videos (admin - includes unpublished)
const getAllVideos = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'firstName username');
    const total = await Video.countDocuments(query);
    res.json({ videos, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Broadcast message to all users via bot
const broadcastMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const users = await User.find({ isBanned: false });
    const { sendMessage } = require('../utils/bot');
    let sent = 0;
    for (const user of users) {
      try {
        await sendMessage(user.telegramId, `📢 <b>Announcement</b>\n\n${message}`);
        sent++;
      } catch {}
    }

    res.json({ message: `Broadcast sent to ${sent} users` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getStats, getUsers, toggleBan, toggleAdmin, getAllVideos, broadcastMessage };
