import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto & { senderId: string }): Promise<Message> {
    const message = this.messagesRepository.create(createMessageDto);
    return this.messagesRepository.save(message);
  }

  async update(id: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
    await this.messagesRepository.update(id, updateMessageDto);
    return this.messagesRepository.findOne({ where: { id } });
  }

  async findConversation(user1Id: string, user2Id: string): Promise<Message[]> {
    return this.messagesRepository
      .createQueryBuilder('message')
      .where(
        '(message.senderId = :user1Id AND message.receiverId = :user2Id) OR (message.senderId = :user2Id AND message.receiverId = :user1Id)',
        { user1Id, user2Id },
      )
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  async findUserConversations(userId: string): Promise<any[]> {
    // Get all unique conversations for a user
    const conversations = await this.messagesRepository
      .createQueryBuilder('message')
      .select([
        'CASE WHEN message.senderId = :userId THEN message.receiverId ELSE message.senderId END as otherUserId',
        'MAX(message.createdAt) as lastMessageTime',
        'COUNT(CASE WHEN message.receiverId = :userId AND message.isRead = false THEN 1 END) as unreadCount',
      ])
      .where('(message.senderId = :userId OR message.receiverId = :userId)', { userId })
      .groupBy('CASE WHEN message.senderId = :userId THEN message.receiverId ELSE message.senderId END')
      .orderBy('lastMessageTime', 'DESC')
      .getRawMany();

    return conversations;
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId, receiverId: userId },
    });

    if (message && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      return this.messagesRepository.save(message);
    }

    return message;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messagesRepository.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  async findById(id: string): Promise<Message | null> {
    return this.messagesRepository.findOne({ where: { id } });
  }
}

