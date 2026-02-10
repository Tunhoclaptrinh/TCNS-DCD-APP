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

  getByIds: async (ids: number[]) => {
      // Use the base endpoint with ids query param
      return apiClient.get<BaseApiResponse<HeritageSite[]>>(ENDPOINTS.HERITAGE.BASE, { ids: ids.join(',') });
  },

  getArtifacts: async (id: number | string) => {
    return apiClient.get<BaseApiResponse<Artifact[]>>(ENDPOINTS.HERITAGE.ARTIFACTS(id));
  },

  getTimeline: async (id: number | string) => {
    return apiClient.get<BaseApiResponse<TimelineEvent[]>>(ENDPOINTS.HERITAGE.TIMELINE(id));
  },

  getAllArtifacts: async (params?: any) => {
    return apiClient.get<BaseApiResponse<Artifact[]>>(ENDPOINTS.ARTIFACTS.BASE, params);
  },

  // History / Articles
  getHistory: async (params?: any) => {
    return apiClient.get<BaseApiResponse<TimelineEvent[]>>(ENDPOINTS.HISTORY.BASE, params);
  },

  getHistoryDetail: async (id: number | string) => {
    return apiClient.get<BaseApiResponse<TimelineEvent>>(ENDPOINTS.HISTORY.GET_ONE(id));
  },

  getRelatedHistory: async (id: number | string) => {
    return apiClient.get<BaseApiResponse<TimelineEvent[]>>(ENDPOINTS.HISTORY.RELATED(id));
  },
};
