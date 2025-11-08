import type { FeedbackResponse } from "@models/modelResponse/FeedbackResponse";
import { httpGet } from "@utils/http";

class FeedbackServices {
  async getFeedbacksByProductIdAsync(
    productId: number
  ): Promise<FeedbackResponse[]> {
    const response = await httpGet<FeedbackResponse[]>(
      `feedbacks/product/${productId}`
    );
    return response;
  }
}

export const feedbackServices = new FeedbackServices();
