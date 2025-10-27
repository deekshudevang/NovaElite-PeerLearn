const express = require('express');
const { Profile, UserSubject } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all profiles
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10) || 20, 100);
    const profiles = await Profile.find().limit(limit).lean();
    
    res.json(profiles.map(p => ({
      id: p.user.toString(),
      full_name: p.full_name,
      bio: p.bio || null,
      avatar_url: p.avatar_url || null,
      banner_url: p.banner_url || null,
      year_of_study: p.year_of_study || null,
      major: p.major || null,
    })));
  } catch (error) {
    next(error);
  }
});

// Get profile by user ID
router.get('/:userId', async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).lean();
    if (!profile) {
      return res.status(404).json({ message: 'not_found' });
    }

    const userSubjects = await UserSubject.find({ user: req.params.userId })
      .populate('subject')
      .lean();

    res.json({
      id: profile.user.toString(),
      full_name: profile.full_name,
      bio: profile.bio || null,
      avatar_url: profile.avatar_url || null,
      banner_url: profile.banner_url || null,
      year_of_study: profile.year_of_study || null,
      major: profile.major || null,
      user_subjects: userSubjects.map(us => ({
        id: us._id.toString(),
        can_teach: !!us.can_teach,
        can_learn: !!us.can_learn,
        proficiency_level: us.proficiency_level || null,
        subjects: {
          id: us.subject._id.toString(),
          name: us.subject.name,
          description: us.subject.description || null
        }
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Create profile
router.post('/', auth, async (req, res, next) => {
  try {
    const { id, full_name } = req.body || {};
    const userId = id || req.user.sub;

    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile) {
      return res.json({
        id: userId,
        full_name: existingProfile.full_name,
        bio: existingProfile.bio || null,
        avatar_url: existingProfile.avatar_url || null,
        banner_url: existingProfile.banner_url || null,
        year_of_study: existingProfile.year_of_study || null,
        major: existingProfile.major || null
      });
    }

    const profile = await Profile.create({
      user: userId,
      full_name: full_name || ''
    });

    res.status(201).json({
      id: userId,
      full_name: profile.full_name,
      bio: null,
      avatar_url: null,
      banner_url: null,
      year_of_study: null,
      major: null
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/:userId', auth, async (req, res, next) => {
  try {
    if (req.user.sub !== req.params.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const updateData = {
      full_name: req.body.full_name,
      bio: req.body.bio,
      avatar_url: req.body.avatar_url,
      banner_url: req.body.banner_url,
      year_of_study: req.body.year_of_study,
      major: req.body.major,
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      id: profile.user.toString(),
      full_name: profile.full_name,
      bio: profile.bio || null,
      avatar_url: profile.avatar_url || null,
      banner_url: profile.banner_url || null,
      year_of_study: profile.year_of_study || null,
      major: profile.major || null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;