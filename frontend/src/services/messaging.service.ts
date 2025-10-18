import { io, Socket } from 'socket.io-client';
import api from './api';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  eventId?: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  otherUserId: string;
  lastMessageTime: string;
  unreadCount: number;
}

export class MessagingService {
  private socket: Socket | null = null;

  // Initialize WebSocket connection
  initSocket(userId: string, token: string): Socket {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(`${api.defaults.baseURL}/messages`, {
      auth: {
        token,
        userId,
      },
    });

    return this.socket;
  }

  // Send message via WebSocket
  sendMessage(receiverId: string, content: string, eventId?: string) {
    if (this.socket) {
      this.socket.emit('send_message', {
        receiverId,
        content,
        eventId,
      });
    }
  }

  // Mark message as read
  markAsRead(messageId: string) {
    if (this.socket) {
      this.socket.emit('mark_as_read', { messageId });
    }
  }

  // Handle typing indicators
  startTyping(receiverId: string) {
    if (this.socket) {
      this.socket.emit('typing_start', { receiverId });
    }
  }

  stopTyping(receiverId: string) {
    if (this.socket) {
      this.socket.emit('typing_stop', { receiverId });
    }
  }

  // Event listeners
  onMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  onMessageSent(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('message_sent', callback);
    }
  }

  onMessageRead(callback: (data: { messageId: string; readBy: string }) => void) {
    if (this.socket) {
      this.socket.on('message_read', callback);
    }
  }

  onUserTyping(callback: (data: { userId: string; typing: boolean }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onError(callback: (error: any) => void) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // REST API methods
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/messages');
    return response.data;
  }

  async getConversation(otherUserId: string): Promise<Message[]> {
    const response = await api.get(`/messages/conversation/${otherUserId}/${otherUserId}`);
    return response.data;
  }

  async sendMessageREST(receiverId: string, content: string, eventId?: string): Promise<Message> {
    const response = await api.post('/messages', {
      receiverId,
      content,
      eventId,
    });
    return response.data;
  }

  async markMessageRead(messageId: string): Promise<Message> {
    const response = await api.put(`/messages/${messageId}`, {
      isRead: true,
      readAt: new Date(),
    });
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get(`/messages/unread-count/${'current-user'}`);
    return response.data;
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const messagingService = new MessagingService();
