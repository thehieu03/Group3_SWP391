import type { FC } from "react";
import Button from "@components/Button/Button.tsx";

interface ShopFiltersProps {
  shopNameSearch: string;
  setShopNameSearch: (value: string) => void;
  ownerSearch: string;
  setOwnerSearch: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: "asc" | "desc") => void;
  isSearching: boolean;
}

const ShopFilters: FC<ShopFiltersProps> = ({
  shopNameSearch,
  setShopNameSearch,
  ownerSearch,
  setOwnerSearch,
  filterStatus,
  setFilterStatus,
  sortOrder,
  setSortOrder,
  isSearching,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search by Shop Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm theo tên shop
          </label>
          <div className="relative">
            <input
              type="text"
              value={shopNameSearch}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length === 0 || value[0] !== " ") {
                  setShopNameSearch(value);
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pastedText = e.clipboardData.getData("text").trimStart();
                if (pastedText) {
                  setShopNameSearch(pastedText);
                }
              }}
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
              onChange={(e) => {
                const value = e.target.value;
                if (value.length === 0 || value[0] !== " ") {
                  setOwnerSearch(value);
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pastedText = e.clipboardData.getData("text").trimStart();
                if (pastedText) {
                  setOwnerSearch(pastedText);
                }
              }}
              placeholder="Nhập tên chủ shop..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Status Filter */}
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

        {/* Sort Order */}
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
  );
};

export default ShopFilters;
