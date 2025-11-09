import { useState, useEffect, useCallback, useMemo } from "react";
import type { AdminProductResponse } from "@/models/modelResponse/AdminProductResponse";
import type { ProductVariantResponse } from "@/models/modelResponse/ProductVariantResponse";
import { productServices } from "@services/ProductServices";
import { productVariantServices } from "@services/ProductVariantServices";
import { productStorageServices } from "@services/ProductStorageServices";
import { categoryServices } from "@services/CategoryServices";
import { subcategoryServices } from "@services/SubcategoryServices";
import type { CategoriesResponse } from "@/models/modelResponse/CategoriesResponse";
import type { SubcategoryResponse } from "@/models/modelResponse/SubcategoryResponse";
import EditProductBasicInfo from "./EditProductBasicInfo";
import EditVariantsSection from "./EditVariantsSection";

interface EditProductModalProps {
  product: AdminProductResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface VariantWithStorage {
  variant: ProductVariantResponse;
  storageJson: string;
}

const EditProductModal = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}: EditProductModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [details, setDetails] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  // Load product data, variants and storages when modal opens
  useEffect(() => {
    const loadProductData = async () => {
      if (isOpen && product) {
        setName(product.name);
        setDescription(product.description);
        setCategoryId(product.categoryId);
        setSubcategoryId(product.subcategoryId || null);
        setDetails(product.details || "");
        setImage(null);
        setImagePreview(product.primaryImageUrl || null);

        // Load variants and storages
        setLoadingVariants(true);
        try {
          const variants = await productVariantServices.getProductVariantsAsync(
            product.id
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
      }
    };
    void loadProductData();
  }, [isOpen, product]);

  // Memoized handlers
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

  // Memoized processed variants
  const processedVariants = useMemo(() => {
    try {
      return variantsWithStorage.map((item) => {
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
          id: item.variant.id,
          name: item.variant.name,
          price: item.variant.price,
          stock: item.variant.stock || undefined,
          storageJson: item.storageJson || undefined,
        };
      });
    } catch {
      return null;
    }
  }, [variantsWithStorage]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!product) return;

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

      if (!processedVariants) {
        alert("Có lỗi trong validation storage. Vui lòng kiểm tra lại.");
        return;
      }

      setLoading(true);
      try {
        // Update product
        await productServices.updateProductAsync(
          product.id,
          {
            name: name.trim(),
            description: description.trim(),
            categoryId: categoryId || undefined,
            subcategoryId: subcategoryId || undefined,
            shopId: product.shopId,
            details: details?.trim() || undefined,
            variants:
              processedVariants.length > 0 ? processedVariants : undefined,
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

        onSuccess();
        onClose();
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
      name,
      description,
      categoryId,
      subcategoryId,
      details,
      image,
      processedVariants,
      variantsWithStorage,
      onSuccess,
      onClose,
    ]
  );

  // Memoized hasNewImage
  const hasNewImage = useMemo(() => image !== null, [image]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa sản phẩm
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <EditProductBasicInfo
              name={name}
              description={description}
              categoryId={categoryId}
              subcategoryId={subcategoryId}
              details={details}
              imagePreview={imagePreview}
              hasNewImage={hasNewImage}
              categories={categories}
              subcategories={subcategories}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onCategoryChange={setCategoryId}
              onSubcategoryChange={setSubcategoryId}
              onDetailsChange={setDetails}
              onImageChange={handleImageChange}
            />

            {/* Product Variants */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Biến thể sản phẩm
              </h3>
              <EditVariantsSection
                variantsWithStorage={variantsWithStorage}
                loadingVariants={loadingVariants}
                onVariantChange={handleVariantChange}
                onStorageChange={handleStorageChange}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
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
      </div>
    </div>
  );
};

export default EditProductModal;
