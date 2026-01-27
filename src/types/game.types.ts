import { BaseEntity } from './index';

export interface Chapter extends BaseEntity {
  title: string;
  description: string;
  order: number;
  imageUrl?: string;
  isUnlocked: boolean;
  minLevelRequired?: number;
}

export interface Level extends BaseEntity {
  title: string;
  description: string;
  chapterId: number | string;
  order: number;
  type: 'quiz' | 'puzzle' | 'exploration' | 'ar';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export interface GameProgress {
  currentLevelId: number | string;
  totalPoints: number;
  completedLevels: number[];
  unlockedChapters: number[];
  badges: Badge[];
}

export interface Badge extends BaseEntity {
  name: string;
  description: string;
  iconUrl: string;
  condition: string;
  obtainedAt?: string;
}
