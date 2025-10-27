import type { FeedbackRequest } from "../models/modelRequest";
import { httpPost } from "../utils/http";


class FeedbackServices {
  async createFeedbackAsync(feedbackData: FeedbackRequest): Promise<string> {
    const response = await httpPost<string>("feedbacks", feedbackData);
    return response;
  }
}

export const feedbackServices = new FeedbackServices();
