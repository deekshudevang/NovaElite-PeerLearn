const express = require('express');
const { Course } = require('../models');

const router = express.Router();

// Get courses with optional category filter
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const courses = await Course.find(filter)
      .sort('-createdAt')
      .limit(100)
      .populate('instructor', 'full_name')
      .populate('subject', 'name')
      .lean();

    res.json(courses.map(c => ({
      id: c._id.toString(),
      title: c.title,
      category: c.category,
      banner_url: c.banner_url || null,
      instructor: {
        id: c.instructor?._id?.toString?.() || null,
        full_name: c.instructor?.full_name || null
      },
      subject: {
        id: c.subject?._id?.toString?.() || null,
        name: c.subject?.name || null
      },
      rating: c.rating || 4.6
    })));
  } catch (error) {
    next(error);
  }
});

module.exports = router;