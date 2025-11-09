import React, { useEffect, useState } from "react";
import { dashboardServices } from "@services/DashboardServices.ts";
import type { SellerDashboardResponse } from "@models/modelResponse/SellerDashboardResponse.tsx";
import { useDebounce } from "@hooks/index.tsx";
import { categoryServices } from "@services/CategoryServices.ts";
import type { CategoriesResponse } from "@models/modelResponse/CategoriesResponse.tsx";
import Pagination from "@components/Pagination/Pagination";

const SellerDashboard: React.FC = () => {
  const [data, setData] = useState<SellerDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(
    undefined
  );
  const [categories, setCategories] = useState<CategoriesResponse[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryServices.getAllCategoryAsync();
        setCategories(cats);
      } catch {
        // Failed to load categories
      }
    };
    loadCategories();
  }, []);

  // Reset to page 1 when filters or pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, categoryFilter, pageSize]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await dashboardServices.getSellerOverview(
          debouncedSearchTerm || undefined,
          statusFilter || undefined,
          categoryFilter,
          currentPage,
          pageSize
        );
        setData(res);
      } catch {
        setError("Không thể tải dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [
    debouncedSearchTerm,
    statusFilter,
    categoryFilter,
    currentPage,
    pageSize,
  ]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount);
  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleString("vi-VN") : "";

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800";

    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Seller Dashboard</h2>
          <p className="text-gray-600">Cửa hàng: {data?.shopName || "N/A"}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Sản phẩm</div>
            <div className="text-2xl font-bold">{data?.totalProducts ?? 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Đơn hàng</div>
            <div className="text-2xl font-bold">{data?.totalOrders ?? 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Doanh thu</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(data?.totalRevenue || 0)} VNĐ
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Đơn hàng chờ</div>
            <div className="text-2xl font-bold">{data?.pendingOrders ?? 0}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Đơn hàng gần đây
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm theo tên sản phẩm
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lọc theo trạng thái
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tất cả</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="PROCESSING">Đang xử lý</option>
                  <option value="SHIPPED">Đã giao hàng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lọc theo danh mục
                </label>
                <select
                  value={categoryFilter || ""}
                  onChange={(e) =>
                    setCategoryFilter(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tất cả</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                    Ngày
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                    Danh mục
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                    Phân loại
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                    SL
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                    Tổng
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.recentOrders?.length ? (
                  data!.recentOrders.map((item) => (
                    <tr
                      key={item.orderId}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">{item.productName}</td>
                      <td className="px-4 py-3">
                        {item.categoryName || "N/A"}
                      </td>
                      <td className="px-4 py-3">{item.variantName}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3 font-semibold">
                        {formatCurrency(item.totalPrice)} VNĐ
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-gray-500"
                      colSpan={7}
                    >
                      {debouncedSearchTerm || statusFilter || categoryFilter
                        ? "Không tìm thấy đơn hàng phù hợp"
                        : "Chưa có đơn hàng"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-center text-sm text-gray-600">
                Hiển thị {data.recentOrders?.length || 0} trong tổng số{" "}
                {data.totalItems || 0} đơn hàng
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Hiển thị:</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
                className="mt-6"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
