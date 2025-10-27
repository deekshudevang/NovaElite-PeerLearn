import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/services/auth.service';
import { tutoringService, TutoringRequest } from '@/services/tutoring.service';
import { chatService } from '@/services/chat.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Clock, XCircle, MessageCircle, Send, User, Calendar, BookOpen } from 'lucide-react';

export default function Requests(){
  const [items, setItems] = useState<TutoringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string|null>(null);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const navigate = useNavigate();
  const me = authService.getSession().userId;

  async function load(){
    if (!me) { navigate('/auth'); return; }
    setLoading(true);
    try { const list = await tutoringService.getRequests(me!); setItems(list||[]); } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  const { sent, received, accepted, pending } = useMemo(()=> ({
    sent: items.filter(r=> r.from_user_id===me),
    received: items.filter(r=> r.to_user_id===me),
    accepted: items.filter(r=> r.status==='accepted'),
    pending: items.filter(r=> r.status==='pending'),
  }),[items, me]);

  const act = async (id: string, status: string)=>{
    setUpdating(id);
    try { 
      await tutoringService.updateRequestStatus(id, status); 
      await load(); 
      
      // Auto-open chat if accepted
      if (status === 'accepted') {
        setTimeout(() => setChatRequestId(id), 500);
      }
    } finally { setUpdating(null); }
  };

  const openChat = async (requestId: string) => {
    try {
      // Find the request to get participants
      const request = items.find(r => r.id === requestId);
      if (!request) return;
      
      // Create or get existing chat room
      const otherUserId = request.from_user_id === me ? request.to_user_id : request.from_user_id;
      const roomName = `Tutoring: ${request.subject_name || 'General'}`;
      
      const room = await chatService.createRoom({
        name: roomName,
        participants: [me!, otherUserId]
      });
      
      // Set active chat and open chat window
      setChatRequestId(requestId);
      
      // You can also navigate to a dedicated chat page if you have one
      // navigate(`/chat/${room._id}`);
      
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            My Requests
          </h1>
          <p className="text-gray-600">Manage your tutoring requests and start learning sessions</p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total Requests', value: items.length, color: 'from-blue-500 to-cyan-500' },
              { label: 'Accepted', value: accepted.length, color: 'from-green-500 to-emerald-500' },
              { label: 'Pending', value: pending.length, color: 'from-yellow-500 to-orange-500' },
              { label: 'Active Chats', value: accepted.length, color: 'from-purple-500 to-pink-500' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-r ${stat.color} p-4 rounded-2xl text-white shadow-lg`}
              >
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Received Requests */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-800">Received Requests</h2>
            <Badge className="bg-purple-100 text-purple-700">{received.length}</Badge>
          </div>
          
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {received.map((r, index) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  layout
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <motion.div whileHover={{ scale: 1.1 }}>
                          <Avatar className="h-16 w-16 ring-4 ring-purple-100 group-hover:ring-purple-300 transition-all duration-300">
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-lg font-bold">
                              {(r.other_name || 'P').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-800">
                              {r.other_name || 'Anonymous Peer'}
                            </h3>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Badge className={`${getStatusColor(r.status)} flex items-center gap-1`}>
                                {getStatusIcon(r.status)}
                                {r.status}
                              </Badge>
                            </motion.div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-purple-600" />
                            <span className="text-purple-600 font-medium">{r.subject_name || 'General Subject'}</span>
                          </div>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {r.message || 'No message provided'}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                            <Calendar className="w-3 h-3" />
                            {new Date(r.created_at).toLocaleDateString()}
                          </div>
                          
                          {r.status === 'pending' && (
                            <motion.div 
                              className="flex gap-3"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <Button 
                                size="sm" 
                                disabled={updating === r.id}
                                onClick={() => act(r.id, 'accepted')}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1"
                              >
                                {updating === r.id ? (
                                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                    <Clock className="w-4 h-4" />
                                  </motion.div>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Accept
                                  </>
                                )}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={updating === r.id}
                                onClick={() => act(r.id, 'rejected')}
                                className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </motion.div>
                          )}
                          
                          {r.status === 'accepted' && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Button 
                                onClick={() => openChat(r.id)}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Start Chat Session
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {!received.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white/50 rounded-2xl backdrop-blur-sm"
              >
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No requests received yet</h3>
                <p className="text-gray-500">When others send you tutoring requests, they'll appear here.</p>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Sent Requests */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-800">Sent Requests</h2>
            <Badge className="bg-blue-100 text-blue-700">{sent.length}</Badge>
          </div>
          
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {sent.map((r, index) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  layout
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <motion.div whileHover={{ scale: 1.1 }}>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              <Send className="w-6 h-6" />
                            </div>
                          </motion.div>
                          <div className="w-0.5 h-8 bg-gradient-to-b from-blue-600 to-transparent mt-2" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              To {r.other_name || 'Anonymous Peer'}
                            </h3>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Badge className={`${getStatusColor(r.status)} flex items-center gap-1`}>
                                {getStatusIcon(r.status)}
                                {r.status}
                              </Badge>
                            </motion.div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-600 font-medium">{r.subject_name || 'General Subject'}</span>
                          </div>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {r.message || 'No message provided'}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(r.created_at).toLocaleDateString()}
                          </div>
                          
                          {r.status === 'accepted' && (
                            <motion.div
                              className="mt-4"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Button 
                                onClick={() => openChat(r.id)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Continue Chat
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {!sent.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white/50 rounded-2xl backdrop-blur-sm"
              >
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No requests sent yet</h3>
                <p className="text-gray-500">Start connecting with peers by browsing courses and sending requests.</p>
                <Button 
                  onClick={() => navigate('/courses')}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Browse Courses
                </Button>
              </motion.div>
            )}
          </div>
        </motion.section>
      </main>
      
      {/* Chat Window */}
      {chatRequestId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-2xl shadow-2xl border z-50"
        >
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl">
            <h3 className="font-semibold">Chat Session</h3>
            <button 
              onClick={() => setChatRequestId(null)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              ×
            </button>
          </div>
          <div className="p-4 h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-purple-400" />
              <p>Chat functionality is ready!</p>
              <p className="text-sm mt-1">Full chat interface coming soon.</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
