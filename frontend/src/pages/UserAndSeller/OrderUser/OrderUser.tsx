import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OrderUserResponse } from "@models/modelResponse/OrderUserResponse.ts";
import { orderServices } from "@services/OrderServices.ts";
import { feedbackServices } from "@services/FeedbackServices.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faMessage, faStar, faTimes, faCopy, faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  formatPrice,
  formatDate,
  getStatusColor,
  getStatusText,
} from "@/helpers";
import routesConfig from "@config/routesConfig.ts";
import useDebounce from "@/hooks/useDebounce";
import Button from "@/components/Button/Button";

const OrderUser = () => {
  const navigate = useNavigate();
  const [orderUser, setOrderUser] = useState<OrderUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderUserResponse | null>(
    null
  );
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderUserResponse | null>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search and Filter States
  const [productNameSearch, setProductNameSearch] = useState("");
  const [shopNameSearch, setShopNameSearch] = useState("");
  const [sellerNameSearch, setSellerNameSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  // Debounced search values
  const debouncedProductNameSearch = useDebounce(productNameSearch, 500);
  const debouncedShopNameSearch = useDebounce(shopNameSearch, 500);
  const debouncedSellerNameSearch = useDebounce(sellerNameSearch, 500);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setSearchLoading(true);
        setError(null);
        setSearchMessage(null);
        // Fetch both orders and count in parallel
        const [data, count] = await Promise.all([
          orderServices.getOrdersUserAsync(
            debouncedProductNameSearch,
            debouncedShopNameSearch,
            debouncedSellerNameSearch,
            statusFilter,
            sortOrder,
            currentPage,
            pageSize
          ),
          orderServices.getOrdersUserCountAsync(
            debouncedProductNameSearch,
            debouncedShopNameSearch,
            debouncedSellerNameSearch,
            statusFilter
          ),
        ]);

        setOrderUser(data);
        setTotalCount(count);

        // Show message if no results
        if (data.length === 0) {
          const hasSearch =
            debouncedProductNameSearch ||
            debouncedShopNameSearch ||
            debouncedSellerNameSearch;
          const hasFilter = statusFilter !== "ALL";
          if (hasSearch || hasFilter) {
            setSearchMessage(
              "Không tìm thấy đơn hàng nào phù hợp với điều kiện tìm kiếm."
            );
          }
        }
      } catch {
        setError("Không thể tải danh sách đơn hàng");
      } finally {
        setSearchLoading(false);
        setLoading(false);
      }
    };
    void fetchOrders();
  }, [
    debouncedProductNameSearch,
    debouncedShopNameSearch,
    debouncedSellerNameSearch,
    statusFilter,
    sortOrder,
    currentPage,
    pageSize,
  ]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedProductNameSearch,
    debouncedShopNameSearch,
    debouncedSellerNameSearch,
  ]);

  const handleProductClick = (productId: number) => {
    navigate(routesConfig.getProductDetailsUrl(productId));
  };

  const handleSellerClick = (sellerName: string) => {
    navigate(`/seller/${encodeURIComponent(sellerName)}`);
  };

  const handleMessageClick = (sellerName: string, orderId: number) => {
    navigate(`/messages/${encodeURIComponent(sellerName)}?orderId=${orderId}`);
  };

  const handleFeedbackClick = (order: OrderUserResponse) => {
    setSelectedOrder(order);
    setRating(0);
    setFeedbackText("");
    setShowFeedbackModal(true);
  };

  const handleViewOrderDetails = async (orderId: number) => {
    try {
      setLoadingOrderDetails(true);
      const orderDetails = await orderServices.getUserOrderDetailsAsync(orderId);
      setSelectedOrderDetails(orderDetails);
      setShowOrderDetailsModal(true);
    } catch (err) {
      // Error handled silently - user can retry
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const handleCloseOrderDetailsModal = () => {
    setShowOrderDetailsModal(false);
    setSelectedOrderDetails(null);
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
        await feedbackServices.createFeedbackAsync({
          orderId: selectedOrder.orderId,
          productId: selectedOrder.productId,
          rating,
          comment: feedbackText,
        });

      // Update local state to mark as feedback
      setOrderUser((orders) =>
        orders.map((order) =>
          order.orderId === selectedOrder.orderId
            ? { ...order, hasFeedback: true }
            : order
        )
      );

      handleCloseModal();
    } catch {
      // Error submitting feedback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductNameSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductNameSearch(e.target.value);
  };

  const handleShopNameSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShopNameSearch(e.target.value);
  };

  const handleSellerNameSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSellerNameSearch(e.target.value);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (order: "asc" | "desc") => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

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
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if there's any search or filter applied
  const hasSearchOrFilter =
    debouncedProductNameSearch ||
    debouncedShopNameSearch ||
    debouncedSellerNameSearch ||
    statusFilter !== "ALL";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Đơn hàng đã mua</h1>

      {/* Search and Filter Controls */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={productNameSearch}
            onChange={handleProductNameSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Tìm theo tên shop..."
            value={shopNameSearch}
            onChange={handleShopNameSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Tìm theo tên người bán..."
            value={sellerNameSearch}
            onChange={handleSellerNameSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Pending">Chờ xử lý</option>
            <option value="Processing">Đang xử lý</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Failed">Thất bại</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={5}>5 đơn hàng/trang</option>
            <option value={10}>10 đơn hàng/trang</option>
            <option value={15}>15 đơn hàng/trang</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() => handleSortChange("desc")}
              className={`px-4 py-2 rounded-md transition-colors ${
                sortOrder === "desc"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Mới nhất
            </Button>
            <Button
              onClick={() => handleSortChange("asc")}
              className={`px-4 py-2 rounded-md transition-colors ${
                sortOrder === "asc"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cũ nhất
            </Button>
          </div>
          <div className="flex items-center gap-4">
            {searchLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                Đang tìm kiếm...
              </div>
            )}
            <div className="text-sm text-gray-600">
              Tổng: {totalCount} đơn hàng
            </div>
          </div>
        </div>

        {/* Search Message */}
        {searchMessage && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-yellow-700">{searchMessage}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
              {orderUser.length > 0 ? (
                orderUser.map((order, index) => (
                  <tr key={order.orderId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                          onClick={() => handleViewOrderDetails(order.orderId)}
                          title="Xem chi tiết đơn hàng"
                        >
                          <FontAwesomeIcon
                            icon={faBox}
                            className="w-5 h-5"
                          />
                        </Button>
                        <Button
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                          onClick={() =>
                            handleMessageClick(order.sellerName, order.orderId)
                          }
                          title="Nhắn tin cho người bán"
                        >
                          <FontAwesomeIcon
                            icon={faMessage}
                            className="w-5 h-5"
                          />
                        </Button>
                        {!order.hasFeedback && (
                          <Button
                            className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-full transition-colors"
                            onClick={() => handleFeedbackClick(order)}
                            title="Feedback về sản phẩm"
                          >
                            <FontAwesomeIcon
                              icon={faStar}
                              className="w-5 h-5"
                            />
                          </Button>
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
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <div className="text-gray-400 text-4xl mb-4">
                        <FontAwesomeIcon icon={faBox} className="text-4xl" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        {hasSearchOrFilter
                          ? "Không tìm thấy đơn hàng"
                          : "Chưa có đơn hàng nào"}
                      </h3>
                      <p className="text-gray-500">
                        {hasSearchOrFilter
                          ? "Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc."
                          : "Bạn chưa mua sản phẩm nào. Hãy khám phá các sản phẩm trên trang!"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="mt-6 bg-white shadow-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            {/* Page info */}
            <div className="text-sm text-gray-600">
              Hiển thị trang {currentPage} của {totalPages} trang ({totalCount}{" "}
              đơn hàng)
            </div>

            {/* Pagination controls - only show if more than 1 page */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Trang đầu"
                >
                  Đầu
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Trang trước"
                >
                  Trước
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                          currentPage === pageNum
                            ? "bg-green-600 text-white border-green-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                        title={`Trang ${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Trang sau"
                >
                  Sau
                </Button>
                <Button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Trang cuối"
                >
                  Cuối
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Feedback về sản phẩm
              </h2>
              <Button
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
              </Button>
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
                  <Button
                    key={star}
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
                  </Button>
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
              <Button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={rating === 0 || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi feedback"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
              <button
                onClick={handleCloseOrderDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {loadingOrderDetails ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="animate-spin text-green-600 text-4xl mb-4"
                  />
                  <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
              ) : selectedOrderDetails ? (
                <>
                  {/* Order Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Mã đơn hàng</p>
                        <p className="text-lg font-semibold text-gray-900">
                          #{selectedOrderDetails.orderId}
                        </p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg border ${
                          selectedOrderDetails.status === "Completed" || selectedOrderDetails.status === "Delivered"
                            ? "text-green-600 bg-green-50 border-green-200"
                            : selectedOrderDetails.status === "Pending"
                            ? "text-yellow-600 bg-yellow-50 border-yellow-200"
                            : selectedOrderDetails.status === "Processing"
                            ? "text-blue-600 bg-blue-50 border-blue-200"
                            : "text-gray-600 bg-gray-50 border-gray-200"
                        }`}
                      >
                        <span className="font-medium">
                          {getStatusText(selectedOrderDetails.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                        <p className="text-gray-900">{formatDate(selectedOrderDetails.orderDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Số lượng</p>
                        <p className="text-gray-900">{selectedOrderDetails.quantity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-500">Sản phẩm</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedOrderDetails.productName}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-gray-500">Cửa hàng</p>
                        <p className="text-gray-900">{selectedOrderDetails.shopName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Người bán</p>
                        <p className="text-gray-900">{selectedOrderDetails.sellerName}</p>
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
                        {formatPrice(selectedOrderDetails.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Payload JSON */}
                  {selectedOrderDetails.payload && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">
                          Thông tin tài khoản (Payload JSON)
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrderDetails.payload || "");
                          }}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                          Sao chép
                        </button>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-green-400 font-mono">
                          {(() => {
                            try {
                              const parsed = JSON.parse(selectedOrderDetails.payload || "");
                              return JSON.stringify(parsed, null, 2);
                            } catch {
                              return selectedOrderDetails.payload;
                            }
                          })()}
                        </pre>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <Button
                onClick={handleCloseOrderDetailsModal}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderUser;
