import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faStore, faUser } from "@fortawesome/free-solid-svg-icons";

interface OrderFiltersProps {
  shopNameSearch: string;
  buyerNameSearch: string;
  sellerNameSearch: string;
  statusFilter: string;
  sortOrder: "asc" | "desc";
  sortField: "orderDate" | "totalPrice" | "orderId";
  onShopNameChange: (value: string) => void;
  onBuyerNameChange: (value: string) => void;
  onSellerNameChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSortFieldChange: (value: "orderDate" | "totalPrice" | "orderId") => void;
  onSortOrderChange: () => void;
  onClearFilters: () => void;
}

const OrderFilters = ({
  shopNameSearch,
  buyerNameSearch,
  sellerNameSearch,
  statusFilter,
  sortOrder,
  sortField,
  onShopNameChange,
  onBuyerNameChange,
  onSellerNameChange,
  onStatusFilterChange,
  onSortFieldChange,
  onSortOrderChange,
  onClearFilters,
}: OrderFiltersProps) => {
  const statusOptions = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Chờ xác nhận" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tìm kiếm theo shop
          </label>
          <div className="relative">
            <input
              type="text"
              value={shopNameSearch}
              onChange={(e) => onShopNameChange(e.target.value)}
              placeholder="Nhập tên shop..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FontAwesomeIcon
              icon={faStore}
              className="absolute left-3 top-3 text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tìm kiếm theo người mua
          </label>
          <div className="relative">
            <input
              type="text"
              value={buyerNameSearch}
              onChange={(e) => onBuyerNameChange(e.target.value)}
              placeholder="Nhập tên người mua..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FontAwesomeIcon
              icon={faUser}
              className="absolute left-3 top-3 text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tìm kiếm theo người bán
          </label>
          <div className="relative">
            <input
              type="text"
              value={sellerNameSearch}
              onChange={(e) => onSellerNameChange(e.target.value)}
              placeholder="Nhập tên người bán..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FontAwesomeIcon
              icon={faUser}
              className="absolute left-3 top-3 text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              Sắp xếp theo:
            </label>
            <select
              value={sortField}
              onChange={(e) =>
                onSortFieldChange(
                  e.target.value as "orderDate" | "totalPrice" | "orderId"
                )
              }
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="orderDate">Ngày đặt hàng</option>
              <option value="totalPrice">Tổng tiền</option>
              <option value="orderId">ID đơn hàng</option>
            </select>
            <button
              onClick={onSortOrderChange}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
            >
              <FontAwesomeIcon icon={faSort} className="mr-1" />
              {sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
