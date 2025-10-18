import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { messagingService, type Conversation, type Message } from '../services/messaging.service';
import { usersService } from '../services/users.service';
import { authService } from '../services/auth.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { MessageCircle, Send, Clock, Check, CheckCheck } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();

      // Initialize WebSocket connection
      const token = authService.getToken();
      if (token) {
        messagingService.initSocket(user.id, token);

        // Set up event listeners
        messagingService.onMessage((message) => {
          setMessages(prev => [...prev, message]);
        });

        messagingService.onMessageRead((data) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === data.messageId
                ? { ...msg, isRead: true, readAt: new Date().toISOString() }
                : msg
            )
          );
        });

        messagingService.onUserTyping((data) => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (data.typing) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        });
      }
    }

    return () => {
      messagingService.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadConversation(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const conversationsData = await messagingService.getConversations();
      setConversations(conversationsData);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (otherUserId: string) => {
    try {
      const [messagesData, userData] = await Promise.all([
        messagingService.getConversation(otherUserId),
        usersService.getUser(otherUserId),
      ]);

      setMessages(messagesData);
      setOtherUser(userData);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      messagingService.sendMessage(selectedConversation, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Mesajlarınızı görmek için lütfen giriş yapın.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Mesajlar</h1>
          <p className="text-gray-600">Network bağlantılarınızla anlık mesajlaşın</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#0EA5E9]" />
                Konuşmalar
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600">Yükleniyor...</div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz konuşma yok</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Eşleşmelerinizle bağlantı kurarak mesajlaşmaya başlayın.
                  </p>
                  <Button asChild size="sm">
                    <a href="/matches">Eşleşmeleri Gör</a>
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map(conversation => (
                    <ConversationItem
                      key={conversation.otherUserId}
                      conversation={conversation}
                      isSelected={selectedConversation === conversation.otherUserId}
                      onClick={() => setSelectedConversation(conversation.otherUserId)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation && otherUser ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherUser?.profilePhoto} />
                      <AvatarFallback className="bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] text-white">
                        {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {otherUser.firstName} {otherUser.lastName}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{otherUser.company}</p>
                    </div>
                    {typingUsers.has(otherUser.id) && (
                      <Badge variant="secondary" className="text-xs">
                        yazıyor...
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(message => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.senderId === user.id}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <CardContent className="border-t p-4">
                  <div className="flex gap-3">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 min-h-[60px] max-h-[120px]"
                      rows={2}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      size="icon"
                      className="h-[60px] w-[60px]"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Mesajlaşmaya başlamak için bir konuşma seçin</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Conversation Item Component
function ConversationItem({
  conversation,
  isSelected,
  onClick
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    usersService.getUser(conversation.otherUserId).then(setUser).catch(console.error);
  }, [conversation.otherUserId]);

  if (!user) return null;

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-[#0EA5E9]/10 border-l-4 border-[#0EA5E9]' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.profilePhoto} />
          <AvatarFallback className="bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] text-white text-sm">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(conversation.lastMessageTime).toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </p>
          </div>
          <p className="text-xs text-gray-600 truncate">{user.company}</p>
        </div>
        {conversation.unreadCount > 0 && (
          <Badge className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
            {conversation.unreadCount}
          </Badge>
        )}
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
        isOwn
          ? 'bg-gradient-to-br from-[#0EA5E9] to-[#0A2540] text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className={`text-xs mt-1.5 flex items-center gap-1 ${
          isOwn ? 'text-white/80 justify-end' : 'text-gray-500'
        }`}>
          <Clock className="h-3 w-3" />
          {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
          {isOwn && (
            <span className="ml-1">
              {message.isRead ? (
                <CheckCheck className="h-3 w-3 text-green-300" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

