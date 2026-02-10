export interface Review {
  id: number;
  userId: number;
  userName?: string;
  userAvatar?: string;
  referenceId?: number;
  referenceType?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  type: string;
  referenceId: number;
  rating: number;
  comment: string;
}
