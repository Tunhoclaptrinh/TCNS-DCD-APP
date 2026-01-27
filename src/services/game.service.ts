import { apiClient } from '../config/api.client';
import { ENDPOINTS } from '../config/api.config';
import { GameProgress, Chapter, Level } from '../types/game.types';
import { BaseApiResponse } from '../types/api.types';

export const GameService = {
  getProgress: async () => {
    return apiClient.get<BaseApiResponse<GameProgress>>(ENDPOINTS.GAME.PROGRESS);
  },

  getChapters: async () => {
    return apiClient.get<BaseApiResponse<Chapter[]>>(ENDPOINTS.GAME.CHAPTERS);
  },

  getLevels: async (chapterId: number | string) => {
    // Note: Adjust the endpoint to match backend if necessary.
    // Based on endpoints config, it seems to be /game/levels/:chapterId which implies getting levels by chapter
    return apiClient.get<BaseApiResponse<Level[]>>(ENDPOINTS.GAME.LEVELS(chapterId));
  },

  getLevelDetail: async (levelId: number | string) => {
    return apiClient.get<BaseApiResponse<any>>(ENDPOINTS.GAME.LEVEL_DETAIL(levelId));
  },

  startLevel: async (levelId: number | string) => {
    return apiClient.post<BaseApiResponse<any>>(ENDPOINTS.GAME.START_LEVEL(levelId));
  },

  collectClue: async (levelId: number | string, clueId: string) => {
    return apiClient.post<BaseApiResponse<any>>(ENDPOINTS.GAME.COLLECT_CLUE(levelId), { clueId });
  },

  submitAnswer: async (sessionId: number | string, answerId: string) => {
    return apiClient.post<BaseApiResponse<{is_correct: boolean, points_earned: number, total_score: number, explanation?: string, correct_answer?: string}>>(ENDPOINTS.GAME.SUBMIT_ANSWER(sessionId), { answerId });
  },

  submitTimeline: async (sessionId: number | string, eventOrder: string[]) => {
      return apiClient.post<BaseApiResponse<{isCorrect: boolean, pointsEarned: number, totalScore: number}>>(ENDPOINTS.GAME.SUBMIT_TIMELINE(sessionId), { eventOrder });
  },

  nextScreen: async (sessionId: number | string) => {
      return apiClient.post<BaseApiResponse<any>>(ENDPOINTS.GAME.NEXT_SCREEN(sessionId));
  },

  completeLevel: async (levelId: number | string, score: number, timeSpent: number) => {
    return apiClient.post<BaseApiResponse<{correct: boolean, pointsEarned: number}>>(ENDPOINTS.GAME.COMPLETE_LEVEL(levelId), { score, timeSpent });
  }
};
