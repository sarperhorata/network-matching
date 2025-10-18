import api from './api';

export const matchesService = {
  async getUserMatches(userId: string): Promise<any[]> {
    const response = await api.get(`/matches/user/${userId}`);
    return response.data;
  },

  async getEventMatches(eventId: string): Promise<any[]> {
    const response = await api.get(`/matches/event/${eventId}`);
    return response.data;
  },

  async generateMatches(eventId?: string, userId?: string): Promise<any> {
    const response = await api.post('/matches/generate', { eventId, userId });
    return response.data;
  },

  async getRecommendations(userId: string, limit: number = 5): Promise<any[]> {
    const response = await api.get(`/matches/recommendations/${userId}?limit=${limit}`);
    return response.data;
  },

  async updateMatchStatus(matchId: string, status: string): Promise<any> {
    const response = await api.put(`/matches/${matchId}/status`, { status });
    return response.data;
  },
};
