import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { AdminProductResponse } from "@/models/modelResponse/AdminProductResponse";
import type { ProductVariantResponse } from "@/models/modelResponse/ProductVariantResponse";
import { productServices } from "@services/ProductServices";
import { productVariantServices } from "@services/ProductVariantServices";
import { productStorageServices } from "@services/ProductStorageServices";
import { categoryServices } from "@services/CategoryServices";
import { subcategoryServices } from "@services/SubcategoryServices";
import type { CategoriesResponse } from "@/models/modelResponse/CategoriesResponse";
import type { SubcategoryResponse } from "@/models/modelResponse/SubcategoryResponse";
import type { ProductVariantRequest } from "@/models/modelRequest/ProductRequest";
import * as XLSX from "xlsx";

interface VariantWithStorage {
  variant: ProductVariantResponse;
  storageJson: string; // JSON string chứa mảng tài khoản
}

const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ? parseInt(id, 10) : null;

  const [product, setProduct] = useState<AdminProductResponse | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [details, setDetails] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [categories, setCategories] = useState<CategoriesResponse[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryResponse[]>([]);
  const [variantsWithStorage, setVariantsWithStorage] = useState<
    VariantWithStorage[]
  >([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryServices.getAllCategoryAsync();
        setCategories(data);
      } catch {
        // Failed to load categories
      }
    };
    void loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (categoryId) {
        try {
          const data = await subcategoryServices.getAllSubcategories(
            categoryId
          );
          setSubcategories(data);
        } catch {
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
    };
    void loadSubcategories();
  }, [categoryId]);

  // Load product data, variants and storages when page loads
  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) {
        setLoadingProduct(false);
        return;
      }

      setLoadingProduct(true);
      try {
        // Load product data
        const productData = await productServices.getProductByIdAsync(
          productId
        );

        // Map ProductResponse to AdminProductResponse
        const adminProduct: AdminProductResponse = {
          id: productData.id,
          name: productData.name,
          description: productData.description || "",
          price: productData.minPrice || productData.maxPrice || 0, // Keep for backward compatibility
          minPrice: productData.minPrice || undefined,
          maxPrice: productData.maxPrice || undefined,
          categoryId: productData.categoryId || 0,
          categoryName: productData.categoryName || "",
          subcategoryId: productData.subcategoryId || undefined,
          subcategoryName: productData.subcategoryName || undefined,
          shopId: productData.shopId || 0,
          shopName: productData.shopName || "",
          stock: productData.totalStock,
          primaryImageUrl: productData.imageUrl || undefined,
          imageUrls: productData.imageUrl ? [productData.imageUrl] : undefined,
          isActive: productData.isActive ?? true,
          createdAt: productData.createdAt || new Date().toISOString(),
          updatedAt: productData.updatedAt || new Date().toISOString(),
          totalOrders: 0,
          totalRevenue: 0,
          details: productData.details || undefined,
        };

        setProduct(adminProduct);
        setName(adminProduct.name);
        setDescription(adminProduct.description);
        setCategoryId(adminProduct.categoryId);
        setSubcategoryId(adminProduct.subcategoryId || null);
        setDetails(adminProduct.details || "");
        setImagePreview(adminProduct.primaryImageUrl || null);

        // Load variants and storages
        setLoadingVariants(true);
        try {
          const variants = await productVariantServices.getProductVariantsAsync(
            productId
          );

          // Load storages for each variant
          const variantsWithStorageData: VariantWithStorage[] =
            await Promise.all(
              variants.map(async (variant) => {
                try {
                  const storagesResponse =
                    await productStorageServices.getStoragesByVariantIdAsync(
                      variant.id
                    );

                  // Parse storages to JSON array
                  const accountsArray = storagesResponse.storages
                    .map((storage) => {
                      try {
                        return JSON.parse(storage.result);
                      } catch {
                        return null;
                      }
                    })
                    .filter((account) => account !== null);

                  return {
                    variant,
                    storageJson: JSON.stringify(accountsArray, null, 2),
                  };
                } catch {
                  // No storages found or error loading
                  return {
                    variant,
                    storageJson: "[]",
                  };
                }
              })
            );

          setVariantsWithStorage(variantsWithStorageData);
        } catch {
          setVariantsWithStorage([]);
        } finally {
          setLoadingVariants(false);
        }
      } catch {
        alert("Không thể tải thông tin sản phẩm. Vui lòng thử lại.");
        navigate("/seller/products");
      } finally {
        setLoadingProduct(false);
      }
    };
    void loadProductData();
  }, [productId, navigate]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("File phải là hình ảnh");
          e.target.value = "";
          return;
        }

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert("Kích thước hình ảnh phải nhỏ hơn 10MB");
          e.target.value = "";
          return;
        }

        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleVariantChange = useCallback(
    (
      variantIndex: number,
      field: "name" | "price" | "stock",
      value: string | number
    ) => {
      setVariantsWithStorage((prev) => {
        const updated = [...prev];
        updated[variantIndex] = {
          ...updated[variantIndex],
          variant: {
            ...updated[variantIndex].variant,
            [field]: value,
          },
        };
        return updated;
      });
    },
    []
  );

  const handleStorageChange = useCallback(
    (variantIndex: number, value: string) => {
      setVariantsWithStorage((prev) => {
        const updated = [...prev];
        updated[variantIndex] = {
          ...updated[variantIndex],
          storageJson: value,
        };
        return updated;
      });
    },
    []
  );

  // Excel import functionality
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleExcelFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv", // .csv
      ];
      const isValidType =
        validTypes.includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv");

      if (!isValidType) {
        alert("Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          if (!data) {
            alert("Không thể đọc file");
            return;
          }

          // Parse Excel file
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          }) as (string | number)[][];

          if (jsonData.length < 2) {
            alert(
              "File Excel phải có ít nhất 1 dòng dữ liệu (không tính header)"
            );
            return;
          }

          // Parse variants from Excel
          const headerRow = jsonData[0] as string[];
          const dataRows = jsonData.slice(1);

          // Find column indices (case-insensitive)
          const nameColIndex = headerRow.findIndex(
            (h) => h && h.toString().toLowerCase().includes("tên")
          );
          const priceColIndex = headerRow.findIndex(
            (h) => h && h.toString().toLowerCase().includes("giá")
          );
          const stockColIndex = headerRow.findIndex(
            (h) =>
              h &&
              (h.toString().toLowerCase().includes("số lượng") ||
                h.toString().toLowerCase().includes("stock"))
          );
          const storageColIndex = headerRow.findIndex(
            (h) =>
              h &&
              (h.toString().toLowerCase().includes("storage") ||
                h.toString().toLowerCase().includes("json"))
          );

          if (
            nameColIndex === -1 ||
            priceColIndex === -1 ||
            stockColIndex === -1
          ) {
            alert(
              "File Excel phải có các cột: Tên, Giá, Số lượng. Vui lòng kiểm tra lại header."
            );
            return;
          }

          const parsedVariants: VariantWithStorage[] = [];
          let hasDuplicateUsername = false;

          for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const name = String(row[nameColIndex] || "").trim();
            const price = parseFloat(String(row[priceColIndex] || "0"));
            const stock = parseInt(String(row[stockColIndex] || "0"), 10);
            const storageJson =
              storageColIndex !== -1
                ? String(row[storageColIndex] || "").trim()
                : "";

            // Skip empty rows
            if (!name && price === 0 && stock === 0) continue;

            // Validate required fields
            if (!name) {
              alert(`Dòng ${i + 2}: Thiếu tên variant`);
              continue;
            }
            if (isNaN(price) || price <= 0) {
              alert(`Dòng ${i + 2}: Giá không hợp lệ`);
              continue;
            }
            if (isNaN(stock) || stock < 0) {
              alert(`Dòng ${i + 2}: Số lượng không hợp lệ`);
              continue;
            }

            // Create a temporary variant (new variant, will be created on submit)
            // Use negative id to mark as new variant
            const tempId = -(parsedVariants.length + 1);
            const variant: ProductVariantResponse = {
              id: tempId,
              productId: productId || 0,
              name,
              price,
              stock,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // Validate storage JSON if provided
            let validatedStorageJson = "";
            if (storageJson) {
              try {
                const parsedStorage = JSON.parse(storageJson);
                if (Array.isArray(parsedStorage)) {
                  // Check for duplicate usernames in storage JSON
                  const usernames = parsedStorage
                    .map((item) => item?.username?.toLowerCase().trim())
                    .filter((username) => username);

                  const uniqueUsernames = new Set(usernames);
                  if (usernames.length !== uniqueUsernames.size) {
                    alert(
                      `Dòng ${
                        i + 2
                      }: Variant "${name}" có tài khoản trùng lặp trong Storage JSON. Import đã bị hủy. Vui lòng kiểm tra lại file Excel.`
                    );
                    hasDuplicateUsername = true;
                    break; // Break out of loop to cancel import
                  }

                  validatedStorageJson = storageJson;
                } else {
                  alert(
                    `Dòng ${
                      i + 2
                    }: Storage JSON phải là một mảng. Bỏ qua storage cho variant này.`
                  );
                }
              } catch {
                alert(
                  `Dòng ${
                    i + 2
                  }: Storage JSON không hợp lệ. Bỏ qua storage cho variant này.`
                );
              }
            }

            parsedVariants.push({
              variant,
              storageJson: validatedStorageJson,
            });
          }

          // Cancel import if there was duplicate username
          if (hasDuplicateUsername) {
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            return;
          }

          if (parsedVariants.length === 0) {
            alert("Không tìm thấy variant hợp lệ trong file Excel");
            return;
          }

          // Mặc định thêm vào (không thay thế)
          setVariantsWithStorage([...variantsWithStorage, ...parsedVariants]);

          alert(
            `Đã import thành công ${parsedVariants.length} variant từ file Excel`
          );
        } catch (error) {
          alert(
            `Lỗi khi đọc file Excel: ${
              error instanceof Error ? error.message : "Lỗi không xác định"
            }`
          );
        } finally {
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };

      reader.onerror = () => {
        alert("Lỗi khi đọc file");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.readAsBinaryString(file);
    },
    [variantsWithStorage, productId]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!product || !productId) return;

      // Validate required fields
      if (!name || !name.trim()) {
        alert("Vui lòng nhập tên sản phẩm");
        return;
      }

      if (!description || !description.trim()) {
        alert("Vui lòng nhập mô tả sản phẩm");
        return;
      }

      if (!categoryId) {
        alert("Vui lòng chọn danh mục");
        return;
      }

      // Validate image if provided
      if (image) {
        if (!image.type.startsWith("image/")) {
          alert("File phải là hình ảnh");
          return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (image.size > maxSize) {
          alert("Kích thước hình ảnh phải nhỏ hơn 10MB");
          return;
        }
      }

      // Validate and convert variants
      const variants: ProductVariantRequest[] = variantsWithStorage.map(
        (item) => {
          // Validate storage JSON if provided
          if (item.storageJson && item.storageJson.trim() !== "") {
            try {
              const accountsArray = JSON.parse(item.storageJson);
              if (!Array.isArray(accountsArray)) {
                throw new Error("Storage JSON phải là một mảng");
              }
              // Validate số lượng tài khoản phải khớp với stock
              const stock = item.variant.stock || 0;
              if (stock > 0 && accountsArray.length !== stock) {
                throw new Error(
                  `Số lượng tài khoản (${accountsArray.length}) không khớp với Stock (${stock}) của variant "${item.variant.name}"`
                );
              }
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : "Lỗi không xác định";
              throw new Error(
                `Lỗi trong storage của variant "${item.variant.name}": ${errorMessage}`
              );
            }
          }

          return {
            // Only include id if it's positive (existing variant)
            // Negative id means new variant, don't include id
            id: item.variant.id > 0 ? item.variant.id : undefined,
            name: item.variant.name,
            price: item.variant.price,
            stock: item.variant.stock || undefined,
            storageJson: item.storageJson || undefined,
          };
        }
      );

      setLoading(true);
      try {
        // Update product
        await productServices.updateProductAsync(
          productId,
          {
            name: name.trim(),
            description: description.trim(),
            categoryId: categoryId || undefined,
            subcategoryId: subcategoryId || undefined,
            shopId: product.shopId,
            details: details?.trim() || undefined,
            variants: variants.length > 0 ? variants : undefined,
          },
          image || undefined
        );

        // Update storages for each variant
        for (const item of variantsWithStorage) {
          if (item.storageJson && item.storageJson.trim() !== "") {
            try {
              const accountsArray = JSON.parse(item.storageJson);
              if (Array.isArray(accountsArray) && accountsArray.length > 0) {
                // Delete old storages and create new ones
                // For now, we'll create new storages (backend should handle cleanup)
                await productStorageServices.createStoragesAsync(
                  item.variant.id,
                  accountsArray
                );
              }
            } catch {
              // Continue with other variants
            }
          }
        }

        alert("Cập nhật sản phẩm thành công!");
        navigate("/seller/products");
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: { message?: string; errors?: unknown };
            status?: number;
          };
        };

        // Extract error message
        let errorMessage = "Không thể cập nhật sản phẩm. Vui lòng thử lại.";

        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.errors) {
          // Handle validation errors
          const errors = err.response.data.errors;
          if (typeof errors === "object") {
            const errorList = Object.entries(errors)
              .map(
                ([key, value]) =>
                  `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
              )
              .join("\n");
            errorMessage = `Lỗi validation:\n${errorList}`;
          }
        } else if (err.response?.status) {
          errorMessage = `Lỗi ${err.response.status}. Vui lòng thử lại.`;
        }

        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      product,
      productId,
      name,
      description,
      categoryId,
      subcategoryId,
      details,
      image,
      variantsWithStorage,
      navigate,
    ]
  );

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không tìm thấy sản phẩm</p>
          <button
            onClick={() => navigate("/seller/products")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate("/seller/products")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại danh sách sản phẩm
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 space-y-6"
      >
        {/* Product Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên sản phẩm *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            placeholder="Nhập tên sản phẩm (tối đa 100 ký tự)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">{name.length}/100 ký tự</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            maxLength={500}
            placeholder="Nhập mô tả sản phẩm (tối đa 500 ký tự)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/500 ký tự
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục *
            </label>
            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(Number(e.target.value) || null)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục con
            </label>
            <select
              value={subcategoryId || ""}
              onChange={(e) => setSubcategoryId(Number(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!categoryId}
            >
              <option value="">Chọn danh mục con</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chi tiết
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Nhập chi tiết sản phẩm (tùy chọn)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Thông tin chi tiết về sản phẩm (tùy chọn)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hình ảnh
          </label>
          {imagePreview && (
            <div className="mb-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md border border-gray-300"
              />
              {image && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Hình ảnh mới đã được chọn
                </p>
              )}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Để trống nếu không muốn thay đổi hình ảnh. Kích thước tối đa: 10MB
          </p>
        </div>

        {/* Product Variants */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Biến thể sản phẩm
            </h3>
            <button
              type="button"
              onClick={handleImportExcel}
              className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-1"
            >
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Import Excel
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcelFileChange}
            className="hidden"
          />
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs font-semibold text-yellow-800 mb-1">
              📋 Hướng dẫn Import Excel:
            </p>
            <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
              <li>
                File Excel phải có header ở dòng đầu tiên với các cột:{" "}
                <strong>Tên</strong>, <strong>Giá</strong>,{" "}
                <strong>Số lượng</strong>, <strong>Storage JSON</strong> (tùy
                chọn)
              </li>
              <li>
                Dòng 2 trở đi chứa dữ liệu variants (mỗi dòng = 1 variant)
              </li>
              <li>
                Storage JSON (nếu có) phải là một mảng JSON hợp lệ, ví dụ:{" "}
                <code className="bg-yellow-100 px-1 rounded">
                  {`[{"username": "user1", "password": "pass1", "status": false}]`}
                </code>
              </li>
            </ul>
          </div>
          {loadingVariants ? (
            <p className="text-sm text-gray-500">Đang tải biến thể...</p>
          ) : variantsWithStorage.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Sản phẩm này chưa có biến thể nào.
            </p>
          ) : (
            <div className="space-y-4">
              {variantsWithStorage.map((item, variantIndex) => (
                <div
                  key={item.variant.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Biến thể #{variantIndex + 1}: {item.variant.name}
                  </h4>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tên biến thể
                      </label>
                      <input
                        type="text"
                        value={item.variant.name}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "name",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giá (VNĐ)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.variant.price}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số lượng (Stock)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.variant.stock || 0}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "stock",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Storage for this variant */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Product Storage (JSON) - Mảng tài khoản
                      {item.variant.stock !== undefined &&
                        item.variant.stock !== null &&
                        item.variant.stock > 0 && (
                          <span className="ml-2 text-red-600 font-semibold">
                            (Cần đúng {item.variant.stock} tài khoản)
                          </span>
                        )}
                    </label>
                    <textarea
                      value={item.storageJson}
                      onChange={(e) =>
                        handleStorageChange(variantIndex, e.target.value)
                      }
                      placeholder={`[{"username": "user1", "password": "pass1", "status": false}, {"username": "user2", "password": "pass2", "status": false}]`}
                      rows={6}
                      className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Nhập mảng JSON chứa tài khoản. Số lượng tài khoản phải
                      khớp với Stock.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || loadingVariants}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
