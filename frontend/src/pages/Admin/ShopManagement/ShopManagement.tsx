import { useState, useEffect } from "react";
import { shopServices, type ShopForAdmin } from "@services/ShopServices.ts";
import useDebounce from "@hooks/useDebounce.tsx";
import Button from "@components/Button/Button.tsx";
import ViewShopModal from "./ViewShopModal";

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: Record<string, unknown>;
    };
  };
}

const ShopManagement = () => {
  const [shops, setShops] = useState<ShopForAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopNameSearch, setShopNameSearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingShop, setViewingShop] = useState<ShopForAdmin | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isBanning, setIsBanning] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalShops, setTotalShops] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const totalPages = Math.max(1, Math.ceil(totalShops / pageSize));

  const debouncedShopNameSearch = useDebounce(shopNameSearch, 500);
  const debouncedOwnerSearch = useDebounce(ownerSearch, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedShopNameSearch, debouncedOwnerSearch, filterStatus, sortOrder]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsSearching(true);
        setError(null);

        let result;
        if (filterStatus === "ALL") {
          result = await shopServices.getShopsPagedAsync(
            currentPage,
            pageSize,
            undefined,
            filterStatus,
            sortOrder,
            debouncedShopNameSearch,
            debouncedOwnerSearch,
            undefined
          );
        } else {
          result = await shopServices.getShopsPagedAsync(
            currentPage,
            pageSize,
            undefined,
            filterStatus,
            sortOrder,
            debouncedShopNameSearch,
            debouncedOwnerSearch,
            filterStatus.toUpperCase() as "PENDING" | "APPROVED" | "BANNED"
          );
        }

        setShops(result.items as ShopForAdmin[]);
        setTotalShops(result.total);
      } catch {
        setError("Không thể tải danh sách shop");
      } finally {
        setIsSearching(false);
        setLoading(false);
      }
    };

    void fetchShops();
  }, [
    currentPage,
    debouncedShopNameSearch,
    debouncedOwnerSearch,
    filterStatus,
    sortOrder,
    pageSize,
  ]);

  const handleViewShop = (shop: ShopForAdmin) => {
    setViewingShop(shop);
    setShowViewModal(true);
  };

  const handleApproveShop = async (shop: ShopForAdmin) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt shop ${shop.name}?`)) {
      return;
    }

    try {
      setIsApproving(true);
      setError(null);

      await shopServices.approveShopAsync(shop.id);

      let result;
      if (filterStatus === "ALL") {
        result = await shopServices.getShopsPagedAsync(
          currentPage,
          pageSize,
          undefined,
          filterStatus,
          sortOrder,
          debouncedShopNameSearch,
          debouncedOwnerSearch,
          undefined
        );
      } else {
        result = await shopServices.getShopsPagedAsync(
          currentPage,
          pageSize,
          undefined,
          filterStatus,
          sortOrder,
          debouncedShopNameSearch,
          debouncedOwnerSearch,
          filterStatus.toUpperCase() as "PENDING" | "APPROVED" | "BANNED"
        );
      }

      setShops(result.items as ShopForAdmin[]);
      setTotalShops(result.total);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as ApiError).response?.data?.message
          : "Không thể duyệt shop";
      setError(errorMessage || "Không thể duyệt shop");
    } finally {
      setIsApproving(false);
    }
  };

  const handleBanShop = async (shop: ShopForAdmin) => {
    if (!confirm(`Bạn có chắc chắn muốn ban shop ${shop.name}?`)) {
      return;
    }

    try {
      setIsBanning(true);
      setError(null);

      await shopServices.banShopAsync(shop.id);

      let result;
      if (filterStatus === "ALL") {
        result = await shopServices.getShopsPagedAsync(
          currentPage,
          pageSize,
          undefined,
          filterStatus,
          sortOrder,
          debouncedShopNameSearch,
          debouncedOwnerSearch,
          undefined
        );
      } else {
        result = await shopServices.getShopsPagedAsync(
          currentPage,
          pageSize,
          undefined,
          filterStatus,
          sortOrder,
          debouncedShopNameSearch,
          debouncedOwnerSearch,
          filterStatus.toUpperCase() as "PENDING" | "APPROVED" | "BANNED"
        );
      }

      setShops(result.items as ShopForAdmin[]);
      setTotalShops(result.total);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as ApiError).response?.data?.message
          : "Không thể ban shop";
      setError(errorMessage || "Không thể ban shop");
    } finally {
      setIsBanning(false);
    }
  };

  const getStatusBadgeColor = (status: "PENDING" | "APPROVED" | "BANNED") => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "BANNED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplayName = (status: "PENDING" | "APPROVED" | "BANNED") => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "BANNED":
        return "Đã ban";
      default:
        return "Không xác định";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý shop</h1>
          {totalShops > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Tổng cộng {totalShops} shop
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm theo tên shop
            </label>
            <div className="relative">
              <input
                type="text"
                value={shopNameSearch}
                onChange={(e) => setShopNameSearch(e.target.value)}
                placeholder="Nhập tên shop..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm theo chủ shop
            </label>
            <div className="relative">
              <input
                type="text"
                value={ownerSearch}
                onChange={(e) => setOwnerSearch(e.target.value)}
                placeholder="Nhập tên chủ shop..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="BANNED">Đã ban</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp theo ngày tạo
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => setSortOrder("desc")}
                className={`px-3 py-2 text-sm rounded-md ${
                  sortOrder === "desc"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Mới nhất
              </Button>
              <Button
                onClick={() => setSortOrder("asc")}
                className={`px-3 py-2 text-sm rounded-md ${
                  sortOrder === "asc"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cũ nhất
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên shop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chủ shop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khiếu nại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shops.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-3"></div>
                        Đang tìm kiếm...
                      </div>
                    ) : (
                      "Không tìm thấy shop nào"
                    )}
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {shop.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {shop.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shop.ownerUsername || "Chưa có"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shop.productCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shop.complaintCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                          shop.status
                        )}`}
                      >
                        {getStatusDisplayName(shop.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(shop.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleViewShop(shop)}
                          leftIcon={
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          }
                          className="text-blue-600 hover:text-blue-900 bg-transparent border-0 p-0"
                        >
                          Xem
                        </Button>
                        {shop.status === "PENDING" && (
                          <Button
                            onClick={() => handleApproveShop(shop)}
                            disabled={isApproving}
                            leftIcon={
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            }
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 bg-transparent border-0 p-0"
                          >
                            {isApproving ? "Đang duyệt..." : "Duyệt"}
                          </Button>
                        )}
                        {shop.status === "APPROVED" && (
                          <Button
                            onClick={() => handleBanShop(shop)}
                            disabled={isBanning}
                            leftIcon={
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                                />
                              </svg>
                            }
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 bg-transparent border-0 p-0"
                          >
                            {isBanning ? "Đang ban..." : "Ban"}
                          </Button>
                        )}
                        {shop.status === "BANNED" && (
                          <Button
                            onClick={() => handleApproveShop(shop)}
                            disabled={isApproving}
                            leftIcon={
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            }
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 bg-transparent border-0 p-0"
                          >
                            {isApproving ? "Đang gỡ ban..." : "Gỡ ban"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalShops > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </Button>
            <Button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {totalShops > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalShops)}
                </span>{" "}
                trong tổng số <span className="font-medium">{totalShops}</span>{" "}
                shop
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newPageSize = Number(e.target.value);
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
                <span className="text-sm text-gray-700">mục/trang</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Trang</span>
                <select
                  value={currentPage}
                  onChange={(e) =>
                    setCurrentPage(
                      Math.min(totalPages, Math.max(1, Number(e.target.value)))
                    )
                  }
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={totalPages <= 1}
                >
                  {Array.from(
                    { length: Math.max(1, totalPages) },
                    (_, i) => i + 1
                  ).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">/ {totalPages}</span>
              </div>
            </div>
            <div>
              {totalPages > 1 && (
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Trước</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      const showEllipsis =
                        index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex">
                          {showEllipsis && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          <Button
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? "z-10 bg-green-50 border-green-500 text-green-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}

                  <Button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Sau</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </nav>
              )}
            </div>
          </div>
        </div>
      )}

      <ViewShopModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingShop(null);
        }}
        shop={viewingShop}
      />
    </div>
  );
};

export default ShopManagement;
