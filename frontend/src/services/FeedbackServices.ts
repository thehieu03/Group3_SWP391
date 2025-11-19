import type { FeedbackResponse } from "@models/modelResponse/FeedbackResponse";
import { httpGet, httpPost } from "@utils/http";

interface CreateFeedbackRequest {
  orderId: number;
  productId: number;
  rating: number;
  comment: string;
}

class FeedbackServices {
  async getFeedbacksByProductIdAsync(
    productId: number
  ): Promise<FeedbackResponse[]> {
    const response = await httpGet<FeedbackResponse[]>(
      `feedbacks/product/${productId}`
    );
    return response;
  }

  async createFeedbackAsync(
    request: CreateFeedbackRequest
  ): Promise<FeedbackResponse> {
    const response = await httpPost<FeedbackResponse>("feedbacks", request);
    return response;
  }
}

export const feedbackServices = new FeedbackServices();
