const express = require('express');
const jwt = require('jsonwebtoken');
const { User, Profile } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Sign JWT token
function sign(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Sign up
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body || {};
    
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'missing_fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'email_taken' });
    }

    const user = await User.create({ email, password, full_name });
    
    // Create profile
    await Profile.create({ user: user._id, full_name });
    
    const token = sign(user);
    
    res.status(201).json({
      token,
      userId: user._id.toString(),
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name
      }
    });
  } catch (error) {
    next(error);
  }
});

// Sign in
router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'invalid_credentials' });
    }

    const isValidPassword = await user.comparePassword(password || '');
    if (!isValidPassword) {
      return res.status(401).json({ message: 'invalid_credentials' });
    }

    const token = sign(user);
    
    res.json({
      token,
      userId: user._id.toString(),
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name
      }
    });
  } catch (error) {
    next(error);
  }
});

// Sign out
router.post('/signout', (req, res) => {
  res.json({ ok: true });
});

// Get current user
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'user_not_found' });
    }
    
    res.json({
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;