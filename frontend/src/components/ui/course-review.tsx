import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp, User, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { reviewService, type CourseReview, type CreateReviewData } from '@/services/review.service';

interface CourseReviewProps {
  courseId: string;
  onReviewSubmitted?: (review: CourseReview) => void;
}

interface ReviewStarProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function ReviewStars({ rating, onRatingChange, readonly = false, size = 'md' }: ReviewStarProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readonly}
          whileHover={readonly ? {} : { scale: 1.2 }}
          whileTap={readonly ? {} : { scale: 0.9 }}
          className={`${sizeClasses[size]} ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => !readonly && onRatingChange?.(star)}
        >
          <Star
            className={`w-full h-full transition-all duration-200 ${
              star <= (hoverRating || rating)
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300'
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}

export function CourseReviewForm({ courseId, onReviewSubmitted }: CourseReviewProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      const reviewData: CreateReviewData = {
        course_id: courseId,
        rating,
        comment: comment.trim() || undefined,
        session_date: new Date().toISOString()
      };

      const review = await reviewService.createReview(reviewData);
      onReviewSubmitted?.(review);
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors duration-300">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Share Your Experience
          </h3>
          <p className="text-sm text-muted-foreground">
            Help others by rating this course and sharing your thoughts
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Your Rating</Label>
              <div className="flex items-center gap-3">
                <ReviewStars rating={rating} onRatingChange={setRating} size="lg" />
                <motion.span
                  key={rating}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-sm text-muted-foreground ml-2"
                >
                  {rating > 0 && (
                    <>
                      {rating === 1 && '😞 Poor'}
                      {rating === 2 && '😐 Fair'}
                      {rating === 3 && '🙂 Good'}
                      {rating === 4 && '😊 Great'}
                      {rating === 5 && '🤩 Excellent'}
                    </>
                  )}
                </motion.span>
              </div>
            </div>

            <div>
              <Label htmlFor="comment" className="text-sm font-medium mb-3 block">
                Your Review (Optional)
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this course..."
                className="min-h-[100px] resize-none focus:ring-2 focus:ring-purple-500"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground mt-2">
                {comment.length}/500 characters
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ReviewListProps {
  reviews: CourseReview[];
  loading?: boolean;
}

export function ReviewList({ reviews, loading }: ReviewListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-16 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-600">Be the first to share your experience with this course!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            layout
          >
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex-shrink-0"
                  >
                    <Avatar className="w-12 h-12 ring-2 ring-purple-100 group-hover:ring-purple-300 transition-colors">
                      <AvatarImage src={review.reviewer.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                        {review.reviewer.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {review.reviewer.full_name}
                        </h4>
                        {review.is_verified && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            title="Verified reviewer"
                          >
                            <Badge className="bg-green-100 text-green-700 text-xs flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Verified
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ReviewStars rating={review.rating} readonly size="sm" />
                      <span className="text-sm text-muted-foreground">
                        ({review.rating}/5)
                      </span>
                    </div>

                    {review.comment && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-700 leading-relaxed"
                      >
                        {review.comment}
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}