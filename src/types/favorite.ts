export type FavoriteType = "item" | "category" | "other";

export interface Favorite {
  id: number;
  userId: number;
  type: FavoriteType;
  referenceId: number;
  createdAt: string;
}
