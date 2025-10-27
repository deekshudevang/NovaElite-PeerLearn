const express = require('express');
const { TutoringRequest } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Create tutoring request
router.post('/', auth, async (req, res, next) => {
  try {
    const { from_user_id, to_user_id, subject_id, message, status } = req.body || {};
    
    if (req.user.sub !== from_user_id) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const tutoringRequest = await TutoringRequest.create({
      from_user: from_user_id,
      to_user: to_user_id,
      subject: subject_id,
      message: message || '',
      status: status || 'pending'
    });

    res.status(201).json({
      id: tutoringRequest._id.toString(),
      from_user_id,
      to_user_id,
      subject_id,
      message: tutoringRequest.message,
      status: tutoringRequest.status,
      created_at: tutoringRequest.createdAt,
      updated_at: tutoringRequest.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

// Get user's tutoring requests
router.get('/user/:userId', auth, async (req, res, next) => {
  try {
    if (req.user.sub !== req.params.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const requests = await TutoringRequest.find({
      $or: [
        { from_user: req.params.userId },
        { to_user: req.params.userId }
      ]
    })
      .sort('-createdAt')
      .populate('subject', 'name')
      .populate('from_user', 'full_name')
      .populate('to_user', 'full_name')
      .lean();

    res.json(requests.map(tr => {
      const isFromCurrentUser = String(tr.from_user?._id || tr.from_user) === req.params.userId;
      const otherUser = isFromCurrentUser ? tr.to_user : tr.from_user;
      const currentUser = isFromCurrentUser ? tr.from_user : tr.to_user;

      return {
        id: tr._id.toString(),
        from_user_id: (tr.from_user?._id || tr.from_user).toString(),
        from_user_name: tr.from_user?.full_name || 'Unknown User',
        to_user_id: (tr.to_user?._id || tr.to_user).toString(),
        to_user_name: tr.to_user?.full_name || 'Unknown User',
        other_name: otherUser?.full_name || 'Peer',
        current_user_name: currentUser?.full_name || 'You',
        subject_id: (tr.subject?._id || tr.subject).toString(),
        subject_name: tr.subject?.name || 'General',
        message: tr.message,
        status: tr.status,
        created_at: tr.createdAt,
        updated_at: tr.updatedAt,
        is_from_current_user: isFromCurrentUser
      };
    }));
  } catch (error) {
    next(error);
  }
});

// Update tutoring request status
router.patch('/:id', auth, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    
    const tutoringRequest = await TutoringRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!tutoringRequest) {
      return res.status(404).json({ message: 'not_found' });
    }

    res.json({
      id: tutoringRequest._id.toString(),
      from_user_id: tutoringRequest.from_user.toString(),
      to_user_id: tutoringRequest.to_user.toString(),
      subject_id: tutoringRequest.subject.toString(),
      message: tutoringRequest.message,
      status: tutoringRequest.status,
      created_at: tutoringRequest.createdAt,
      updated_at: tutoringRequest.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;