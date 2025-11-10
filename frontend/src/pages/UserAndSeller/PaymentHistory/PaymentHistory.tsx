import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { paymentHistoryServices } from "@services/PaymentHistoryServices";
import { useAuth } from "@hooks/useAuth";
import type { PaymentHistorySummary } from "@models/modelResponse/PaymentHistoryResponse";
import Pagination from "@components/Pagination/Pagination";
import Button from "@components/Button/Button";

// Transaction type configuration
const TRANSACTION_TYPES = {
  DEPOSIT: {
    label: "Nạp tiền",
    badgeClass: "bg-green-600 text-white",
    amountClass: "text-green-600",
    sign: "+",
    isPositive: true,
  },
  PURCHASE: {
    label: "Mua hàng",
    badgeClass: "bg-yellow-500 text-gray-900",
    amountClass: "text-red-600",
    sign: "-",
    isPositive: false,
  },
  WITHDRAWAL: {
    label: "Rút tiền",
    badgeClass: "bg-red-600 text-white",
    amountClass: "text-red-600",
    sign: "-",
    isPositive: false,
  },
  SALE: {
    label: "Bán hàng",
    badgeClass: "bg-cyan-600 text-white",
    amountClass: "text-green-600",
    sign: "+",
    isPositive: true,
  },
} as const;

const TRANSACTION_TYPE_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "DEPOSIT", label: "Nạp tiền" },
  { value: "PURCHASE", label: "Mua Hàng" },
  { value: "SALE", label: "Bán hàng" },
  { value: "WITHDRAWAL", label: "Rút tiền" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

// Utility functions
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};

const getTransactionConfig = (type: string) => {
  const upperType = type?.toUpperCase() || "DEPOSIT";
  return TRANSACTION_TYPES[upperType as keyof typeof TRANSACTION_TYPES] || TRANSACTION_TYPES.DEPOSIT;
};

interface FilterState {
  startDate: string;
  endDate: string;
  transactionType: string;
}

const PaymentHistory: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  
  // State management
  const [paymentData, setPaymentData] = useState<PaymentHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    startDate: "",
    endDate: "",
    transactionType: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  
  // Track if we've successfully loaded data at least once
  const hasLoadedDataRef = useRef(false);

  // Fetch payment history
  const fetchPaymentHistory = useCallback(async () => {
    if (!isLoggedIn || !user) {
      setError("Bạn cần đăng nhập để xem lịch sử giao dịch");
      setLoading(false);
      setPaymentData(null);
      hasLoadedDataRef.current = false;
      return;
    }

    const isInitialLoad = !hasLoadedDataRef.current;
    
    try {
      setLoading(true);
      setError(null);

      const data = await paymentHistoryServices.getPaymentHistory(
        user.id,
        filters.startDate || undefined,
        filters.endDate || undefined,
        filters.transactionType || undefined,
        currentPage,
        pageSize
      );
      setPaymentData(data);
      hasLoadedDataRef.current = true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tải lịch sử giao dịch";
      setError(errorMessage);
      // Only clear data on initial load error, keep previous data on subsequent errors
      if (isInitialLoad) {
        setPaymentData(null);
        hasLoadedDataRef.current = false;
      }
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user?.id, filters.startDate, filters.endDate, filters.transactionType, currentPage, pageSize]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  // Reset to first page when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.startDate, filters.endDate, filters.transactionType, pageSize]);

  // Handlers
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      startDate: "",
      endDate: "",
      transactionType: "",
    });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  const handleRetry = useCallback(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  // Computed values
  const hasTransactions = useMemo(() => {
    return paymentData?.transactions && paymentData.transactions.length > 0;
  }, [paymentData?.transactions]);

  const isEmptyState = useMemo(() => {
    return !loading && !error && (!paymentData || !hasTransactions);
  }, [loading, error, paymentData, hasTransactions]);

  // Loading state
  if (loading && !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch sử giao dịch...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={handleRetry}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Lịch sử giao dịch
          </h2>

          {/* Filters Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Bộ lọc</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại giao dịch
                </label>
                <select
                  value={filters.transactionType}
                  onChange={(e) => handleFilterChange("transactionType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TRANSACTION_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </div>

          {/* Balance Information */}
          {paymentData && (
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Số dư hiện tại</div>
                <div className="text-2xl font-bold text-blue-800">
                  {formatAmount(paymentData.totalBalance || 0)} VNĐ
                </div>
              </div>
            </div>
          )}

          {/* Error message (if error occurs but we have previous data) */}
          {error && paymentData && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <Button
                onClick={handleRetry}
                className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Thử lại
              </Button>
            </div>
          )}

          {/* Loading indicator for subsequent loads */}
          {loading && paymentData && (
            <div className="mb-4 flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
              <p className="text-sm text-gray-600">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">
                    Ngày
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">
                    Loại
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">
                    Số tiền
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">
                    Lý do
                  </th>
                </tr>
              </thead>
              <tbody>
                {isEmptyState ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Chưa có giao dịch nào
                    </td>
                  </tr>
                ) : (
                  paymentData?.transactions.map((transaction) => {
                    const config = getTransactionConfig(transaction.type);
                    return (
                      <tr
                        key={transaction.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-bold ${config.badgeClass}`}
                          >
                            {config.label}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-bold ${config.amountClass}`}>
                          {config.sign}
                          {formatAmount(transaction.amount)} VNĐ
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {transaction.paymentDescription || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info and Controls */}
          {paymentData && !isEmptyState && (
            <>
              <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-600">
                  Hiển thị {paymentData.transactions?.length || 0} trong tổng số{" "}
                  {paymentData.totalItems || 0} giao dịch
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Hiển thị:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {paymentData.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={paymentData.currentPage}
                    totalPages={paymentData.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
