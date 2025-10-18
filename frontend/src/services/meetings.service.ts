import api from './api';
import type { Meeting } from '../types';

export interface CreateMeetingDto {
  participant1Id: string;
  participant2Id: string;
  eventId: string;
  scheduledTime: string;
  location?: string;
  notes?: string;
}

export interface UpdateMeetingDto {
  scheduledTime?: string;
  location?: string;
  notes?: string;
  status?: string;
}

export const meetingsService = {
  async getUserMeetings(userId: string): Promise<Meeting[]> {
    const response = await api.get(`/meetings/user/${userId}`);
    return response.data;
  },

  async getMeeting(id: string): Promise<Meeting> {
    const response = await api.get<Meeting>(`/meetings/${id}`);
    return response.data;
  },

  async createMeeting(meetingData: CreateMeetingDto): Promise<Meeting> {
    const response = await api.post<Meeting>('/meetings', meetingData);
    return response.data;
  },

  async updateMeeting(id: string, meetingData: UpdateMeetingDto): Promise<Meeting> {
    const response = await api.put<Meeting>(`/meetings/${id}`, meetingData);
    return response.data;
  },

  async deleteMeeting(id: string): Promise<void> {
    await api.delete(`/meetings/${id}`);
  },

  async acceptMeeting(id: string): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/${id}/accept`);
    return response.data;
  },

  async declineMeeting(id: string): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/${id}/decline`);
    return response.data;
  },

  async completeMeeting(id: string): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/${id}/complete`);
    return response.data;
  },

  async getCalendarLink(id: string): Promise<string> {
    const response = await api.get(`/meetings/${id}/calendar-link`);
    return response.data;
  },
};
