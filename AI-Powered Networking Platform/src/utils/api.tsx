import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-fb863e38`;

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`,
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error [${endpoint}]:`, data.error || 'Unknown error');
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Call Failed [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  signup: (data: any) => apiCall('/auth/signup', { method: 'POST', body: data }),
  // Note: Login is handled client-side via Supabase auth

  // User
  getMe: (token: string) => apiCall('/users/me', { token }),
  updateMe: (data: any, token: string) => 
    apiCall('/users/me', { method: 'PUT', body: data, token }),

  // Events
  createEvent: (data: any, token: string) => 
    apiCall('/events', { method: 'POST', body: data, token }),
  getEvents: () => apiCall('/events'),
  getEvent: (id: string) => apiCall(`/events/${id}`),
  joinEvent: (id: string, token: string) => 
    apiCall(`/events/${id}/join`, { method: 'POST', token }),
  approveJoin: (eventId: string, userId: string, token: string) => 
    apiCall(`/events/${eventId}/approve/${userId}`, { method: 'POST', token }),
  checkIn: (id: string, token: string) => 
    apiCall(`/events/${id}/checkin`, { method: 'POST', token }),

  // Matches
  getRecommendations: (eventId: string, token: string) => 
    apiCall(`/matches/recommendations?eventId=${eventId}`, { token }),
  respondToMatch: (matchId: string, status: 'accepted' | 'declined', token: string) => 
    apiCall(`/matches/${matchId}/respond`, { method: 'POST', body: { status }, token }),

  // Conversations
  getConversations: (token: string) => apiCall('/conversations', { token }),
  createConversation: (participantId: string, token: string) => 
    apiCall('/conversations', { method: 'POST', body: { participantId }, token }),
  getMessages: (convId: string, token: string) => 
    apiCall(`/conversations/${convId}/messages`, { token }),
  sendMessage: (convId: string, content: string, token: string) => 
    apiCall(`/conversations/${convId}/messages`, { method: 'POST', body: { content }, token }),

  // Meetings
  createMeeting: (data: any, token: string) => 
    apiCall('/meetings', { method: 'POST', body: data, token }),
  getMeetings: (token: string) => apiCall('/meetings', { token }),
  updateMeetingStatus: (id: string, status: string, token: string) => 
    apiCall(`/meetings/${id}/status`, { method: 'PATCH', body: { status }, token }),

  // Analytics
  getUserAnalytics: (token: string) => apiCall('/analytics/user', { token }),
  getEventAnalytics: (id: string, token: string) => apiCall(`/analytics/event/${id}`, { token }),

  // Development
  seedDatabase: () => apiCall('/seed', { method: 'POST' }),
};
