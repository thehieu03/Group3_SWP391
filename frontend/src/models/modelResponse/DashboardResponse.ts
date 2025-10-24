export interface NotificationItem {
  type: string;
  message: string;
  createdAt: string;
  count: number;
}

export interface DashboardResponse {
  totalActiveUsers: number;
  totalActiveShops: number;
  totalSubcategories: number;
  totalTransactions: number;
  totalPendingSupportTickets: number;
  notifications: NotificationItem[];
}
