import api from './api';
import type { Event, CreateEventDto, UpdateEventDto } from '../types';

export const eventsService = {
  async getEvents(page: number = 1, limit: number = 10): Promise<{
    events: Event[];
    total: number;
    totalPages: number;
  }> {
    const response = await api.get(`/events?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getEvent(id: string): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  async createEvent(eventData: CreateEventDto): Promise<Event> {
    const response = await api.post<Event>('/events', eventData);
    return response.data;
  },

  async updateEvent(id: string, eventData: UpdateEventDto): Promise<Event> {
    const response = await api.put<Event>(`/events/${id}`, eventData);
    return response.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },

  async joinEvent(id: string, message?: string): Promise<any> {
    const response = await api.post(`/events/${id}/join`, { message });
    return response.data;
  },

  async checkIn(id: string): Promise<any> {
    const response = await api.post(`/events/${id}/check-in`);
    return response.data;
  },

  async getEventParticipants(id: string): Promise<any[]> {
    const response = await api.get(`/events/${id}/participants`);
    return response.data;
  },

  async approveParticipant(eventId: string, participantId: string): Promise<any> {
    const response = await api.post(`/events/${eventId}/approve/${participantId}`);
    return response.data;
  },

  async rejectParticipant(eventId: string, participantId: string): Promise<any> {
    const response = await api.post(`/events/${eventId}/reject/${participantId}`);
    return response.data;
  },

  async generateQRCode(id: string): Promise<string> {
    const response = await api.get(`/events/${id}/qr-code`);
    return response.data;
  },
};
