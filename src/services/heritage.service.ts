import { apiClient } from '../config/api.client';
import { API_CONFIG, ENDPOINTS } from '../config/api.config';
import { HeritageSite, Artifact, TimelineEvent } from '../types/heritage.types';
import { BaseApiResponse } from '../types/api.types';

export const HeritageService = {
  getAll: async (params?: any) => {
    return apiClient.get<BaseApiResponse<HeritageSite[]>>(ENDPOINTS.HERITAGE.BASE, params);
  },

  getOne: async (id: number | string) => {
    return apiClient.get<BaseApiResponse<HeritageSite>>(ENDPOINTS.HERITAGE.GET_ONE(id));
  },

  search: async (query: string) => {
    return apiClient.get<BaseApiResponse<HeritageSite[]>>(ENDPOINTS.HERITAGE.SEARCH, { q: query });
  },

  getNearby: async (lat: number, long: number) => {
    return apiClient.get<BaseApiResponse<HeritageSite[]>>(ENDPOINTS.HERITAGE.NEARBY, { latitude: lat, longitude: long });
  },

  getArtifacts: async (id: number | string) => {
    return apiClient.get<BaseApiResponse<Artifact[]>>(ENDPOINTS.HERITAGE.ARTIFACTS(id));
  },

  getTimeline: async (id: number | string) => {
    return apiClient.get<BaseApiResponse<TimelineEvent[]>>(ENDPOINTS.HERITAGE.TIMELINE(id));
  },
};
