import { apiClient } from '../config/api.client';
import { BaseApiResponse } from '../types/api.types';

export const UserService = {
  getActivity: async (userId: string | number) => {
    // Mock data for now as backend might not have this endpoint fully ready
    // In real implementation: return apiClient.get<BaseApiResponse<any[]>>(`/users/${userId}/activity`);
    
    return apiClient.get<BaseApiResponse<any>>(`/users/${userId}/activity`);
  },

  updateProfile: async (data: any) => {
     return apiClient.put('/users/profile', data);
  }
};
