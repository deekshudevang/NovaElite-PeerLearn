import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { profileService, Profile } from '@/services/profile.service';
import { courseService, CourseDTO } from '@/services/course.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Star, 
  Users, 
  Clock, 
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/ui/navigation';
import CourseCard from '@/components/ui/course-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserSubject { id: string; can_teach: boolean; subjects: { name: string } }

interface EnhancedCourse {
  id: string;
  title: string;
  subtitle: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    rating: number;
  };
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

const categories = [
  'All Categories',
  'Programming', 
  'Design', 
  'Mathematics', 
  'Photography', 
  'Music', 
  'Languages', 
  'Science', 
  'Health'
];

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const sortOptions = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Highest Rated', value: 'rating' }
];

export default function Courses(){
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<EnhancedCourse[]>([]);
  const [filtered, setFiltered] = useState<EnhancedCourse[]>([]);
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced course data transformation
  const transformToCourseData = (profiles: Profile[]): EnhancedCourse[] => {
    return profiles.map((p, i) => ({
      id: p.id,
      title: `Master ${(p.user_subjects||[])[0]?.subjects?.name || 'General Skills'}`,
      subtitle: `Learn from an experienced ${(p.user_subjects||[])[0]?.subjects?.name || 'tutor'} with personalized guidance`,
      instructor: {
        id: p.id,
        name: p.full_name,
        avatar: p.avatar_url || `https://images.unsplash.com/photo-${1500000000000 + i}?w=150&h=150&fit=crop&crop=face`,
        title: `${(p.user_subjects||[])[0]?.subjects?.name || 'General'} Expert`,
        rating: 4.5 + Math.random() * 0.5
      },
      rating: 4.2 + Math.random() * 0.8,
      reviewCount: Math.floor(Math.random() * 5000) + 100,
      price: Math.floor(Math.random() * 1500) + 699, // Indian rupee pricing
      originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 1200 : undefined,
      duration: `${Math.floor(Math.random() * 20) + 5} hours`,
      studentCount: Math.floor(Math.random() * 50000) + 1000,
      level: (['Beginner', 'Intermediate', 'Advanced'] as const)[Math.floor(Math.random() * 3)],
      category: (p.user_subjects||[])[0]?.subjects?.name || 'General',
      thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i * 123}?w=400&h=225&fit=crop`,
      isNew: Math.random() > 0.8,
      isBestseller: Math.random() > 0.7,
      lastUpdated: '2024-01-15',
      language: 'English',
      tags: [(p.user_subjects||[])[0]?.subjects?.name || 'General', 'Tutoring', 'One-on-One']
    }));
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        const search = params.get('search');
        
        if (category) setSelectedCategory(category.charAt(0).toUpperCase() + category.slice(1));
        if (search) setQ(search);
        
        const list = await profileService.getProfiles(100);
        const enhancedCourses = transformToCourseData(list || []);
        
        setCourses(enhancedCourses);
        setProfiles(list || []);
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };
    
    loadCourses();
  }, [location.search]);

  // Enhanced filtering and sorting
  useEffect(() => {
    let result = [...courses];
    
    // Apply search filter
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      result = result.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.subtitle.toLowerCase().includes(query) ||
        course.instructor.name.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      result = result.filter(course => 
        course.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Apply level filter
    if (selectedLevel !== 'All Levels') {
      result = result.filter(course => course.level === selectedLevel);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.studentCount - a.studentCount);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }
    
    setFiltered(result);
  }, [courses, q, selectedCategory, selectedLevel, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect above
  };

  const clearFilters = () => {
    setQ('');
    setSelectedCategory('All Categories');
    setSelectedLevel('All Levels');
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200 pt-20">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-2">All Courses</h1>
            <p className="text-gray-600 text-lg mb-6">
              Choose from {courses.length} courses with new additions published every month
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search for anything..."
                  className="pl-12 py-3 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-none shadow-sm"
                />
                <Button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-6 bg-gray-800 hover:bg-gray-900 rounded-none rounded-r-md"
                >
                  Search
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="container mx-auto px-4 py-6">
        {/* Filter Bar */}
        <motion.div 
          className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {selectedCategory}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? 'bg-blue-50' : ''}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Level Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  {selectedLevel}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {levels.map((level) => (
                  <DropdownMenuItem
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={selectedLevel === level ? 'bg-blue-50' : ''}
                  >
                    {level}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters */}
            {(selectedCategory !== 'All Categories' || selectedLevel !== 'All Levels' || q) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort by: {sortOptions.find(opt => opt.value === sortBy)?.label}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={sortBy === option.value ? 'bg-blue-50' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {q && (
            <Badge variant="secondary" className="gap-1">
              Search: "{q}"
              <button onClick={() => setQ('')} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                ×
              </button>
            </Badge>
          )}
          {selectedCategory !== 'All Categories' && (
            <Badge variant="secondary" className="gap-1">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('All Categories')} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                ×
              </button>
            </Badge>
          )}
          {selectedLevel !== 'All Levels' && (
            <Badge variant="secondary" className="gap-1">
              Level: {selectedLevel}
              <button onClick={() => setSelectedLevel('All Levels')} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                ×
              </button>
            </Badge>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for courses
          </p>
        </div>

        {/* Course Grid/List */}
        <AnimatePresence>
          {viewMode === 'grid' ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filtered.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <CourseCard
                    course={course}
                    onEnroll={(id) => navigate(`/peer/${course.instructor.id}`)}
                    onWishlist={(id) => console.log('Wishlist:', id)}
                    onShare={(id) => console.log('Share:', id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filtered.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                >
                  <CourseCard
                    course={course}
                    variant="compact"
                    onEnroll={(id) => navigate(`/peer/${course.instructor.id}`)}
                    onWishlist={(id) => console.log('Wishlist:', id)}
                    onShare={(id) => console.log('Share:', id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {filtered.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </motion.div>
        )}
      </section>
    </div>
  )
}
