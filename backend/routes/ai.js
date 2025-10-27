const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { User, Profile, Subject, Course, TutoringRequest } = require('../models');

const router = express.Router();

// Initialize Google GenAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// AI summary endpoint
router.get('/summary', async (req, res, next) => {
  try {
    const counts = await Promise.all([
      User.countDocuments(),
      Profile.countDocuments(),
      Subject.countDocuments(),
      TutoringRequest.countDocuments(),
      Course.countDocuments()
    ]);

    const [users, profiles, subjects, requests, courses] = counts;

    res.json({
      overview: {
        users, profiles, subjects, requests, courses
      },
      endpoints: [
        'POST /api/auth/signup', 'POST /api/auth/signin', 'POST /api/auth/signout',
        'GET /api/profiles', 'GET /api/profiles/:userId', 'PUT /api/profiles/:userId', 'POST /api/profiles',
        'GET /api/subjects', 'GET/POST/DELETE /api/subjects/user/:userId',
        'POST /api/tutoring-requests', 'GET /api/tutoring-requests/user/:userId', 'PATCH /api/tutoring-requests/:id',
        'GET /api/courses?category=Development|Design|Science|Business',
        'POST /api/ai/chat', 'GET /api/ai/summary'
      ]
    });
  } catch (error) {
    next(error);
  }
});

// AI chat endpoint
router.post('/chat', async (req, res, next) => {
  try {
    const { messages } = req.body || {};
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages_required' });
    }

    // Build context about the platform
    const counts = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Subject.countDocuments(),
      TutoringRequest.countDocuments()
    ]);
    const [users, courses, subjects, requests] = counts;

    const platformContext = `You are PeerLearn AI, an assistant for a peer learning platform. Platform stats: ${users} users, ${courses} courses, ${subjects} subjects, ${requests} tutoring requests. Available endpoints: auth (signup/signin), profiles, subjects, courses, tutoring-requests. Help users with course recommendations, profile management, and platform navigation.`;

    // Use Google GenAI if API key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        // Format messages for Gemini
        const chatHistory = messages.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const lastMessage = messages[messages.length - 1];
        const prompt = `${platformContext}\n\nUser: ${lastMessage.content}`;

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        
        return res.json({ reply: response.text() });
      } catch (aiError) {
        console.error('GenAI error:', aiError);
        // Fall back to simple responses if AI fails
      }
    }

    // Fallback to simple keyword-based responses
    const lastMessage = String(messages[messages.length - 1]?.content || '').trim().toLowerCase();
    
    if (/(endpoint|api|route)/.test(lastMessage)) {
      const endpoints = [
        'POST /auth/signup', 'POST /auth/signin',
        'GET /profiles', 'GET /courses', 'POST /tutoring-requests'
      ];
      return res.json({ reply: `Main endpoints:\n• ${endpoints.join('\n• ')}` });
    }
    
    if (/recommend|course/.test(lastMessage)) {
      const categoryMatch = lastMessage.match(/(development|design|science|business)/);
      const filter = categoryMatch ? { category: categoryMatch[1][0].toUpperCase() + categoryMatch[1].slice(1) } : {};
      
      const courses = await Course.find(filter)
        .sort('-createdAt')
        .limit(3) // Reduced to 3 for brevity
        .populate('instructor', 'full_name')
        .lean();
        
      if (courses.length) {
        const courseList = courses.map(c => `• ${c.title}${c.price ? ` (₹${c.price})` : ''}`);
        return res.json({ 
          reply: `${filter.category || 'Top'} courses:\n${courseList.join('\n')}` 
        });
      }
      
      return res.json({ reply: 'No courses found. Try: Development, Design, Science, Business.' });
    }
    
    if (/profile|update/.test(lastMessage)) {
      return res.json({ 
        reply: 'Update profile: Profile button → Edit → Save\nAPI: PUT /profiles/:userId' 
      });
    }
    
    // Default helpful response based on content
    if (/hello|hi|hey/i.test(lastMessage)) {
      return res.json({ reply: 'Hi! Ask me about courses, profiles, or endpoints.' });
    }
    
    if (/help/i.test(lastMessage)) {
      return res.json({ reply: 'I can help with:\n• Course recommendations\n• Profile updates\n• API endpoints' });
    }
    
    // Simple fallback
    res.json({ 
      reply: `${courses} courses available. Ask: "courses in Design" or "list endpoints"` 
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;