import api from './api';

export interface UserAnalytics {
  userId: string;
  eventsAttended: number;
  totalMatches: number;
  totalMeetings: number;
  messagesSent: number;
  messagesReceived: number;
  networkGrowth: number;
}

export interface EventAnalytics {
  eventId: string;
  totalParticipants: number;
  checkInRate: number;
  matchingRate: number;
  meetingRate: number;
  totalMatches: number;
  totalMeetings: number;
}

export interface OrganizerAnalytics {
  organizerId: string;
  totalEvents: number;
  totalParticipants: number;
  avgParticipantsPerEvent: number;
  totalMatches: number;
  totalMeetings: number;
}

export const analyticsService = {
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const response = await api.get<UserAnalytics>(`/analytics/user/${userId}`);
    return response.data;
  },

  async getEventAnalytics(eventId: string): Promise<EventAnalytics> {
    const response = await api.get<EventAnalytics>(`/analytics/event/${eventId}`);
    return response.data;
  },

  async getOrganizerAnalytics(organizerId: string): Promise<OrganizerAnalytics> {
    const response = await api.get<OrganizerAnalytics>(`/analytics/organizer/${organizerId}`);
    return response.data;
  },
};
