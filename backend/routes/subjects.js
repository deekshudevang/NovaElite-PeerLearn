const express = require('express');
const { Subject, UserSubject } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all subjects
router.get('/', async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort('name').lean();
    res.json(subjects.map(s => ({
      id: s._id.toString(),
      name: s.name,
      description: s.description || null
    })));
  } catch (error) {
    next(error);
  }
});

// Get user subjects
router.get('/user/:userId', async (req, res, next) => {
  try {
    const userSubjects = await UserSubject.find({ user: req.params.userId })
      .populate('subject')
      .lean();

    res.json(userSubjects.map(us => ({
      id: us._id.toString(),
      can_teach: !!us.can_teach,
      can_learn: !!us.can_learn,
      proficiency_level: us.proficiency_level || null,
      subjects: {
        id: us.subject._id.toString(),
        name: us.subject.name,
        description: us.subject.description || null
      }
    })));
  } catch (error) {
    next(error);
  }
});

// Set user subjects
router.post('/user/:userId', auth, async (req, res, next) => {
  try {
    if (req.user.sub !== req.params.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const subjects = Array.isArray(req.body.subjects) ? req.body.subjects : [];

    // Remove all existing user subjects
    await UserSubject.deleteMany({ user: req.params.userId });

    // Add new user subjects
    for (const subjectData of subjects) {
      let subjectId = subjectData.subject_id;

      // Allow creating subject by name if ID not provided
      if (!subjectId && subjectData.name) {
        const subject = await Subject.findOneAndUpdate(
          { name: subjectData.name },
          { $setOnInsert: { description: '' } },
          { new: true, upsert: true }
        );
        subjectId = subject._id;
      }

      if (subjectId) {
        await UserSubject.create({
          user: req.params.userId,
          subject: subjectId,
          can_teach: !!subjectData.can_teach,
          can_learn: !!subjectData.can_learn,
          proficiency_level: subjectData.proficiency_level || ''
        });
      }
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

// Delete user subjects
router.delete('/user/:userId', auth, async (req, res, next) => {
  try {
    if (req.user.sub !== req.params.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    await UserSubject.deleteMany({ user: req.params.userId });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;