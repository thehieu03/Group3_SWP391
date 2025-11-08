import { useState, useEffect, useCallback } from "react";
import { productServices } from "@services/ProductServices";
import { categoryServices } from "@services/CategoryServices";
import { subcategoryServices } from "@services/SubcategoryServices";
import type { CategoriesResponse } from "@/models/modelResponse/CategoriesResponse";
import type { SubcategoryResponse } from "@/models/modelResponse/SubcategoryResponse";
import type { ProductVariantRequest } from "@/models/modelRequest/ProductRequest";

interface AddProductModalProps {
  shopId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddProductModal = ({
  shopId,
  isOpen,
  onClose,
  onSuccess,
}: AddProductModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [details, setDetails] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoriesResponse[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryResponse[]>([]);
  const [variants, setVariants] = useState<ProductVariantRequest[]>([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryServices.getAllCategoryAsync();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
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
        } catch (error) {
          console.error("Failed to load subcategories:", error);
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
    };
    void loadSubcategories();
  }, [categoryId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setCategoryId(null);
      setSubcategoryId(null);
      setDetails("");
      setImage(null);
      setImagePreview(null);
      setVariants([]);
    }
  }, [isOpen]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
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

  // Variant management functions
  const handleAddVariant = useCallback(() => {
    setVariants([
      ...variants,
      {
        name: "",
        price: 0,
        stock: 0,
        storages: [],
      },
    ]);
  }, [variants]);

  const handleRemoveVariant = useCallback(
    (index: number) => {
      setVariants(variants.filter((_, i) => i !== index));
    },
    [variants]
  );

  const handleVariantChange = useCallback(
    (
      index: number,
      field: keyof ProductVariantRequest,
      value: string | number
    ) => {
      const updatedVariants = [...variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: value,
      };
      setVariants(updatedVariants);
    },
    [variants]
  );

  // Storage management functions - Chỉ 1 textarea cho mỗi variant, nhận mảng JSON
  const handleStorageChange = useCallback(
    (variantIndex: number, value: string) => {
      setVariants((prevVariants) => {
        const updatedVariants = [...prevVariants];
        // Lưu raw JSON string vào variant để hiển thị
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          storageJson: value, // Lưu raw JSON string
        };
        return updatedVariants;
      });
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name || !description || !categoryId || !shopId) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Mô tả, Danh mục)");
        return;
      }

      // Validate variants if any
      const validVariants = variants.filter(
        (v) => v.name.trim() !== "" && v.price > 0
      );

      // Validate và convert storages từ mảng JSON
      let processedVariants: typeof validVariants;
      try {
        processedVariants = validVariants.map((variant) => {
          const processedVariant = { ...variant };

          // Nếu có storageJson, parse và validate
          if (variant.storageJson && variant.storageJson.trim() !== "") {
            const accountsArray = JSON.parse(variant.storageJson);

            // Validate là mảng
            if (!Array.isArray(accountsArray)) {
              throw new Error("JSON phải là một mảng");
            }

            // Validate số lượng tài khoản phải khớp với stock
            const stock = variant.stock || 0;
            if (stock === 0) {
              throw new Error(
                `Variant "${variant.name}" có Stock = 0. Vui lòng nhập Stock > 0 trước khi thêm tài khoản.`
              );
            }
            if (accountsArray.length !== stock) {
              throw new Error(
                `Số lượng tài khoản (${accountsArray.length}) không khớp với số lượng Stock (${stock}) của variant "${variant.name}". Vui lòng kiểm tra lại.`
              );
            }

            // Validate mỗi phần tử trong mảng có đúng format
            for (let i = 0; i < accountsArray.length; i++) {
              const account = accountsArray[i];
              if (!account || typeof account !== "object") {
                throw new Error(`Tài khoản thứ ${i + 1} không hợp lệ`);
              }
              if (
                !account.username ||
                typeof account.username !== "string" ||
                account.username.trim() === ""
              ) {
                throw new Error(
                  `Tài khoản thứ ${
                    i + 1
                  } thiếu username hoặc username không hợp lệ`
                );
              }
              if (
                !account.password ||
                typeof account.password !== "string" ||
                account.password.trim() === ""
              ) {
                throw new Error(
                  `Tài khoản thứ ${
                    i + 1
                  } thiếu password hoặc password không hợp lệ`
                );
              }
              if (
                account.status !== undefined &&
                typeof account.status !== "boolean"
              ) {
                throw new Error(
                  `Tài khoản thứ ${
                    i + 1
                  } có status không hợp lệ (phải là boolean)`
                );
              }
            }

            // Convert mảng JSON thành format backend mong đợi
            processedVariant.storages = accountsArray.map((account) => ({
              result: JSON.stringify({
                username: account.username,
                password: account.password,
                status: account.status !== undefined ? account.status : false,
              }),
            }));

            // Xóa storageJson sau khi đã convert
            delete processedVariant.storageJson;
          }

          return processedVariant;
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Lỗi không xác định";
        alert(`Lỗi validation storage: ${errorMessage}`);
        setLoading(false);
        return; // Dừng submit
      }

      setLoading(true);
      try {
        await productServices.createProductAsync(
          {
            name,
            description,
            categoryId: categoryId || undefined,
            subcategoryId: subcategoryId || undefined,
            shopId,
            details,
            variants:
              processedVariants.length > 0 ? processedVariants : undefined,
            // Required fields for ProductRequest interface
            price:
              processedVariants.length > 0 ? processedVariants[0].price : 0,
            stock:
              processedVariants.length > 0
                ? processedVariants[0].stock || 0
                : 0,
            images: [],
            isActive: true,
          },
          image || undefined
        );
        onSuccess();
        onClose();
      } catch (error: unknown) {
        console.error("[AddProductModal] Failed to create product:", error);
        const err = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        const errorMessage =
          err.response?.data?.message ||
          `Lỗi ${err.response?.status || "không xác định"}. Vui lòng thử lại.`;
        alert(`Không thể tạo sản phẩm: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    },
    [
      name,
      description,
      categoryId,
      subcategoryId,
      shopId,
      details,
      image,
      variants,
      onSuccess,
      onClose,
    ]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Thêm sản phẩm mới
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục *
                </label>
                <select
                  value={categoryId || ""}
                  onChange={(e) =>
                    setCategoryId(Number(e.target.value) || null)
                  }
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
                  onChange={(e) =>
                    setSubcategoryId(Number(e.target.value) || null)
                  }
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình ảnh *
              </label>
              {imagePreview && (
                <div className="mb-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Kích thước tối đa 10MB
              </p>
            </div>

            {/* Product Variants Section */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Biến thể sản phẩm (Product Variants)
                </label>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  + Thêm biến thể
                </button>
              </div>

              {variants.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  Chưa có biến thể nào. Nhấn "Thêm biến thể" để thêm.
                </p>
              )}

              {variants.map((variant, variantIndex) => (
                <div
                  key={variantIndex}
                  className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">
                      Biến thể #{variantIndex + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(variantIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tên biến thể *
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="VD: Size M, Màu đỏ..."
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giá *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
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
                        Số lượng
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variant.stock || 0}
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

                  {/* Product Storages for this variant - Chỉ 1 textarea cho mảng JSON */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Product Storage (JSON) - Mảng tài khoản
                      {variant.stock !== undefined && variant.stock > 0 && (
                        <span className="ml-2 text-red-600 font-semibold">
                          (Cần đúng {variant.stock} tài khoản)
                        </span>
                      )}
                    </label>

                    {/* Format mẫu */}
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs font-semibold text-blue-800 mb-1">
                        📋 Format JSON mẫu - Mảng tài khoản (Copy và dán vào ô
                        bên dưới):
                      </p>
                      <pre className="text-xs font-mono text-blue-900 bg-white p-2 rounded border border-blue-300 overflow-x-auto">
                        {`[
  {
    "username": "tài_khoản_1",
    "password": "mật_khẩu_1",
    "status": false
  },
  {
    "username": "tài_khoản_2",
    "password": "mật_khẩu_2",
    "status": false
  }
]`}
                      </pre>
                      <p className="text-xs text-blue-700 mt-1">
                        <strong>Lưu ý quan trọng:</strong>
                        <br />• Số lượng tài khoản trong mảng{" "}
                        <strong className="text-red-600">PHẢI KHỚP</strong> với
                        số lượng <strong>Stock</strong> của variant (
                        {variant.stock || 0})
                        <br />
                        • Mỗi phần tử trong mảng là 1 tài khoản
                        <br />•{" "}
                        <code className="bg-blue-100 px-1 rounded">
                          status: false
                        </code>{" "}
                        = chưa bán,{" "}
                        <code className="bg-blue-100 px-1 rounded">
                          status: true
                        </code>{" "}
                        = đã bán
                      </p>
                    </div>

                    {/* Textarea duy nhất cho mảng JSON */}
                    <textarea
                      value={variant.storageJson || ""}
                      onChange={(e) =>
                        handleStorageChange(variantIndex, e.target.value)
                      }
                      placeholder={`[{"username": "user1", "password": "pass1", "status": false}, {"username": "user2", "password": "pass2", "status": false}]`}
                      rows={8}
                      className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 <strong>Ví dụ:</strong> Nếu Stock = 2, bạn cần nhập
                      mảng có đúng 2 tài khoản:
                      <br />
                      <code className="bg-gray-100 px-1 rounded block mt-1">
                        {`[{"username": "user1", "password": "pass1", "status": false}, {"username": "user2", "password": "pass2", "status": false}]`}
                      </code>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Đang tạo..." : "Tạo sản phẩm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
