import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageCircle, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  BookOpen, 
  Trophy,
  Play,
  TrendingUp,
  Award,
  Globe,
  Clock,
  Code,
  Palette,
  Music,
  Camera,
  Heart,
  ChevronRight
} from 'lucide-react';
import Logo from '@/assets/logo-creative.svg';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/ui/navigation';
import CourseCard from '@/components/ui/course-card';

// Mock data for courses
const featuredCourses = [
  {
    id: '1',
    title: 'Complete Python Bootcamp: Go from Beginner to Expert',
    subtitle: 'Learn Python like a Professional! Start from basics and go to creating your own applications!',
    instructor: {
      id: '1',
      name: 'Dr. Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face',
      title: 'Senior Data Scientist',
      rating: 4.8
    },
    rating: 4.6,
    reviewCount: 15420,
    price: 89.99,
    originalPrice: 199.99,
    duration: '22 hours',
    studentCount: 45000,
    level: 'Beginner' as const,
    category: 'Programming',
    thumbnail: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=225&fit=crop',
    isNew: false,
    isBestseller: true,
    lastUpdated: '2024-01-15',
    language: 'English',
    tags: ['Python', 'Programming', 'Data Science']
  },
  {
    id: '2',
    title: 'Advanced Mathematics for Machine Learning',
    subtitle: 'Master the mathematical foundations behind modern AI and machine learning algorithms',
    instructor: {
      id: '2',
      name: 'Prof. Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      title: 'Mathematics Professor',
      rating: 4.9
    },
    rating: 4.7,
    reviewCount: 8900,
    price: 129.99,
    originalPrice: 249.99,
    duration: '18 hours',
    studentCount: 22000,
    level: 'Advanced' as const,
    category: 'Mathematics',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=225&fit=crop',
    isNew: true,
    isBestseller: false,
    lastUpdated: '2024-02-20',
    language: 'English',
    tags: ['Mathematics', 'Machine Learning', 'Statistics']
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass: Figma to Prototype',
    subtitle: 'Create stunning user interfaces and experiences using modern design principles',
    instructor: {
      id: '3',
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      title: 'Senior UX Designer',
      rating: 4.8
    },
    rating: 4.5,
    reviewCount: 12300,
    price: 79.99,
    originalPrice: 179.99,
    duration: '15 hours',
    studentCount: 18500,
    level: 'Intermediate' as const,
    category: 'Design',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop',
    isNew: false,
    isBestseller: true,
    lastUpdated: '2024-01-10',
    language: 'English',
    tags: ['UI Design', 'UX Design', 'Figma']
  },
  {
    id: '4',
    title: 'Digital Photography: From Beginner to Professional',
    subtitle: 'Master photography techniques, composition, and editing to create stunning images',
    instructor: {
      id: '4',
      name: 'Alex Turner',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      title: 'Professional Photographer',
      rating: 4.7
    },
    rating: 4.4,
    reviewCount: 9800,
    price: 99.99,
    originalPrice: 199.99,
    duration: '20 hours',
    studentCount: 15000,
    level: 'Beginner' as const,
    category: 'Photography',
    thumbnail: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=225&fit=crop',
    isNew: false,
    isBestseller: false,
    lastUpdated: '2023-12-15',
    language: 'English',
    tags: ['Photography', 'Editing', 'Composition']
  }
];

const categories = [
  { name: 'Programming', icon: Code, color: 'bg-blue-500', students: '2.5M+' },
  { name: 'Design', icon: Palette, color: 'bg-purple-500', students: '1.8M+' },
  { name: 'Mathematics', icon: TrendingUp, color: 'bg-green-500', students: '1.2M+' },
  { name: 'Photography', icon: Camera, color: 'bg-orange-500', students: '900K+' },
  { name: 'Music', icon: Music, color: 'bg-pink-500', students: '750K+' },
  { name: 'Languages', icon: Globe, color: 'bg-indigo-500', students: '2.1M+' },
  { name: 'Science', icon: BookOpen, color: 'bg-teal-500', students: '1.5M+' },
  { name: 'Health', icon: Heart, color: 'bg-red-500', students: '800K+' }
];

const stats = [
  { number: '50,000+', label: 'Students Learning', icon: Users },
  { number: '2,500+', label: 'Expert Tutors', icon: Award },
  { number: '100+', label: 'Subjects Covered', icon: BookOpen },
  { number: '4.8/5', label: 'Average Rating', icon: Star }
];

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const Index = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden"
        style={{ y, opacity }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-xl"
            animate={{
              y: [0, 40, 0],
              scale: [1, 0.8, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-24 h-24 bg-green-500/10 rounded-full blur-xl"
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        <div className="container mx-auto px-4 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              className="text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Sparkles className="w-4 h-4" />
                #1 Peer Learning Platform
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Learn from the
                <motion.span 
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  best peers
                </motion.span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
                Connect with expert tutors and passionate learners. Master new skills through personalized 1-on-1 sessions and collaborative learning.
              </p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all group"
                  onClick={() => navigate('/auth')}
                >
                  Start Learning Now
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-4 border-2 hover:bg-slate-50 transition-all group"
                  onClick={() => navigate('/courses')}
                >
                  <Play className="w-5 h-5 mr-2 group-hover:text-blue-600 transition-colors" />
                  Explore Courses
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="flex items-center gap-8 text-sm text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>50K+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Expert Tutors</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&crop=center"
                  alt="Students learning together"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                
                {/* Floating Cards */}
                <motion.div
                  className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Session Complete</div>
                      <div className="text-xs text-slate-500">Mathematics Tutor</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">New Message</div>
                      <div className="text-xs text-slate-500">From your tutor</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Browse Popular Categories</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover the subjects that match your interests and career goals
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
            initial="initial"
            whileInView="animate"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={category.name}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/courses?category=${category.name.toLowerCase()}`)}
                >
                  <Card className="p-6 text-center hover:shadow-lg transition-all border-0 bg-white group">
                    <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-500">{category.students} students</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-4xl font-bold mb-4">Featured Courses</h2>
              <p className="text-xl text-slate-600">
                Handpicked courses from our expert instructors
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/courses')}
              className="hidden sm:flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
            >
              View All Courses
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {featuredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CourseCard 
                  course={course}
                  onEnroll={(id) => navigate(`/courses/${id}`)}
                  onWishlist={(id) => console.log('Wishlist:', id)}
                  onShare={(id) => console.log('Share:', id)}
                />
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button 
              size="lg"
              onClick={() => navigate('/courses')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Explore All Courses
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Join Our Learning Community</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Be part of a global community of learners and educators making knowledge accessible to everyone
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial="initial"
            whileInView="animate"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <motion.div 
                    className="text-3xl lg:text-4xl font-bold mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {stat.number}
                  </motion.div>
                  <p className="text-blue-100">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              <CardHeader className="space-y-4 pb-8 relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <CardTitle className="text-3xl md:text-4xl group-hover:text-primary transition-colors duration-300">
                    Ready to Start Learning?
                  </CardTitle>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <CardDescription className="text-lg">
                    Join thousands of students already learning together on PeerLearn
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  viewport={{ once: true }}
                >
                  <Button 
                    size="lg" 
                    className="text-lg px-12 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
                    onClick={() => navigate('/auth')}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
                    />
                    <span className="relative z-10">Join PeerLearn Today</span>
                    <motion.div
                      className="ml-2 relative z-10"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="border-t bg-card/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.img 
                src={Logo} 
                alt="PeerLearn logo" 
                className="w-6 h-6" 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              />
              <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PeerLearn
              </span>
            </motion.div>
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              © 2024 PeerLearn. Empowering students through peer learning.
            </motion.p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
