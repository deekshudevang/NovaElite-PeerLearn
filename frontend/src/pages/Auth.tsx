import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '@/assets/logo-creative.svg';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = (isSignUp = false) => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignUp && !fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(true)) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      await authService.signUp({
        email,
        password,
        fullName,
      });

      toast({
        title: 'Account Created! 🎉',
        description: 'Welcome to PeerLearn! You can now sign in.',
      });
      
      // Switch to login tab
      setActiveTab('login');
      setPassword(''); // Clear password for security
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message === 'email_taken' 
          ? 'This email is already registered. Try signing in instead.' 
          : error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(false)) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      await authService.signIn({
        email,
        password,
      });

      toast({
        title: 'Welcome back! 👋',
        description: 'Successfully signed in to PeerLearn.',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signin error:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message === 'invalid_credentials' 
          ? 'Invalid email or password. Please try again.' 
          : error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message.includes('Network Error') 
          ? 'Unable to connect to server. Please check your connection.' 
          : error.message;
      }
      
      toast({
        title: 'Sign In Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
          className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-xl"
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
      </div>

      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl w-full">
          {/* Left Side - Branding */}
          <motion.div 
            className="text-left space-y-6 hidden lg:block"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <motion.div 
                className="p-3 rounded-2xl bg-white shadow-lg backdrop-blur-sm border border-blue-200"
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
              >
                <img src={Logo} alt="PeerLearn logo" className="w-10 h-10" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                PeerLearn
              </h1>
            </div>
            
            <h2 className="text-5xl font-bold text-gray-900 leading-tight">
              Learn from the
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                best peers
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Join thousands of students connecting with expert tutors and passionate learners. Start your personalized learning journey today.
            </p>

            <div className="flex items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>50K+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Expert Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>4.8 Rating</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Auth Forms */}
          <motion.div 
            className="w-full max-w-md mx-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Mobile Logo */}
            <div className="text-center mb-8 lg:hidden">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-white shadow-md">
                  <img src={Logo} alt="PeerLearn logo" className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PeerLearn
                </h1>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      Sign in to continue your learning journey
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignIn}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                          Email address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="your.email@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`pl-10 py-3 border-2 focus:border-blue-500 transition-colors ${
                              errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
                            }`}
                          />
                        </div>
                        {errors.email && (
                          <motion.p 
                            className="text-sm text-red-600 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            {errors.email}
                          </motion.p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`pl-10 pr-10 py-3 border-2 focus:border-blue-500 transition-colors ${
                              errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <motion.p 
                            className="text-sm text-red-600 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            {errors.password}
                          </motion.p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <motion.div 
                        className="w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full py-3 text-base bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden" 
                          disabled={loading}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
                          />
                          <span className="relative z-10 flex items-center gap-2">
                            {loading ? 'Signing in...' : 'Sign In'}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                          </span>
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="signup">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-2xl font-bold">Join PeerLearn</CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      Create an account to start learning with peers
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignUp}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={`pl-10 py-3 border-2 focus:border-blue-500 transition-colors ${
                              errors.fullName ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
                            }`}
                          />
                        </div>
                        {errors.fullName && (
                          <motion.p 
                            className="text-sm text-red-600 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            {errors.fullName}
                          </motion.p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                          Email address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your.email@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`pl-10 py-3 border-2 focus:border-blue-500 transition-colors ${
                              errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
                            }`}
                          />
                        </div>
                        {errors.email && (
                          <motion.p 
                            className="text-sm text-red-600 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            {errors.email}
                          </motion.p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`pl-10 pr-10 py-3 border-2 focus:border-blue-500 transition-colors ${
                              errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <motion.p 
                            className="text-sm text-red-600 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            {errors.password}
                          </motion.p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Must be at least 6 characters long
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <motion.div 
                        className="w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full py-3 text-base bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden" 
                          disabled={loading}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
                          />
                          <span className="relative z-10 flex items-center gap-2">
                            {loading ? 'Creating account...' : 'Create Account'}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                          </span>
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Demo Credentials */}
            <motion.div 
              className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-yellow-800 font-medium mb-1">Try the demo:</p>
              <p className="text-xs text-yellow-700">
                Email: <code className="bg-yellow-100 px-1 rounded">alice@example.com</code><br/>
                Password: <code className="bg-yellow-100 px-1 rounded">password123</code>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
