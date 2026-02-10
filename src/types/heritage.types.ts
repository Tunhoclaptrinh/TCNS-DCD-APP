import { BaseEntity } from './index';

export interface HeritageSite extends BaseEntity {
  name: string;
  type: string;
  description: string;
  location: string;
  address?: string;
  category: string;
  image: string;
  gallery: string[];
  historicalEra?: string;
  significance?: string;
  latitude?: number;
  longitude?: number;
  viewCount?: number;
  isFavorite?: boolean;
  // New fields for polish
  visitHours?: string;
  entranceFee?: number;
  yearEstablished?: string;
  culturalPeriod?: string;
  rating?: number;
  totalReviews?: number;
  unescoListed?: boolean;
  relatedHistoryIds?: number[];
  relatedHeritageIds?: number[];
  relatedArtifactIds?: number[];
}

export interface Artifact extends BaseEntity {
  name: string;
  description: string;
  image: string;
  gallery: string[];
  heritageId: number | string;
  category: string;
  dating?: string;
  material?: string;
  dimensions?: string;
  is3D?: boolean;
  modelUrl?: string; // URL for 3D model
  // New fields for polish
  yearCreated?: string;
  creator?: string;
  condition?: string;
  artifactType?: string;
  historicalContext?: string;
  culturalSignificance?: string;
  rating?: number;
  totalReviews?: number;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  image?: string;
}
