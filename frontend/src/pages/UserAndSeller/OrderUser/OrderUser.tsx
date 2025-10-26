import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OrderUserResponse } from "@models/modelResponse/OrderUserResponse.ts";
import { orderServices } from "@services/OrderServices.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faMessage, faStar } from "@fortawesome/free-solid-svg-icons";
import {
  formatPrice,
  formatDate,
  getStatusColor,
  getStatusText,
} from "@/helpers";
import routesConfig from "@/config/routesConfig";

const OrderUser = () => {
  const navigate = useNavigate();
  const [orderUser, setOrderUser] = useState<OrderUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderUserResponse | null>(
    null
  );
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderServices.getOrdersUserAsync();
        setOrderUser(data);
      } catch {
        setError("Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    void fetchOrders();
  }, []);

  const handleProductClick = (productId: number) => {
    navigate(routesConfig.getProductDetailsUrl(productId));
  };

  const handleSellerClick = (sellerName: string) => {
    navigate(`/seller/${encodeURIComponent(sellerName)}`);
  };

  const handleMessageClick = (sellerName: string, orderId: string) => {
    navigate(`/messages/${encodeURIComponent(sellerName)}?orderId=${orderId}`);
  };

  const handleFeedbackClick = (order: OrderUserResponse) => {
    setSelectedOrder(order);
    setRating(0);
    setFeedbackText("");
    setShowFeedbackModal(true);
  };

  const handleCloseModal = () => {
    setShowFeedbackModal(false);
    setSelectedOrder(null);
    setRating(0);
    setFeedbackText("");
  };

  const handleSubmitFeedback = async () => {
    if (!selectedOrder || rating === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Gọi API để submit feedback
      // await feedbackServices.submitFeedbackAsync({
      //   orderId: selectedOrder.orderId,
      //   productId: selectedOrder.productId,
      //   rating,
      //   feedbackText,
      // });

      // Update local state to mark as feedback
      setOrderUser((orders) =>
        orders.map((order) =>
          order.orderId === selectedOrder.orderId
            ? { ...order, hasFeedback: true }
            : order
        )
      );

      handleCloseModal();
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Đơn hàng đã mua
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Đơn hàng đã mua
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderUser.length) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Đơn hàng đã mua
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">
              <FontAwesomeIcon icon={faBox} className="text-6xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-500">
              Bạn chưa mua sản phẩm nào. Hãy khám phá các sản phẩm trên trang!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Đơn hàng đã mua</h1>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên shop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người bán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày mua
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderUser.map((order, index) => (
                <tr key={order.orderId || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                        onClick={() =>
                          handleMessageClick(order.sellerName, order.orderId)
                        }
                        title="Nhắn tin cho người bán"
                      >
                        <FontAwesomeIcon icon={faMessage} className="w-5 h-5" />
                      </button>
                      {!order.hasFeedback && (
                        <button
                          className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-full transition-colors"
                          onClick={() => handleFeedbackClick(order)}
                          title="Feedback về sản phẩm"
                        >
                          <FontAwesomeIcon icon={faStar} className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="text-sm text-green-600 cursor-pointer hover:text-green-700 hover:underline transition-colors font-medium"
                      onClick={() => handleProductClick(order.productId)}
                      title="Click để xem chi tiết sản phẩm"
                    >
                      {order.productName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.shopName}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-green-600 cursor-pointer hover:text-green-700 hover:underline transition-colors font-medium"
                    onClick={() => handleSellerClick(order.sellerName)}
                    title="Click để xem thông tin người bán"
                  >
                    {order.sellerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.orderDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Tổng cộng: {orderUser.length} đơn hàng
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Feedback về sản phẩm
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                Sản phẩm:{" "}
                <span className="font-semibold">
                  {selectedOrder.productName}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Mã đơn hàng:{" "}
                <span className="font-semibold">{selectedOrder.orderId}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {rating === 1 && "Rất không hài lòng"}
                  {rating === 2 && "Không hài lòng"}
                  {rating === 3 && "Bình thường"}
                  {rating === 4 && "Hài lòng"}
                  {rating === 5 && "Rất hài lòng"}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập nhận xét của bạn..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitFeedback}
                disabled={rating === 0 || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderUser;
