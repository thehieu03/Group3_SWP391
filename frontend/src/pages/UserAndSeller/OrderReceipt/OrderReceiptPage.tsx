import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { orderServices } from "@services/OrderServices";
import type { OrderUserResponse } from "@models/modelResponse/OrderUserResponse";
import Button from "@components/Button/Button";
import routesConfig from "@config/routesConfig.ts";

const OrderReceiptPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async (showRefreshing = false) => {
    if (!orderId) return;

    try {
      setError(null);
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const orderData = await orderServices.getUserOrderDetailsAsync(Number(orderId));
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
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  // Auto refresh every 10 seconds
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      fetchOrderDetails(true);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [orderId, fetchOrderDetails]);

  const handleGoToOrderHistory = () => {
    navigate(routesConfig.userOrder);
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

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-green-600 text-4xl mb-4"
          />
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => navigate(routesConfig.home)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy đơn hàng</p>
          <Button
            onClick={() => navigate(routesConfig.home)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Quay lại"
              >
                <FontAwesomeIcon icon={faArrowLeft} size="lg" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Hóa đơn đơn hàng</h1>
            </div>
            {refreshing && (
              <div className="flex items-center gap-2 text-blue-600">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                <span className="text-sm">Đang cập nhật...</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
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

          {/* Status Info */}
          {order.status === "Pending" || order.status === "Processing" ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Đơn hàng đang được xử lý. Trạng thái sẽ tự động cập nhật khi có thay đổi.
              </p>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleGoToOrderHistory}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Xem lịch sử đơn hàng
            </Button>
            <Button
              onClick={() => navigate(routesConfig.home)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReceiptPage;

