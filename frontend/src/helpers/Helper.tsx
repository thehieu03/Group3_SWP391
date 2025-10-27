/**
 * Helper functions for common formatting and utility operations
 */
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * Format price to Vietnamese currency format
 * @param price - The price number to format
 * @returns Formatted price string in VND
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

/**
 * Format date to Vietnamese locale format
 * @param dateString - The date string to format
 * @returns Formatted date string in Vietnamese locale
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get status color classes for order status
 * @param status - The order status string
 * @returns Tailwind CSS classes for status color
 */
export const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Get status display text in Vietnamese
 * @param status - The status string
 * @returns Vietnamese status text
 */
export const getStatusText = (status: string): string => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "Chờ xác nhận";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "CANCELLED":
      return "Đã hủy";
    case "COMPLETED":
      return "Hoàn thành";
    case "ACTIVE":
      return "Hoạt động";
    case "INACTIVE":
      return "Không hoạt động";
    default:
      return status;
  }
};

/**
 * Get role badge color classes
 * @param role - The role string (ADMIN, SELLER, CUSTOMER, USER)
 * @param withBorder - Whether to include border classes (default: false)
 * @returns Tailwind CSS classes for role badge color
 */
export const getRoleBadgeColor = (role: string, withBorder = false): string => {
  const borderClass = withBorder ? " border" : "";
  switch (role.toUpperCase()) {
    case "ADMIN":
      return `bg-red-100 text-red-800${borderClass}-red-200`;
    case "SELLER":
      return `bg-blue-100 text-blue-800${borderClass}-blue-200`;
    case "CUSTOMER":
    case "USER":
      return `bg-green-100 text-green-800${borderClass}-green-200`;
    default:
      return `bg-gray-100 text-gray-800${borderClass}-gray-200`;
  }
};

/**
 * Get role display name in Vietnamese
 * @param role - The role string
 * @returns Vietnamese role display name
 */
export const getRoleDisplayName = (role: string): string => {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "Quản trị viên";
    case "SELLER":
      return "Người bán";
    case "CUSTOMER":
      return "Khách hàng";
    case "USER":
      return "Người dùng";
    default:
      return role;
  }
};

/**
 * Get status color classes for boolean active status
 * @param isActive - Boolean active status
 * @returns Tailwind CSS classes for status color
 */
export const getActiveStatusColor = (isActive: boolean): string => {
  return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
};

/**
 * Get status display text for boolean active status
 * @param isActive - Boolean active status
 * @returns Vietnamese status text
 */
export const getActiveStatusText = (isActive: boolean): string => {
  return isActive ? "Hoạt động" : "Không hoạt động";
};

/**
 * Format number to Vietnamese locale with thousand separators
 * @param number - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat("vi-VN").format(number);
};

/**
 * Format date to short format (only date, no time)
 * @param dateString - The date string to format
 * @returns Short formatted date string
 */
export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format date to time only format
 * @param dateString - The date string to format
 * @returns Time formatted string
 */
export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Safe text formatter - returns fallback if text is empty
 * @param text - The text to check
 * @param fallback - Fallback text if original is empty
 * @returns Safe text string
 */
export const safeText = (text: unknown, fallback = "—"): string => {
  return typeof text === "string" && text.trim().length > 0 ? text : fallback;
};

/**
 * Get status color classes for boolean active status (text only)
 * @param isActive - Boolean active status
 * @returns Tailwind CSS text color classes
 */
export const getActiveStatusTextColor = (isActive: boolean): string => {
  return isActive ? "text-green-600" : "text-red-600";
};

/**
 * Safe number formatter - handles invalid numbers
 * @param value - The value to format as number
 * @param fallback - Fallback value if invalid
 * @returns Safe formatted number string
 */
export const safeNumber = (value: unknown, fallback = "0"): string => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : fallback;
};

interface NotificationIcons {
  faStore: IconDefinition;
  faMoneyBillWave: IconDefinition;
  faHeadset: IconDefinition;
  faBox: IconDefinition;
  faChartBar: IconDefinition;
  faBell: IconDefinition;
}

/**
 * Get notification icon based on notification type
 * Note: This function returns React component, use in React components only
 * @param type - The notification type
 * @param icons - Object containing icon definitions
 * @returns React icon component
 */
export const getNotificationIcon = (
  type: string,
  icons: NotificationIcons
): React.ReactElement => {
  switch (type) {
    case "LatestShop":
      return <FontAwesomeIcon icon={icons.faStore} className="text-lg" />;
    case "LatestTransaction":
      return (
        <FontAwesomeIcon icon={icons.faMoneyBillWave} className="text-lg" />
      );
    case "LatestSupportTicket":
      return <FontAwesomeIcon icon={icons.faHeadset} className="text-lg" />;
    case "NewOrder":
      return <FontAwesomeIcon icon={icons.faBox} className="text-lg" />;
    case "TodayRevenue":
      return <FontAwesomeIcon icon={icons.faChartBar} className="text-lg" />;
    default:
      return <FontAwesomeIcon icon={icons.faBell} className="text-lg" />;
  }
};

/**
 * Get notification background color based on notification type
 * @param type - The notification type
 * @returns Tailwind CSS background color class
 */
export const getNotificationColor = (type: string): string => {
  switch (type) {
    case "LatestShop":
      return "bg-green-400";
    case "LatestTransaction":
      return "bg-blue-400";
    case "LatestSupportTicket":
      return "bg-yellow-400";
    case "NewOrder":
      return "bg-purple-400";
    case "TodayRevenue":
      return "bg-indigo-400";
    default:
      return "bg-gray-400";
  }
};
