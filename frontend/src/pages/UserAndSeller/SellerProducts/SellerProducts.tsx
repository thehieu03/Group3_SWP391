import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { productServices } from "@services/ProductServices";
import { categoryServices } from "@services/CategoryServices";
import { subcategoryServices } from "@services/SubcategoryServices";
import type { AdminProductResponse } from "@/models/modelResponse/AdminProductResponse";
import type { ProductResponse } from "@/models/modelResponse/ProductResponse";
import { useDebounce } from "@hooks/index.tsx";
import { useAuth } from "@hooks/useAuth";
import { shopServices } from "@services/ShopServices";
import ProductStats from "./components/ProductStats";
import ProductFilters from "./components/ProductFilters";
import ProductTable from "./components/ProductTable";
import ProductPagination from "./components/ProductPagination";
import ProductLoading from "./components/ProductLoading";
import ProductError from "./components/ProductError";
import AddProductModal from "./components/AddProductModal";

// Helper function to map ProductResponse to AdminProductResponse
const mapProductToAdminProduct = (
  product: ProductResponse
): AdminProductResponse => {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.minPrice || product.maxPrice || 0,
    categoryId: product.categoryId || 0,
    categoryName: product.categoryName || "",
    subcategoryId: product.subcategoryId || undefined,
    subcategoryName: product.subcategoryName || undefined,
    shopId: product.shopId || 0,
    shopName: product.shopName || "",
    stock: product.totalStock,
    primaryImageUrl: product.imageUrl || undefined,
    imageUrls: product.imageUrl ? [product.imageUrl] : undefined,
    isActive: product.isActive ?? true,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
    totalOrders: 0, // Not available in ProductResponse
    totalRevenue: 0, // Not available in ProductResponse
    details: product.details || undefined,
  };
};

const SellerProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopId, setShopId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [subcategoryFilter, setSubcategoryFilter] = useState<number | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<
    "name" | "price" | "createdAt" | "updatedAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Categories for filters
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [subcategories, setSubcategories] = useState<
    { id: number; name: string }[]
  >([]);

  // Add product modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Get shop ID for current seller
  useEffect(() => {
    const getShopId = async () => {
      console.log("[SellerProducts] Getting shop ID...");
      console.log("[SellerProducts] User:", user);
      console.log("[SellerProducts] User ID (accountId):", user?.id);
      console.log("[SellerProducts] User username:", user?.username);

      if (!user?.id) {
        console.error("[SellerProducts] User ID is missing");
        setError("Không tìm thấy thông tin người dùng");
        return;
      }

      try {
        console.log(
          "[SellerProducts] Calling getShopByAccountIdAsync with accountId:",
          user.id
        );
        const sellerShop = await shopServices.getShopByAccountIdAsync(user.id);
        console.log("[SellerProducts] Seller shop found:", sellerShop);

        if (sellerShop) {
          console.log("[SellerProducts] Setting shopId to:", sellerShop.id);
          setShopId(sellerShop.id);
          setError(null); // Clear any previous errors
        } else {
          console.warn(
            "[SellerProducts] No shop found for accountId:",
            user.id
          );
          setError("Không tìm thấy shop của bạn. Vui lòng đăng ký shop trước.");
        }
      } catch (error: unknown) {
        console.error("[SellerProducts] Error getting shop ID:", error);

        // Extract error message
        let errorMessage = "Không thể tải thông tin shop";
        if (error instanceof Error) {
          errorMessage = `Lỗi: ${error.message}`;
          console.error("[SellerProducts] Error message:", error.message);
          console.error("[SellerProducts] Error stack:", error.stack);
        } else if (typeof error === "object" && error !== null) {
          const err = error as {
            response?: { data?: unknown; status?: number };
            message?: string;
          };
          if (err.response) {
            console.error("[SellerProducts] Error response:", err.response);
            if (err.response.status === 404) {
              errorMessage =
                "Không tìm thấy shop của bạn. Vui lòng đăng ký shop trước.";
            } else {
              errorMessage = `Lỗi API (${
                err.response.status
              }): ${JSON.stringify(err.response.data)}`;
            }
          } else if (err.message) {
            errorMessage = `Lỗi: ${err.message}`;
          }
        }

        setError(errorMessage);
      }
    };

    if (user) {
      void getShopId();
    } else {
      console.log("[SellerProducts] No user found, waiting...");
    }
  }, [user]);

  // Store all products from API
  const [allProducts, setAllProducts] = useState<ProductResponse[]>([]);

  // Load data - memoized with useCallback
  const loadProducts = useCallback(async () => {
    if (!shopId) {
      console.log("[SellerProducts] loadProducts: No shopId, skipping...");
      return;
    }

    console.log(
      "[SellerProducts] loadProducts: Loading products for shopId:",
      shopId
    );

    try {
      setLoading(true);
      setError(null);

      // Call new API to get all products by shopId
      console.log(
        "[SellerProducts] Calling getProductsByShopIdAsync with shopId:",
        shopId
      );
      const productsData = await productServices.getProductsByShopIdAsync(
        shopId
      );
      console.log("[SellerProducts] Products received:", productsData);
      console.log("[SellerProducts] Number of products:", productsData.length);
      setAllProducts(productsData);
    } catch (error) {
      console.error("[SellerProducts] Error loading products:", error);
      setError("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
      console.log("[SellerProducts] loadProducts: Finished loading");
    }
  }, [shopId]);

  // Filter, sort and paginate products client-side
  const filteredAndPaginatedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.description?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    // Apply category filter
    if (categoryFilter !== null) {
      filtered = filtered.filter((p) => p.categoryId === categoryFilter);
    }

    // Apply subcategory filter
    if (subcategoryFilter !== null) {
      filtered = filtered.filter((p) => p.subcategoryId === subcategoryFilter);
    }

    // Apply status filter
    if (statusFilter !== null) {
      filtered = filtered.filter((p) => p.isActive === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | null | undefined;
      let bValue: string | number | null | undefined;

      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "price":
          aValue = a.minPrice ?? 0;
          bValue = b.minPrice ?? 0;
          break;
        case "createdAt":
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case "updatedAt":
          aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          break;
        default:
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const numA = Number(aValue);
      const numB = Number(bValue);
      return sortOrder === "asc" ? numA - numB : numB - numA;
    });

    // Calculate pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    // Map to AdminProductResponse
    const mappedProducts = paginated.map(mapProductToAdminProduct);

    return {
      products: mappedProducts,
      total,
      totalPages,
    };
  }, [
    allProducts,
    debouncedSearchTerm,
    categoryFilter,
    subcategoryFilter,
    statusFilter,
    sortBy,
    sortOrder,
    currentPage,
    limit,
  ]);

  // Update products and pagination when filtered data changes
  useEffect(() => {
    setProducts(filteredAndPaginatedProducts.products);
    setTotal(filteredAndPaginatedProducts.total);
    setTotalPages(filteredAndPaginatedProducts.totalPages);
  }, [filteredAndPaginatedProducts]);

  // Load filter options
  const loadFilterOptions = useCallback(async () => {
    try {
      console.log("[SellerProducts] Loading categories for filter...");
      const categoriesData = await categoryServices.getAllCategoryAsync();
      console.log("[SellerProducts] Categories loaded:", categoriesData);

      // Map CategoriesResponse to { id, name } format
      const mappedCategories = categoriesData.map((cat) => ({
        id: cat.id,
        name: cat.name,
      }));
      setCategories(mappedCategories);
      console.log("[SellerProducts] Mapped categories:", mappedCategories);
    } catch (error) {
      console.error("[SellerProducts] Failed to load categories:", error);
      // Failed to load filter options
    }
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (categoryFilter) {
        try {
          console.log(
            "[SellerProducts] Loading subcategories for category:",
            categoryFilter
          );
          const subcategoriesData =
            await subcategoryServices.getAllSubcategories(categoryFilter);
          console.log(
            "[SellerProducts] Subcategories loaded:",
            subcategoriesData
          );

          const mappedSubcategories = subcategoriesData.map((sub) => ({
            id: sub.id,
            name: sub.name,
          }));
          setSubcategories(mappedSubcategories);

          // Reset subcategory filter when category changes
          setSubcategoryFilter(null);
        } catch (error) {
          console.error(
            "[SellerProducts] Failed to load subcategories:",
            error
          );
          setSubcategories([]);
          setSubcategoryFilter(null);
        }
      } else {
        setSubcategories([]);
        setSubcategoryFilter(null);
      }
    };
    void loadSubcategories();
  }, [categoryFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    categoryFilter,
    subcategoryFilter,
    statusFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    console.log("[SellerProducts] shopId changed:", shopId);
    if (shopId) {
      console.log("[SellerProducts] shopId is set, calling loadProducts...");
      void loadProducts();
    } else {
      console.log("[SellerProducts] shopId is null, not loading products");
    }
  }, [shopId, loadProducts]);

  useEffect(() => {
    void loadFilterOptions();
  }, [loadFilterOptions]);

  // Handle actions - memoized with useCallback
  const handleToggleStatus = useCallback(
    async (id: number, currentStatus: boolean) => {
      try {
        const newStatus = !currentStatus;
        console.log(
          `[SellerProducts] Updating product ${id} status to ${newStatus}`
        );
        await productServices.updateProductStatusAsync(id, newStatus);
        await loadProducts(); // Reload data
      } catch (error) {
        console.error(
          "[SellerProducts] Failed to update product status:",
          error
        );
        alert("Không thể cập nhật trạng thái sản phẩm. Vui lòng thử lại.");
      }
    },
    [loadProducts]
  );

  const handleEdit = useCallback(
    (productId: number) => {
      // Navigate to edit page instead of opening modal
      navigate(`/seller/products/edit/${productId}`);
    },
    [navigate]
  );

  const handleAddProduct = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleAddProductSuccess = useCallback(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Memoized filter handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryChange = useCallback((value: number | null) => {
    setCategoryFilter(value);
    // Subcategory will be reset automatically in useEffect
  }, []);

  const handleSubcategoryChange = useCallback((value: number | null) => {
    setSubcategoryFilter(value);
  }, []);

  const handleStatusChange = useCallback((value: boolean | null) => {
    setStatusFilter(value);
  }, []);

  const handleSortByChange = useCallback(
    (value: "name" | "price" | "createdAt" | "updatedAt") => {
      setSortBy(value);
    },
    []
  );

  const handleSortOrderChange = useCallback((value: "asc" | "desc") => {
    setSortOrder(value);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("[SellerProducts] Component state:", {
      user: user ? { username: user.username, roles: user.roles } : null,
      shopId,
      loading,
      error,
      productsCount: products.length,
      allProductsCount: allProducts.length,
    });
  }, [user, shopId, loading, error, products.length, allProducts.length]);

  if (!shopId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Đang tải thông tin shop của bạn...</p>
          {error && <p className="text-red-600 mt-2 text-sm">Lỗi: {error}</p>}
          <div className="mt-2 text-xs text-gray-600">
            <p>User: {user ? user.username : "null"}</p>
            <p>ShopId: {shopId ?? "null"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quản lý sản phẩm
        </h1>
        <p className="text-gray-600">
          Quản lý và theo dõi sản phẩm của shop bạn
        </p>
      </div>

      <ProductStats products={products} total={total} />

      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        subcategoryFilter={subcategoryFilter}
        onSubcategoryChange={handleSubcategoryChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
        categories={categories}
        subcategories={subcategories}
        onAddProduct={handleAddProduct}
      />

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <ProductLoading />
        ) : error ? (
          <ProductError error={error} onRetry={loadProducts} />
        ) : (
          <>
            <ProductTable
              products={products}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEdit}
            />
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Add Product Modal */}
      {shopId && (
        <AddProductModal
          shopId={shopId}
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSuccess={handleAddProductSuccess}
        />
      )}
    </div>
  );
};

export default SellerProducts;
