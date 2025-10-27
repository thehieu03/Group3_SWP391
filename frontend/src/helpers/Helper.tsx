/**
 * Helper functions for common formatting and utility operations
 */
import React from "react";
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
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-red-100 text-red-800";
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
  switch (status.toLowerCase()) {
    case "completed":
      return "Hoàn thành";
    case "pending":
      return "Đang xử lý";
    case "cancelled":
      return "Đã hủy";
    case "active":
      return "Hoạt động";
    case "inactive":
      return "Không hoạt động";
    default:
      return status;
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
