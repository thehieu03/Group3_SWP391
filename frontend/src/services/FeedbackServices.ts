import { httpPost } from "@utils/http.ts";
import type { FeedbackRequest } from "@models/modelRequest";

class FeedbackServices {
  async createFeedbackAsync(feedbackData: FeedbackRequest): Promise<string> {
    const response = await httpPost<string>("feedbacks", feedbackData);
    return response;
  }
}

export const feedbackServices = new FeedbackServices();
