import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '@/services/auth.service';
import { profileService, Profile } from '@/services/profile.service';
import { tutoringService } from '@/services/tutoring.service';
import { courseService } from '@/services/course.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, LogOut, User, GraduationCap, MessageCircle, Star, Users, Clock, BookOpen } from 'lucide-react';
import Logo from '@/assets/logo-creative.svg';


interface UserSubject {
  id: string;
  can_teach: boolean;
  can_learn: boolean;
  proficiency_level: string | null;
  subjects: {
    name: string;
    description: string | null;
  };
}

const AcceptedRequests = ()=>{
  const [items, setItems] = useState<{id:string; withName:string; subject:string}[]>([]);
  useEffect(()=>{ (async ()=>{
    const s = authService.getSession(); if (!s.userId) return;
    try {
      const list = await tutoringService.getRequests(s.userId);
      const mine = list.filter(r=> r.status==='accepted');
      setItems(mine.map(r=>({ 
        id: r.id, 
        withName: r.other_name || (r.from_user_id===s.userId ? 'Your student' : 'Your instructor'), 
        subject: r.subject_name || 'General' 
      })));
    } catch{}
  })(); },[]);
  if (!items.length) return null;
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Accepted requests</h3>
      <div className="flex flex-wrap gap-2">
        {items.map(it=> (
          <button key={it.id} className="px-3 py-2 rounded-md border bg-card hover:bg-card/80" onClick={()=> window.__OPEN_CHATBOT?.(`Hi ${it.withName}, let's chat about ${it.subject}.`)}>
            Chat with {it.withName} about {it.subject}
          </button>
        ))}
      </div>
    </div>
  );
};

const RequestCounters = ()=>{
  const [sent, setSent] = useState(0);
  const [received, setReceived] = useState(0);
  useEffect(()=>{ (async ()=>{
    const s = authService.getSession();
    if (!s.userId) return;
    try {
      const list = await tutoringService.getRequests(s.userId);
      setSent(list.filter(r=> r.from_user_id===s.userId).length);
      setReceived(list.filter(r=> r.to_user_id===s.userId).length);
    } catch {}
  })(); },[]);
  return (
    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
      <span>Sent: <strong>{sent}</strong></span>
      <span>Received: <strong>{received}</strong></span>
    </div>
  );
};

interface Course {
  _id: string;
  title: string;
  instructor: {
    full_name: string;
  };
  category: string;
  banner_url?: string;
  rating: number;
  price: number;
  currency: string;
  level: string;
  duration: string;
  description: string;
  total_students: number;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [peers, setPeers] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = authService.getSession();
    
    if (!session.userId) {
      navigate('/auth');
      return;
    }

    await loadProfile(session.userId);
    await loadPeers();
    await loadCourses();
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    try {
      const data = await profileService.getProfile(userId);
      setProfile(data);

      if (!data.bio || !data.major) {
        navigate('/profile-setup');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadPeers = async () => {
    try {
      const data = await profileService.getProfiles(20);
      setPeers(data || []);
    } catch (error) {
      console.error('Error loading peers:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await courseService.getCourses();
      setCourses(data.slice(0, 8) || []); // Show only 8 courses on dashboard
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  const filteredPeers = peers.filter(peer => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      peer.full_name?.toLowerCase().includes(query) ||
      peer.major?.toLowerCase().includes(query) ||
      peer.user_subjects?.some((us: UserSubject) => 
        us.subjects?.name?.toLowerCase().includes(query)
      )
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav like marketplace */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-6">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300"
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <img src={Logo} alt="PeerLearn logo" className="w-7 h-7 brightness-0 invert" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PeerLearn
            </span>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-2">
            {['Development', 'Design', 'Science', 'Business'].map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 group"
                onClick={() => navigate(`/courses?category=${category}`)}
              >
                {category}
                <motion.div
                  className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full group-hover:left-0 transition-all duration-300"
                  layoutId={`nav-indicator-${category}`}
                />
              </motion.button>
            ))}
          </nav>
          <div className="flex-1 max-w-2xl">
            <motion.form 
              className="relative flex items-center gap-3" 
              onSubmit={(e) => e.preventDefault()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative flex-1 group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  layoutId="search-glow"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-300 z-10" />
                <Input 
                  placeholder="Search for courses, subjects, or peers..." 
                  className="pl-12 pr-4 py-3 border-0 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 text-sm font-medium backdrop-blur-sm" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6"
                  onClick={() => { /* filter already live */ }}
                >
                  Search
                </Button>
              </motion.div>
            </motion.form>
          </div>
          
          <div className="ml-auto flex items-center gap-1">
            {[
              { label: 'All Courses', action: () => navigate('/courses'), icon: GraduationCap },
              { label: 'Requests', action: () => navigate('/requests'), icon: MessageCircle },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  className="group hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 rounded-xl"
                  onClick={item.action}
                >
                  <item.icon className="w-4 h-4 mr-2 group-hover:text-purple-600 transition-colors" />
                  {item.label}
                </Button>
              </motion.div>
            ))}
            
            <div className="hidden sm:block">
              <RequestCounters />
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                className="group hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 rounded-xl"
                onClick={() => navigate('/profile-setup')}
              >
                <User className="w-4 h-4 mr-2 group-hover:text-purple-600 transition-colors" />
                Profile
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                className="group text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 rounded-xl"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Sign Out
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Hero banner */}
        <motion.div 
          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 mb-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
            <div className="absolute bottom-8 right-8 w-16 h-16 bg-white/5 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-16 w-12 h-12 bg-white/5 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
            <motion.div
              className="absolute top-6 right-1/4 w-8 h-8 bg-white/10 rounded-full"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          
          {/* Content */}
          <div className="relative z-10 text-white">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Welcome back, {profile?.full_name}! 🎉
              </h2>
              <p className="text-purple-100 text-lg mb-6">
                Ready to continue your learning journey? Discover amazing courses and connect with brilliant minds.
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-white/30 transition-all duration-300 border border-white/20"
                onClick={() => navigate('/courses')}
              >
                ✨ Explore Courses
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-all duration-300 shadow-lg"
                onClick={() => navigate('/requests')}
              >
                💬 My Requests
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Accepted requests quick chat */}
        <AcceptedRequests />

        {/* Featured Courses Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Featured Courses
            </h3>
            <Button 
              variant="outline" 
              className="group hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white transition-all duration-300"
              onClick={() => navigate('/courses')}
            >
              View All
              <motion.div
                className="ml-2"
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.div>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  {/* Course banner */}
                  <div className="relative h-48 overflow-hidden">
                    {course.banner_url ? (
                      <img 
                        src={course.banner_url} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-purple-400" />
                      </div>
                    )}
                    
                    {/* Price badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-600 text-white font-bold">
                        ₹{course.price}
                      </Badge>
                    </div>
                    
                    {/* Level badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-blue-600 text-white">
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="font-bold text-lg mb-2 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                      {course.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      by {course.instructor?.full_name || 'Expert'}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.total_students} students
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Peer recommendations */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Connect with Peers
          </h3>
          <Button variant="outline" className="group hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white transition-all duration-300">
            View All
            <motion.div
              className="ml-2"
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.div>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPeers.map((peer, index) => {
            const teachingSubjects = peer.user_subjects?.filter((us: UserSubject) => us.can_teach) || [];
            const topSubject = teachingSubjects[0]?.subjects?.name || 'General';
            return (
              <motion.div
                key={peer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/peer/${peer.id}`)}
              >
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-blue-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-blue-600/5 group-hover:to-purple-600/10 transition-all duration-500" />
                  
                  {/* Floating badge */}
                  <motion.div
                    className="absolute -top-2 -right-2 z-10"
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg">
                      {peer.major || 'Student'}
                    </Badge>
                  </motion.div>

                  <CardHeader className="pb-3 relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-3 mb-2"
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all duration-300">
                          {peer.avatar_url ? (
                            <img src={peer.avatar_url} alt={peer.full_name} className="h-12 w-12 rounded-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold text-lg">
                              {peer.full_name?.charAt(0) || 'P'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold group-hover:text-purple-600 transition-colors duration-300">
                          {peer.full_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-medium">
                          {topSubject}
                        </p>
                      </div>
                    </motion.div>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                      <div className="absolute bottom-6 right-6 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                    </div>
                    
                    {/* Course preview */}
                    <motion.div
                      className="h-32 rounded-xl mb-4 relative overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      {peer.banner_url ? (
                        <img 
                          src={peer.banner_url} 
                          alt={peer.full_name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <GraduationCap className="w-12 h-12 text-purple-400 group-hover:text-purple-600 transition-colors duration-300" />
                        </div>
                      )}
                      
                      {/* Overlay with stats */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end p-3">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <Badge variant="secondary" className="text-xs bg-white/90 text-gray-800">
                            <Users className="w-3 h-3 mr-1" />
                            {teachingSubjects.length} subjects
                          </Badge>
                        </div>
                      </div>
                    </motion.div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 group-hover:scale-105 transition-all duration-300"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 rounded-lg border border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300"
                      >
                        <Star className="w-4 h-4 text-purple-600" />
                      </motion.button>
                    </div>

                    {/* Skills tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {teachingSubjects.slice(0, 2).map((subject, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Badge 
                            variant="outline" 
                            className="text-xs border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors duration-300"
                          >
                            {subject.subjects.name}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredPeers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No matches. Try a different search.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
