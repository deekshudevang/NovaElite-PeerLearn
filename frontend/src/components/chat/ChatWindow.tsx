import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService, type ChatRoom, type Message } from '@/services/chat.service';
import { authService } from '@/services/auth.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, X, Users } from 'lucide-react';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
  tutoringRequestId?: string;
}

export default function ChatWindow({ isOpen, onClose, roomId, tutoringRequestId }: ChatWindowProps) {
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = authService.getSession();

  useEffect(() => {
    if (isOpen && (roomId || tutoringRequestId)) {
      initializeChat();
    }
  }, [isOpen, roomId, tutoringRequestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    setLoading(true);
    try {
      let room: ChatRoom;
      
      if (roomId) {
        // Get existing room
        const rooms = await chatService.getRooms();
        room = rooms.find(r => r.id === roomId)!;
      } else if (tutoringRequestId) {
        // Create or get room for tutoring request
        room = await chatService.createRoom({
          tutoring_request_id: tutoringRequestId,
          title: 'Study Session Chat'
        });
      } else {
        return;
      }

      setCurrentRoom(room);
      
      // Load messages
      const msgs = await chatService.getMessages(room.id);
      setMessages(msgs);
      
      // Mark as read
      await chatService.markAsRead(room.id);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentRoom || sending) return;

    setSending(true);
    try {
      const message = await chatService.sendMessage(currentRoom.id, {
        content: newMessage.trim()
      });
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    msgs.forEach(msg => {
      const date = new Date(msg.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 right-4 w-96 h-[500px] z-50"
      >
        <Card className="h-full flex flex-col shadow-lg border-2">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-sm">
                    {currentRoom?.title || 'Chat'}
                  </CardTitle>
                  {currentRoom && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {currentRoom.participants.length} participants
                    </div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {currentRoom?.subject && (
              <Badge variant="secondary" className="w-fit text-xs">
                {currentRoom.subject}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ScrollArea className="flex-1 p-4">
                {Object.entries(groupMessagesByDate(messages)).map(([date, dayMessages]) => (
                  <div key={date}>
                    <div className="flex justify-center my-4">
                      <Badge variant="outline" className="text-xs">
                        {formatDate(dayMessages[0].created_at)}
                      </Badge>
                    </div>
                    
                    {dayMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[80%] ${message.is_own ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="text-xs">
                              {message.sender.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`space-y-1 ${message.is_own ? 'text-right' : 'text-left'}`}>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {!message.is_own && (
                                <span className="font-medium">{message.sender.full_name}</span>
                              )}
                              <span>{formatTime(message.created_at)}</span>
                            </div>
                            
                            <div
                              className={`rounded-lg px-3 py-2 text-sm ${
                                message.is_own
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
            )}

            {/* Message input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending || loading}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!newMessage.trim() || sending || loading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}