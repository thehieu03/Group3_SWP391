import { useEffect, useState } from "react";
import { orderServices } from "@services/OrderServices.ts";
import type {
  OrderAdminResponse,
  OrderDetailResponse,
} from "@models/modelResponse/OrderAdminResponse.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faEye } from "@fortawesome/free-solid-svg-icons";
import {
  formatPrice,
  formatDate,
  getStatusColor,
  getStatusText,
} from "@/helpers";
import useDebounce from "@/hooks/useDebounce";
import Button from "@/components/Button/Button";

const SellerOrders = () => {
  const [orders, setOrders] = useState<OrderAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Search and Filter States
  const [productNameSearch, setProductNameSearch] = useState("");
  const [productVariantNameSearch, setProductVariantNameSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Debounced search values
  const debouncedProductNameSearch = useDebounce(productNameSearch, 500);
  const debouncedProductVariantNameSearch = useDebounce(
    productVariantNameSearch,
    500
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setSearchLoading(true);
        setError(null);
        setSearchMessage(null);
        // Fetch both orders and count in parallel
        const [data, count] = await Promise.all([
          orderServices.getShopOrdersAsync(
            debouncedProductNameSearch,
            debouncedProductVariantNameSearch,
            statusFilter,
            sortOrder,
            currentPage,
            pageSize
          ),
          orderServices.getShopOrdersCountAsync(
            debouncedProductNameSearch,
            debouncedProductVariantNameSearch,
            statusFilter
          ),
        ]);

        setOrders(data);
        setTotalCount(count);

        // Show message if no results
        if (data.length === 0) {
          const hasSearch =
            debouncedProductNameSearch || debouncedProductVariantNameSearch;
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
    debouncedProductVariantNameSearch,
    statusFilter,
    sortOrder,
    currentPage,
    pageSize,
  ]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedProductNameSearch, debouncedProductVariantNameSearch]);

  const handleProductNameSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductNameSearch(e.target.value);
  };

  const handleProductVariantNameSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductVariantNameSearch(e.target.value);
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

  const handleViewOrder = async (orderId: number) => {
    try {
      setLoadingDetail(true);
      setError(null);
      const detail = await orderServices.getOrderDetailsAsync(orderId);
      setSelectedOrderDetail(detail);
      setShowDetailModal(true);
    } catch {
      setError("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrderDetail(null);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Đơn hàng của shop
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
          Đơn hàng của shop
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
    debouncedProductVariantNameSearch ||
    statusFilter !== "ALL";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Đơn hàng của shop
      </h1>

      {/* Search and Filter Controls */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={productNameSearch}
            onChange={handleProductNameSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Tìm theo tên variant..."
            value={productVariantNameSearch}
            onChange={handleProductVariantNameSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Đang chờ</option>
            <option value="CONFIRMED">Đã xác nhận</option>
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
            <option value={20}>20 đơn hàng/trang</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên variant
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
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <tr key={order.orderId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.productName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.productVariantName || "N/A"}
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Button
                        onClick={() => handleViewOrder(order.orderId)}
                        disabled={loadingDetail}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Xem chi tiết tài khoản đã bán"
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-1" />
                        Xem
                      </Button>
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
                          : "Shop của bạn chưa có đơn hàng nào."}
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

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrderDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Chi tiết đơn hàng #{selectedOrderDetail.orderId}
              </h2>
              <Button
                onClick={handleCloseDetailModal}
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

            {/* Order Info */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Sản phẩm:</p>
                <p className="font-semibold">
                  {selectedOrderDetail.productName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Variant:</p>
                <p className="font-semibold">
                  {selectedOrderDetail.productVariantName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số lượng:</p>
                <p className="font-semibold">{selectedOrderDetail.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng tiền:</p>
                <p className="font-semibold">
                  {formatPrice(selectedOrderDetail.totalPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái:</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    selectedOrderDetail.status || ""
                  )}`}
                >
                  {getStatusText(selectedOrderDetail.status || "")}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày đặt:</p>
                <p className="font-semibold">
                  {formatDate(selectedOrderDetail.orderDate || "")}
                </p>
              </div>
            </div>

            {/* Payload */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payload (Thông tin tài khoản đã bán):
              </h3>
              {selectedOrderDetail.payload ? (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {selectedOrderDetail.payload}
                  </pre>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center text-gray-500">
                  <p>Không có thông tin payload cho đơn hàng này</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleCloseDetailModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
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

export default SellerOrders;
