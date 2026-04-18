const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { notifyAdmins } = require('../utils/bot');

// Login or register via Telegram ID
const telegramLogin = async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName, photoUrl } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    const telegramIdStr = String(telegramId).trim();

    // Check if this telegramId is in ADMIN list from env
    const adminIds = (process.env.TELEGRAM_ADMIN_IDS || '')
      .split(',')
      .map(id => id.trim());
    const isEnvAdmin = adminIds.includes(telegramIdStr);

    let user = await User.findOne({ telegramId: telegramIdStr });

    if (!user) {
      // New user — register
      user = await User.create({
        telegramId: telegramIdStr,
        username: username || '',
        firstName: firstName || '',
        lastName: lastName || '',
        photoUrl: photoUrl || '',
        isAdmin: isEnvAdmin,
      });

      await notifyAdmins(
        `🆕 <b>New User Joined!</b>\n` +
        `👤 Name: ${firstName || ''} ${lastName || ''}\n` +
        `🆔 Telegram ID: <code>${telegramIdStr}</code>\n` +
        `📛 Username: @${username || 'N/A'}`
      );
    } else {
      // Update last login and sync admin status
      user.lastLogin = new Date();
      user.isAdmin = isEnvAdmin || user.isAdmin;
      if (username) user.username = username;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (photoUrl) user.photoUrl = photoUrl;
      await user.save();
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been banned.' });
    }

    const token = jwt.sign(
      { id: user._id, telegramId: user.telegramId, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { telegramLogin, getMe };
