const express = require('express');
const { ChatRoom, Message, TutoringRequest } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Create or get chat room for tutoring request
router.post('/rooms', auth, async (req, res, next) => {
  try {
    const { tutoring_request_id, course_id, title } = req.body;

    // Check if user is participant in the tutoring request
    if (tutoring_request_id) {
      const tutoringRequest = await TutoringRequest.findById(tutoring_request_id);
      if (!tutoringRequest) {
        return res.status(404).json({ message: 'Tutoring request not found' });
      }
      
      const isParticipant = [tutoringRequest.from_user.toString(), tutoringRequest.to_user.toString()]
        .includes(req.user.sub);
      
      if (!isParticipant) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if chat room already exists for this tutoring request
      let chatRoom = await ChatRoom.findOne({ tutoring_request: tutoring_request_id })
        .populate('participants', 'full_name');
      
      if (!chatRoom) {
        chatRoom = await ChatRoom.create({
          participants: [tutoringRequest.from_user, tutoringRequest.to_user],
          tutoring_request: tutoring_request_id,
          course: course_id,
          title: title || 'Study Session Chat'
        });
        
        chatRoom = await ChatRoom.findById(chatRoom._id)
          .populate('participants', 'full_name');
      }

      res.json({
        id: chatRoom._id.toString(),
        title: chatRoom.title,
        participants: chatRoom.participants.map(p => ({
          id: p._id.toString(),
          full_name: p.full_name
        })),
        created_at: chatRoom.createdAt,
        last_activity: chatRoom.last_activity
      });
    } else {
      return res.status(400).json({ message: 'tutoring_request_id is required' });
    }
  } catch (error) {
    next(error);
  }
});

// Get user's chat rooms
router.get('/rooms', auth, async (req, res, next) => {
  try {
    const chatRooms = await ChatRoom.find({
      participants: req.user.sub,
      is_active: true
    })
      .populate('participants', 'full_name')
      .populate('tutoring_request', 'subject message')
      .populate({
        path: 'tutoring_request',
        populate: { path: 'subject', select: 'name' }
      })
      .sort('-last_activity');

    res.json(chatRooms.map(room => ({
      id: room._id.toString(),
      title: room.title,
      participants: room.participants.map(p => ({
        id: p._id.toString(),
        full_name: p.full_name
      })),
      subject: room.tutoring_request?.subject?.name || null,
      last_activity: room.last_activity,
      created_at: room.createdAt
    })));
  } catch (error) {
    next(error);
  }
});

// Get messages for a chat room
router.get('/rooms/:roomId/messages', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user has access to this chat room
    const chatRoom = await ChatRoom.findById(req.params.roomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const isParticipant = chatRoom.participants.some(p => p.toString() === req.user.sub);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ chat_room: req.params.roomId })
      .populate('sender', 'full_name')
      .sort('-createdAt')
      .limit(limit)
      .skip(offset);

    res.json(messages.reverse().map(msg => ({
      id: msg._id.toString(),
      content: msg.content,
      sender: {
        id: msg.sender._id.toString(),
        full_name: msg.sender.full_name
      },
      message_type: msg.message_type,
      created_at: msg.createdAt,
      is_own: msg.sender._id.toString() === req.user.sub
    })));
  } catch (error) {
    next(error);
  }
});

// Send message to chat room
router.post('/rooms/:roomId/messages', auth, async (req, res, next) => {
  try {
    const { content, message_type = 'text' } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify user has access to this chat room
    const chatRoom = await ChatRoom.findById(req.params.roomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const isParticipant = chatRoom.participants.some(p => p.toString() === req.user.sub);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create message
    const message = await Message.create({
      chat_room: req.params.roomId,
      sender: req.user.sub,
      content: content.trim(),
      message_type
    });

    // Update chat room last activity
    await ChatRoom.findByIdAndUpdate(req.params.roomId, {
      last_activity: new Date()
    });

    // Populate sender info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'full_name');

    res.status(201).json({
      id: populatedMessage._id.toString(),
      content: populatedMessage.content,
      sender: {
        id: populatedMessage.sender._id.toString(),
        full_name: populatedMessage.sender.full_name
      },
      message_type: populatedMessage.message_type,
      created_at: populatedMessage.createdAt,
      is_own: true
    });
  } catch (error) {
    next(error);
  }
});

// Mark messages as read
router.patch('/rooms/:roomId/read', auth, async (req, res, next) => {
  try {
    // Verify access
    const chatRoom = await ChatRoom.findById(req.params.roomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const isParticipant = chatRoom.participants.some(p => p.toString() === req.user.sub);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark unread messages as read
    await Message.updateMany(
      { 
        chat_room: req.params.roomId,
        'read_by.user': { $ne: req.user.sub }
      },
      { 
        $push: { 
          read_by: { 
            user: req.user.sub, 
            read_at: new Date() 
          } 
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;