import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  /**
   * Create a new notification
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(dto);
    return this.notificationsRepository.save(notification);
  }

  /**
   * Get all notifications for a user
   */
  async findByUser(
    userId: string,
    limit: number = 50,
    onlyUnread: boolean = false,
  ): Promise<Notification[]> {
    const query = this.notificationsRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .limit(limit);

    if (onlyUnread) {
      query.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    return query.getMany();
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    return this.notificationsRepository.save(notification);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where('userId = :userId AND isRead = false', { userId })
      .execute();
  }

  /**
   * Delete a notification
   */
  async remove(id: string, userId: string): Promise<void> {
    await this.notificationsRepository.delete({ id, userId });
  }

  /**
   * Delete all read notifications for a user
   */
  async clearRead(userId: string): Promise<void> {
    await this.notificationsRepository.delete({
      userId,
      isRead: true,
    });
  }

  /**
   * Helper methods to create specific notification types
   */

  async notifyNewMatch(userId: string, matchedUserId: string, matchScore: number): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.MATCH,
      title: 'Yeni Eşleşme!',
      message: `%${matchScore} uyumla yeni bir eşleşmeniz var!`,
      actionUrl: `/matches`,
      relatedEntityId: matchedUserId,
      metadata: { matchScore },
    });
  }

  async notifyNewMessage(userId: string, senderId: string, senderName: string): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.MESSAGE,
      title: 'Yeni Mesaj',
      message: `${senderName} size mesaj gönderdi`,
      actionUrl: `/messages?user=${senderId}`,
      relatedEntityId: senderId,
    });
  }

  async notifyEventReminder(userId: string, eventId: string, eventTitle: string, hoursUntil: number): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.EVENT,
      title: 'Etkinlik Hatırlatıcısı',
      message: `"${eventTitle}" etkinliği ${hoursUntil} saat sonra başlıyor!`,
      actionUrl: `/events/${eventId}`,
      relatedEntityId: eventId,
      metadata: { hoursUntil },
    });
  }

  async notifyMeetingRequest(userId: string, meetingId: string, requesterName: string): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.MEETING,
      title: 'Yeni Toplantı Daveti',
      message: `${requesterName} sizinle toplantı yapmak istiyor`,
      actionUrl: `/meetings/${meetingId}`,
      relatedEntityId: meetingId,
    });
  }
}

