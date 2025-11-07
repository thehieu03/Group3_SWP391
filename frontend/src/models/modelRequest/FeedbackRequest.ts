export interface FeedbackRequest {
  orderId: number;
  productId: number;
  rating?: number;
  comment: string;
}
