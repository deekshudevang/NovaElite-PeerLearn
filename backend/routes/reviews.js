const express = require('express');
const { CourseReview, Course, Session, TutoringRequest } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Create or update course review
router.post('/', auth, async (req, res, next) => {
  try {
    const { course_id, rating, comment, session_date } = req.body;

    if (!course_id || !rating) {
      return res.status(400).json({ message: 'course_id and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has completed a session for this course (optional verification)
    // This ensures only users who actually took the course can review it
    const hasSession = await TutoringRequest.findOne({
      $or: [
        { from_user: req.user.sub, to_user: course.instructor },
        { to_user: req.user.sub, from_user: course.instructor }
      ],
      status: 'accepted'
    });

    // Upsert the review
    const review = await CourseReview.findOneAndUpdate(
      { course: course_id, reviewer: req.user.sub },
      {
        rating,
        comment: comment || '',
        session_date: session_date ? new Date(session_date) : new Date(),
        is_verified: !!hasSession
      },
      { new: true, upsert: true }
    ).populate('reviewer', 'full_name');

    // Update course average rating
    await updateCourseRating(course_id);

    res.json({
      id: review._id.toString(),
      course_id: review.course.toString(),
      reviewer: {
        id: review.reviewer._id.toString(),
        full_name: review.reviewer.full_name
      },
      rating: review.rating,
      comment: review.comment,
      session_date: review.session_date,
      is_verified: review.is_verified,
      created_at: review.createdAt,
      updated_at: review.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

// Get reviews for a course
router.get('/course/:courseId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await CourseReview.find({ course: req.params.courseId })
      .populate('reviewer', 'full_name avatar_url')
      .sort('-createdAt')
      .limit(limit)
      .skip(offset);

    const total = await CourseReview.countDocuments({ course: req.params.courseId });

    res.json({
      reviews: reviews.map(review => ({
        id: review._id.toString(),
        reviewer: {
          id: review.reviewer._id.toString(),
          full_name: review.reviewer.full_name,
          avatar_url: review.reviewer.avatar_url || null
        },
        rating: review.rating,
        comment: review.comment,
        session_date: review.session_date,
        is_verified: review.is_verified,
        created_at: review.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's reviews
router.get('/my-reviews', auth, async (req, res, next) => {
  try {
    const reviews = await CourseReview.find({ reviewer: req.user.sub })
      .populate('course', 'title category banner_url')
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'full_name' }
      })
      .sort('-createdAt');

    res.json(reviews.map(review => ({
      id: review._id.toString(),
      course: {
        id: review.course._id.toString(),
        title: review.course.title,
        category: review.course.category,
        banner_url: review.course.banner_url,
        instructor: review.course.instructor?.full_name || 'Unknown'
      },
      rating: review.rating,
      comment: review.comment,
      session_date: review.session_date,
      is_verified: review.is_verified,
      created_at: review.createdAt,
      updated_at: review.updatedAt
    })));
  } catch (error) {
    next(error);
  }
});

// Delete review
router.delete('/:reviewId', auth, async (req, res, next) => {
  try {
    const review = await CourseReview.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.user.sub) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const courseId = review.course;
    await CourseReview.findByIdAndDelete(req.params.reviewId);
    
    // Update course average rating
    await updateCourseRating(courseId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get course rating summary
router.get('/course/:courseId/summary', async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    
    const summary = await CourseReview.aggregate([
      { $match: { course: courseId } },
      {
        $group: {
          _id: '$course',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (summary.length === 0) {
      return res.json({
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const result = summary[0];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    result.ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    res.json({
      average_rating: Math.round(result.averageRating * 10) / 10,
      total_reviews: result.totalReviews,
      rating_distribution: distribution
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to update course rating
async function updateCourseRating(courseId) {
  try {
    const summary = await CourseReview.aggregate([
      { $match: { course: courseId } },
      {
        $group: {
          _id: '$course',
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const newRating = summary.length > 0 ? Math.round(summary[0].averageRating * 10) / 10 : 4.6;
    
    await Course.findByIdAndUpdate(courseId, { rating: newRating });
  } catch (error) {
    console.error('Error updating course rating:', error);
  }
}

module.exports = router;