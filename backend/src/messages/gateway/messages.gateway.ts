import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(private readonly messagesService: MessagesService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth?.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify token and get user info
      // For now, we'll use a simplified approach
      const userId = client.handshake.auth?.userId;

      if (userId) {
        this.connectedUsers.set(userId, client.id);
        console.log(`User ${userId} connected with socket ${client.id}`);

        // Join user to their personal room
        client.join(`user_${userId}`);

        // Send connection success
        client.emit('connected', { userId });
      } else {
        client.disconnect();
      }
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove user from connected users map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { receiverId: string; content: string; eventId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const senderId = client.handshake.auth?.userId;

      if (!senderId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Create message in database
      const message = await this.messagesService.create({
        senderId,
        receiverId: data.receiverId,
        content: data.content,
        eventId: data.eventId,
      });

      // Send to receiver if online
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('new_message', message);
      }

      // Send back to sender
      client.emit('message_sent', message);

    } catch (error) {
      console.error('Message sending error:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.handshake.auth?.userId;

      if (!userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Update message as read
      const message = await this.messagesService.markAsRead(data.messageId, userId);

      // Notify sender that message was read
      if (message && message.senderId) {
        const senderSocketId = this.connectedUsers.get(message.senderId);
        if (senderSocketId) {
          this.server.to(senderSocketId).emit('message_read', {
            messageId: data.messageId,
            readBy: userId,
          });
        }
      }

      client.emit('message_marked_read', message);

    } catch (error) {
      console.error('Mark as read error:', error);
      client.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @MessageBody() data: { receiverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.handshake.auth?.userId;
    if (senderId) {
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('user_typing', {
          userId: senderId,
          typing: true,
        });
      }
    }
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @MessageBody() data: { receiverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.handshake.auth?.userId;
    if (senderId) {
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('user_typing', {
          userId: senderId,
          typing: false,
        });
      }
    }
  }
}
