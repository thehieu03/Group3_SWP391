import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheckCircle, faSpinner, faCopy, faSync } from "@fortawesome/free-solid-svg-icons";
import { orderServices } from "@services/OrderServices";
import type { OrderUserResponse } from "@models/modelResponse/OrderUserResponse";
import Button from "@components/Button/Button";

interface OrderReceiptProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
}

const OrderReceipt = ({ orderId, isOpen, onClose }: OrderReceiptProps) => {
  const [order, setOrder] = useState<OrderUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchOrderDetails = useCallback(async (showRefreshing = false) => {
    try {
      setError(null);
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const orderData = await orderServices.getUserOrderDetailsAsync(orderId);
      setOrder(orderData);
      
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải thông tin đơn hàng"
      );
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId, fetchOrderDetails]);

  // Auto refresh when order is pending or processing
  useEffect(() => {
    if (!isOpen || !order) return;

    const isProcessing = order.status === "Pending" || order.status === "Processing";
    
    if (isProcessing) {
      // Auto refresh every 10 seconds if order is still processing
      const interval = setInterval(() => {
        fetchOrderDetails(true);
      }, 10000); // 10 seconds

      return () => clearInterval(interval);
    }
  }, [isOpen, order, fetchOrderDetails]);

  const handleRefresh = () => {
    fetchOrderDetails(true);
  };

  const handleCopyPayload = () => {
    if (order?.payload) {
      navigator.clipboard.writeText(order.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Hoàn thành";
      case "delivered":
        return "Đã giao";
      case "pending":
        return "Đang chờ";
      case "processing":
        return "Đang xử lý";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const parsePayload = (payload?: string) => {
    if (!payload) return null;
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  };

  if (!isOpen) return null;

  const payloadData = parsePayload(order?.payload);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Hóa đơn đơn hàng</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="text-green-600 hover:text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Làm mới"
            >
              <FontAwesomeIcon 
                icon={faSync} 
                size="lg" 
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && !order ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FontAwesomeIcon
                icon={faSpinner}
                className="animate-spin text-green-600 text-4xl mb-4"
              />
              <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          ) : order ? (
            <>
              {/* Order Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng</p>
                    <p className="text-lg font-semibold text-gray-900">
                      #{order.orderId}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <div className="flex items-center gap-2">
                      {refreshing && (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin"
                        />
                      )}
                      {!refreshing && (order.status === "Completed" || order.status === "Delivered") && (
                        <FontAwesomeIcon icon={faCheckCircle} />
                      )}
                      <span className="font-medium">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                    <p className="text-gray-900">{formatDate(order.orderDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số lượng</p>
                    <p className="text-gray-900">{order.quantity}</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-500">Sản phẩm</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.productName}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-500">Cửa hàng</p>
                    <p className="text-gray-900">{order.shopName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Người bán</p>
                    <p className="text-gray-900">{order.sellerName}</p>
                  </div>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Tổng tiền:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {order.totalPrice.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>

              {/* Payload JSON */}
              {order.payload && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                      Thông tin tài khoản (Payload JSON)
                    </p>
                    <button
                      onClick={handleCopyPayload}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                      {copied ? "Đã sao chép!" : "Sao chép"}
                    </button>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono">
                      {typeof payloadData === "object"
                        ? JSON.stringify(payloadData, null, 2)
                        : order.payload}
                    </pre>
                  </div>
                </div>
              )}

              {/* Status Info */}
              {order.status === "Pending" || order.status === "Processing" ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Đơn hàng đang được xử lý. Vui lòng nhấn nút làm mới để cập nhật trạng thái mới nhất.
                  </p>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <Button
            onClick={onClose}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;

