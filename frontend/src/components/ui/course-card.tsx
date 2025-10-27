import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Users, 
  Clock, 
  Play, 
  BookOpen, 
  Award,
  Heart,
  Share2,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Instructor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  rating: number;
}

interface CourseData {
  id: string;
  title: string;
  subtitle: string;
  instructor: Instructor;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  duration: string;
  studentCount: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  thumbnail: string;
  isNew?: boolean;
  isBestseller?: boolean;
  lastUpdated: string;
  language: string;
  tags: string[];
}

interface CourseCardProps {
  course: CourseData;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
  onEnroll?: (courseId: string) => void;
  onWishlist?: (courseId: string) => void;
  onShare?: (courseId: string) => void;
}

export const CourseCard = ({ 
  course, 
  variant = 'default', 
  className = '',
  onEnroll,
  onWishlist,
  onShare 
}: CourseCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onWishlist?.(course.id);
  };

  const discount = course.originalPrice ? 
    Math.round((1 - course.price / course.originalPrice) * 100) : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
            ? 'fill-yellow-400/50 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={`group cursor-pointer ${className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex gap-3 p-3">
            <div className="relative w-20 h-16 flex-shrink-0">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {course.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-1">
                {course.instructor.name}
              </p>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1">
                  {renderStars(course.rating)}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({course.reviewCount})
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">
                  ₹{course.price}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {course.level}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`group cursor-pointer ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.button
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-6 h-6 text-primary" />
            </motion.button>
          </motion.div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {course.isNew && (
              <Badge className="bg-green-500 hover:bg-green-500 text-white">
                New
              </Badge>
            )}
            {course.isBestseller && (
              <Badge className="bg-orange-500 hover:bg-orange-500 text-white">
                Bestseller
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <motion.button
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleWishlist();
            }}
          >
            <Heart 
              className={`w-4 h-4 ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`} 
            />
          </motion.button>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className="absolute bottom-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onShare?.(course.id)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleWishlist}>
                <Heart className="w-4 h-4 mr-2" />
                {isWishlisted ? 'Remove from' : 'Add to'} Wishlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {course.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {course.level}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Subtitle */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {course.subtitle}
          </p>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm text-muted-foreground">
              {course.instructor.name}
            </span>
          </div>

          {/* Rating & Stats */}
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-orange-500">
                {course.rating}
              </span>
              <div className="flex">
                {renderStars(course.rating)}
              </div>
              <span className="text-muted-foreground">
                ({course.reviewCount.toLocaleString()})
              </span>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{course.studentCount.toLocaleString()} students</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{course.language}</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-primary">
                ₹{course.price}
              </span>
              {course.originalPrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{course.originalPrice}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    -{discount}%
                  </Badge>
                </>
              )}
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnroll?.(course.id);
                }}
                className="px-4"
              >
                Enroll Now
              </Button>
            </motion.div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {course.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CourseCard;