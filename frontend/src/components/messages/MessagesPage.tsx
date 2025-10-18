import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { Conversation, Message } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

interface MessagesPageProps {
  startConversationWith?: string;
}

export function MessagesPage({ startConversationWith }: MessagesPageProps) {
  const { user, session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (startConversationWith && session) {
      handleStartConversation(startConversationWith);
    }
  }, [startConversationWith]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    if (!session) return;

    try {
      const response = await api.getConversations(session.access_token);
      setConversations(response.conversations || []);
      
      // Load participant names
      const names: Record<string, string> = {};
      for (const conv of response.conversations || []) {
        const otherUserId = conv.participants.find(id => id !== user?.id);
        if (otherUserId && !names[otherUserId]) {
          try {
            // Try to get user data from conversations (might be cached)
            names[otherUserId] = `Kullanıcı ${otherUserId.slice(0, 8)}`;
          } catch (e) {
            names[otherUserId] = `Kullanıcı ${otherUserId.slice(0, 8)}`;
          }
        }
      }
      setParticipantNames(names);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Konuşmalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!session) return;

    try {
      const response = await api.getMessages(conversationId, session.access_token);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Mesajlar yüklenemedi');
    }
  };

  const handleStartConversation = async (participantId: string) => {
    if (!session) return;

    try {
      const response = await api.createConversation(participantId, session.access_token);
      setSelectedConversation(response.conversation);
      loadConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Konuşma başlatılamadı');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || !selectedConversation || !newMessage.trim()) return;

    try {
      const response = await api.sendMessage(
        selectedConversation.id,
        newMessage,
        session.access_token
      );
      
      setMessages([...messages, response.message]);
      setNewMessage('');
      
      // Update conversation in list
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Mesaj gönderilemedi');
    }
  };

  const getOtherParticipantId = (conversation: Conversation) => {
    return conversation.participants.find(id => id !== user?.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Mesajlar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl mb-6">Mesajlar</h1>

      <Card className="h-[600px] flex">
        {/* Conversations List */}
        <div className="w-80 border-r">
          <ScrollArea className="h-full">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">Henüz konuşma yok</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => {
                  const otherUserId = getOtherParticipantId(conv);
                  const lastMessage = conv.messages?.[conv.messages.length - 1];
                  const displayName = participantNames[otherUserId || ''] || `Kullanıcı ${otherUserId?.slice(0, 8)}`;
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {displayName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{displayName}</p>
                          {lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {(participantNames[getOtherParticipantId(selectedConversation) || ''] || 'K')?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{participantNames[getOtherParticipantId(selectedConversation) || ''] || `Kullanıcı ${getOtherParticipantId(selectedConversation)?.slice(0, 8)}`}</p>
                    <p className="text-xs text-gray-600">Çevrimiçi</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isMine = message.senderId === user?.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isMine
                              ? 'bg-[#0EA5E9] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Bir konuşma seçin</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
