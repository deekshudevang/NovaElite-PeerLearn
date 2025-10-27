import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Menu, 
  X, 
  ShoppingCart, 
  Bell, 
  User, 
  ChevronDown,
  BookOpen,
  Code,
  Palette,
  Music,
  Camera,
  TrendingUp,
  Globe,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from '@/assets/logo-creative.svg';

const categories = [
  { name: 'Mathematics', icon: TrendingUp, color: 'text-blue-500' },
  { name: 'Programming', icon: Code, color: 'text-green-500' },
  { name: 'Design', icon: Palette, color: 'text-purple-500' },
  { name: 'Music', icon: Music, color: 'text-pink-500' },
  { name: 'Photography', icon: Camera, color: 'text-orange-500' },
  { name: 'Languages', icon: Globe, color: 'text-indigo-500' },
  { name: 'Science', icon: BookOpen, color: 'text-teal-500' },
  { name: 'Health', icon: Heart, color: 'text-red-500' },
];

interface NavigationProps {
  className?: string;
}

export const Navigation = ({ className = '' }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-border/50' 
          : 'bg-transparent'
      } ${className}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/')}
          >
            <motion.img
              src={Logo}
              alt="PeerLearn"
              className="w-8 h-8 lg:w-10 lg:h-10"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            />
            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PeerLearn
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 flex-1 max-w-2xl mx-8">
            {/* Categories Dropdown */}
            <DropdownMenu open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="gap-2 hover:bg-primary/10 transition-colors"
                >
                  <Menu className="w-4 h-4" />
                  Categories
                  <motion.div
                    animate={{ rotate: isCategoriesOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2">
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.name}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                      onClick={() => navigate(`/courses?category=${category.name.toLowerCase()}`)}
                    >
                      <category.icon className={`w-5 h-5 ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border-2 border-border/50 focus:border-primary/50 rounded-full bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
                <motion.button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-1.5 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="w-3 h-3" />
                </motion.button>
              </div>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/courses')}
              className="hover:bg-primary/10 transition-colors"
            >
              Browse Courses
            </Button>

            <motion.button
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            <motion.button
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile-setup')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/requests')}>
                  My Requests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/auth')}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Join Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.div>
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white/95 backdrop-blur-md border-t border-border/50 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search for anything..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </form>

                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/courses');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/requests');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    My Requests
                  </Button>
                </div>

                {/* Mobile Categories */}
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 6).map((category) => (
                      <Button
                        key={category.name}
                        variant="outline"
                        size="sm"
                        className="justify-start gap-2"
                        onClick={() => {
                          navigate(`/courses?category=${category.name.toLowerCase()}`);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <category.icon className={`w-4 h-4 ${category.color}`} />
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-border/50 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      navigate('/auth');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => {
                      navigate('/auth');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Join Now
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Navigation;