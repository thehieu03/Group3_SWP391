import { memo, useCallback } from "react";

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: number | null;
  onCategoryChange: (value: number | null) => void;
  subcategoryFilter: number | null;
  onSubcategoryChange: (value: number | null) => void;
  statusFilter: boolean | null;
  onStatusChange: (value: boolean | null) => void;
  sortBy: "name" | "price" | "createdAt" | "updatedAt";
  onSortByChange: (value: "name" | "price" | "createdAt" | "updatedAt") => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  categories: { id: number; name: string }[];
  subcategories: { id: number; name: string }[];
  onAddProduct: () => void;
}

const ProductFilters = memo(
  ({
    searchTerm,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    subcategoryFilter,
    onSubcategoryChange,
    statusFilter,
    onStatusChange,
    sortBy,
    onSortByChange,
    sortOrder,
    onSortOrderChange,
    categories,
    subcategories,
    onAddProduct,
  }: ProductFiltersProps) => {
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
      },
      [onSearchChange]
    );

    const handleCategoryChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onCategoryChange(e.target.value ? Number(e.target.value) : null);
      },
      [onCategoryChange]
    );

    const handleSubcategoryChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSubcategoryChange(e.target.value ? Number(e.target.value) : null);
      },
      [onSubcategoryChange]
    );

    const handleStatusChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onStatusChange(
          e.target.value === "" ? null : e.target.value === "true"
        );
      },
      [onStatusChange]
    );

    const handleSortByChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSortByChange(
          e.target.value as "name" | "price" | "createdAt" | "updatedAt"
        );
      },
      [onSortByChange]
    );

    const handleSortOrderChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSortOrderChange(e.target.value as "asc" | "desc");
      },
      [onSortOrderChange]
    );

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tên sản phẩm..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={categoryFilter || ""}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục con
            </label>
            <select
              value={subcategoryFilter || ""}
              onChange={handleSubcategoryChange}
              disabled={!categoryFilter || subcategories.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Tất cả danh mục con</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={statusFilter === null ? "" : statusFilter.toString()}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tất cả</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Ngừng hoạt động</option>
            </select>
          </div>

          {/* Add Product Button */}
          <div className="flex items-end">
            <button
              onClick={onAddProduct}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold"
            >
              + Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp theo
            </label>
            <select
              value={sortBy}
              onChange={handleSortByChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="name">Tên</option>
              <option value="price">Giá</option>
              <option value="createdAt">Ngày tạo</option>
              <option value="updatedAt">Ngày cập nhật</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thứ tự
            </label>
            <select
              value={sortOrder}
              onChange={handleSortOrderChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
);

ProductFilters.displayName = "ProductFilters";

export default ProductFilters;
