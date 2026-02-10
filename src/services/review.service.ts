import {apiClient} from "../config/api.client";
import {ENDPOINTS} from "../config/api.config";
import {BaseApiResponse} from "../types/api.types";

/**
 * Review Service
 * Handles user reviews for various content types
 */
class ReviewServiceClass {
  async getAll() {
    return [];
  }
}

export const ReviewService = new ReviewServiceClass();
