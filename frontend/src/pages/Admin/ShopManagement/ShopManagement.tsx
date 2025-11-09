import { useState, useEffect, useCallback } from "react";
import { shopServices, type ShopForAdmin } from "@services/ShopServices.ts";
import useDebounce from "@hooks/useDebounce.tsx";
import Button from "@components/Button/Button.tsx";
import ShopStatistics from "./ShopStatistics";
import ShopFilters from "./ShopFilters";
import ShopTable from "./ShopTable";
import ShopPagination from "./ShopPagination";
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
  const [statistics, setStatistics] = useState({
    totalShops: 0,
    pendingShops: 0,
    approvedShops: 0,
    bannedShops: 0,
  });

  const debouncedShopNameSearch = useDebounce(shopNameSearch, 500);
  const debouncedOwnerSearch = useDebounce(ownerSearch, 500);
  const calculateStatistics = useCallback((shops: ShopForAdmin[]) => {
    return {
      totalShops: shops.length,
      pendingShops: shops.filter((s) => s.status === "PENDING").length,
      approvedShops: shops.filter((s) => s.status === "APPROVED").length,
      bannedShops: shops.filter((s) => s.status === "BANNED").length,
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedShopNameSearch,
    debouncedOwnerSearch,
    filterStatus,
    sortOrder,
    shopNameSearch,
    ownerSearch,
  ]);
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const res = await shopServices.getShopsAsync();

        if (res.statistics) {
          setStatistics(res.statistics);
        } else {
          // Fallback: calculate statistics from shops data
          const stats = calculateStatistics(res.shops || []);
          setStatistics(stats);
        }
      } catch {
        // Error loading statistics
      }
    };

    void loadStatistics();
  }, [calculateStatistics]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsSearching(true);
        setError(null);
        const res = await shopServices.getShopsAsync();
        if (res.statistics) {
          setStatistics(res.statistics);
        } else {
          const stats = calculateStatistics(res.shops || []);
          setStatistics(stats);
        }

        let allShops = res.shops || [];
        if (shopNameSearch && shopNameSearch.trim()) {
          allShops = allShops.filter((shop: ShopForAdmin) =>
            shop.name
              .toLowerCase()
              .includes(shopNameSearch.trim().toLowerCase())
          );
        }

        if (ownerSearch && ownerSearch.trim()) {
          allShops = allShops.filter((shop: ShopForAdmin) =>
            shop.ownerUsername
              ?.toLowerCase()
              .includes(ownerSearch.trim().toLowerCase())
          );
        }

        if (filterStatus !== "ALL") {
          allShops = allShops.filter(
            (shop: ShopForAdmin) => shop.status === filterStatus
          );
        }
        if (sortOrder) {
          allShops = [...allShops].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
          });
        }

        const total = allShops.length;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedShops = allShops.slice(startIndex, endIndex);

        setShops(paginatedShops);
        setTotalShops(total);
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
    shopNameSearch,
    ownerSearch,
    calculateStatistics,
  ]);

  const handleViewShop = useCallback((shop: ShopForAdmin) => {
    setViewingShop(shop);
    setShowViewModal(true);
  }, []);

  const handleApproveShop = useCallback(
    async (shop: ShopForAdmin) => {
      if (!confirm(`Bạn có chắc chắn muốn duyệt shop ${shop.name}?`)) {
        return;
      }

      try {
        setIsApproving(true);
        setError(null);

        await shopServices.approveShopAsync(shop.id);
        const res = await shopServices.getShopsAsync();
        if (res.statistics) {
          setStatistics(res.statistics);
        } else {
          setStatistics(calculateStatistics(res.shops || []));
        }
        let allShops = res.shops || [];

        // Apply same filters
        if (shopNameSearch && shopNameSearch.trim()) {
          allShops = allShops.filter((s: ShopForAdmin) =>
            s.name.toLowerCase().includes(shopNameSearch.trim().toLowerCase())
          );
        }

        if (ownerSearch && ownerSearch.trim()) {
          allShops = allShops.filter((s: ShopForAdmin) =>
            s.ownerUsername
              ?.toLowerCase()
              .includes(ownerSearch.trim().toLowerCase())
          );
        }

        if (filterStatus !== "ALL") {
          allShops = allShops.filter(
            (s: ShopForAdmin) => s.status === filterStatus
          );
        }

        if (sortOrder) {
          allShops = [...allShops].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
          });
        }

        const total = allShops.length;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedShops = allShops.slice(startIndex, endIndex);

        setShops(paginatedShops);
        setTotalShops(total);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error && "response" in err
            ? (err as ApiError).response?.data?.message
            : "Không thể duyệt shop";
        setError(errorMessage || "Không thể duyệt shop");
      } finally {
        setIsApproving(false);
      }
    },
    [
      shopNameSearch,
      ownerSearch,
      filterStatus,
      sortOrder,
      currentPage,
      pageSize,
      calculateStatistics,
    ]
  );

  const handleBanShop = useCallback(
    async (shop: ShopForAdmin) => {
      if (!confirm(`Bạn có chắc chắn muốn ban shop ${shop.name}?`)) {
        return;
      }
      try {
        setIsBanning(true);
        setError(null);
        await shopServices.banShopAsync(shop.id);
        const res = await shopServices.getShopsAsync();
        if (res.statistics) {
          setStatistics(res.statistics);
        } else {
          setStatistics(calculateStatistics(res.shops || []));
        }
        let allShops = res.shops || [];
        if (shopNameSearch && shopNameSearch.trim()) {
          allShops = allShops.filter((s: ShopForAdmin) =>
            s.name.toLowerCase().includes(shopNameSearch.trim().toLowerCase())
          );
        }
        if (ownerSearch && ownerSearch.trim()) {
          allShops = allShops.filter((s: ShopForAdmin) =>
            s.ownerUsername
              ?.toLowerCase()
              .includes(ownerSearch.trim().toLowerCase())
          );
        }
        if (filterStatus !== "ALL") {
          allShops = allShops.filter(
            (s: ShopForAdmin) => s.status === filterStatus
          );
        }

        if (sortOrder) {
          allShops = [...allShops].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
          });
        }

        const total = allShops.length;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedShops = allShops.slice(startIndex, endIndex);

        setShops(paginatedShops);
        setTotalShops(total);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error && "response" in err
            ? (err as ApiError).response?.data?.message
            : "Không thể ban shop";
        setError(errorMessage || "Không thể ban shop");
      } finally {
        setIsBanning(false);
      }
    },
    [
      shopNameSearch,
      ownerSearch,
      filterStatus,
      sortOrder,
      currentPage,
      pageSize,
      calculateStatistics,
    ]
  );

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

      {/* Shop Statistics */}
      <ShopStatistics
        totalShops={statistics.totalShops}
        pendingShops={statistics.pendingShops}
        approvedShops={statistics.approvedShops}
        bannedShops={statistics.bannedShops}
      />

      {/* Filters */}
      <ShopFilters
        shopNameSearch={shopNameSearch}
        setShopNameSearch={setShopNameSearch}
        ownerSearch={ownerSearch}
        setOwnerSearch={setOwnerSearch}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        isSearching={isSearching}
      />

      {/* Shop Table */}
      <ShopTable
        shops={shops}
        isSearching={isSearching}
        onViewShop={handleViewShop}
        onApproveShop={handleApproveShop}
        onBanShop={handleBanShop}
        isApproving={isApproving}
        isBanning={isBanning}
      />

      {/* Pagination */}
      {totalShops > 0 && (
        <ShopPagination
          totalShops={totalShops}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
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
