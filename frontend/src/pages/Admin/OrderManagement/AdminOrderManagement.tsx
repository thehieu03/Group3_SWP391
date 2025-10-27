import { useState, useEffect, useCallback } from "react";
import useDebounce from "@hooks/useDebounce.tsx";
import { adminOrderServices } from "@services/AdminOrderServices.ts";
import type { OrderAdminResponse } from "@models/modelResponse/OrderAdminResponse.ts";
import OrderFilters from "@pages/Admin/OrderManagement/OrderFilters.tsx";
import OrderTable from "@pages/Admin/OrderManagement/OrderTable.tsx";
import OrderModal from "@pages/Admin/OrderManagement/OrderModal.tsx";
import OrderPagination from "@pages/Admin/OrderManagement/OrderPagination.tsx";
import OrderStats from "@pages/Admin/OrderManagement/OrderStats.tsx";

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState<OrderAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Search and filter states
  const [shopNameSearch, setShopNameSearch] = useState("");
  const [buyerNameSearch, setBuyerNameSearch] = useState("");
  const [sellerNameSearch, setSellerNameSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortField, setSortField] = useState<
    "orderDate" | "totalPrice" | "orderId"
  >("orderDate");

  // Debounced search values
  const debouncedShopNameSearch = useDebounce(shopNameSearch, 500);
  const debouncedBuyerNameSearch = useDebounce(buyerNameSearch, 500);
  const debouncedSellerNameSearch = useDebounce(sellerNameSearch, 500);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<OrderAdminResponse | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);

  // Load orders effect - no callback to avoid re-render
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const [ordersData, countData] = await Promise.all([
          adminOrderServices.getOrdersAdminAsync(
            debouncedShopNameSearch,
            debouncedBuyerNameSearch,
            debouncedSellerNameSearch,
            statusFilter,
            sortOrder,
            sortField,
            currentPage,
            pageSize
          ),
          adminOrderServices.getOrdersAdminCountAsync(
            debouncedShopNameSearch,
            debouncedBuyerNameSearch,
            debouncedSellerNameSearch,
            statusFilter
          ),
        ]);

        setOrders(ordersData);
        setTotalCount(countData);
      } catch (err) {
        setError("Không thể tải dữ liệu đơn hàng");
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, [
    debouncedShopNameSearch,
    debouncedBuyerNameSearch,
    debouncedSellerNameSearch,
    statusFilter,
    sortOrder,
    sortField,
    currentPage,
    pageSize,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedShopNameSearch,
    debouncedBuyerNameSearch,
    debouncedSellerNameSearch,
    statusFilter,
    sortOrder,
    sortField,
    pageSize,
  ]);

  const handleClearFilters = () => {
    setShopNameSearch("");
    setBuyerNameSearch("");
    setSellerNameSearch("");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  const handleViewOrder = useCallback((order: OrderAdminResponse) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedOrder(null);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <div className="text-sm text-gray-600">
          Tổng cộng: <span className="font-semibold">{totalCount}</span> đơn
          hàng
        </div>
      </div>

      {/* Stats */}
      <OrderStats orders={orders} totalCount={totalCount} />

      {/* Search and Filter Section */}
      <OrderFilters
        shopNameSearch={shopNameSearch}
        buyerNameSearch={buyerNameSearch}
        sellerNameSearch={sellerNameSearch}
        statusFilter={statusFilter}
        sortOrder={sortOrder}
        sortField={sortField}
        onShopNameChange={setShopNameSearch}
        onBuyerNameChange={setBuyerNameSearch}
        onSellerNameChange={setSellerNameSearch}
        onStatusFilterChange={setStatusFilter}
        onSortFieldChange={setSortField}
        onSortOrderChange={() =>
          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        }
        onClearFilters={handleClearFilters}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <OrderTable orders={orders} onViewOrder={handleViewOrder} />

      {/* Pagination */}
      <OrderPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* View Order Modal */}
      <OrderModal
        isOpen={showViewModal}
        order={selectedOrder}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default AdminOrderManagement;
