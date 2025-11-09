export interface FeedbackResponse {
  id: number;
  accountId: number;
  orderId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
  accountUsername: string;
  accountEmail: string;
}
