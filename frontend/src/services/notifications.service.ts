import api from './api';

export enum NotificationType {
  MATCH = 'match',
  MESSAGE = 'message',
  EVENT = 'event',
  MEETING = 'meeting',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
}

export const notificationsService = {
  /**
   * Get user notifications
   */
  async getNotifications(limit: number = 50, onlyUnread: boolean = false): Promise<Notification[]> {
    const params = new URLSearchParams();
    params.append('limit', String(limit));
    if (onlyUnread) {
      params.append('onlyUnread', 'true');
    }
    
    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/mark-all-read');
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  /**
   * Clear all read notifications
   */
  async clearReadNotifications(): Promise<void> {
    await api.delete('/notifications/clear-read');
  },
};

