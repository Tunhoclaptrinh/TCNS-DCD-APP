import { apiClient } from "../config/api.client";
import { ENDPOINTS } from "../config/api.config";
import { BaseApiResponse } from "../types/api.types";

/**
 * Review Service
 * Handles user reviews for heritage sites and game levels
 */
class ReviewServiceClass {
  async getAll() {
    return [];
  }
}

export const ReviewService = new ReviewServiceClass();
