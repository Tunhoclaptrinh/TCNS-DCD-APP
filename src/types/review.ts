export interface Review {
  id: number;
  userId: number;
  userName?: string;
  userAvatar?: string;
  heritageId?: number;
  artifactId?: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  type: "heritage" | "artifact";
  referenceId: number;
  rating: number;
  comment: string;
}
