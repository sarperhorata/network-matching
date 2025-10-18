import api from './api';
import type { User, UpdateProfileDto } from '../types';

export const usersService = {
  async getUser(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async updateProfile(updateProfileDto: UpdateProfileDto): Promise<User> {
    const response = await api.put<User>('/users/profile', updateProfileDto);
    return response.data;
  },

  async uploadPhoto(file: File, photoType: 'profile' | 'banner'): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('photoType', photoType);

    const response = await api.post<{ url: string }>('/users/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async getUserMatches(userId: string): Promise<any[]> {
    const response = await api.get(`/users/${userId}/matches`);
    return response.data;
  },
};
