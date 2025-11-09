import { useState, useEffect, useCallback, useRef } from "react";
import { productServices } from "@services/ProductServices";
import { categoryServices } from "@services/CategoryServices";
import { subcategoryServices } from "@services/SubcategoryServices";
import type { CategoriesResponse } from "@/models/modelResponse/CategoriesResponse";
import type { SubcategoryResponse } from "@/models/modelResponse/SubcategoryResponse";
import type { ProductVariantRequest } from "@/models/modelRequest/ProductRequest";
import * as XLSX from "xlsx";

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
        } catch (error) {
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
            alert("File Excel phải có ít nhất 1 dòng dữ liệu (không tính header)");
            return;
          }

          // Parse variants from Excel
          // Expected format:
          // Row 1 (Header): Tên | Giá | Số lượng | Storage JSON (optional)
          // Row 2+: Data rows
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
            (h) => h && (h.toString().toLowerCase().includes("số lượng") || h.toString().toLowerCase().includes("stock"))
          );
          const storageColIndex = headerRow.findIndex(
            (h) => h && (h.toString().toLowerCase().includes("storage") || h.toString().toLowerCase().includes("json"))
          );

          if (nameColIndex === -1 || priceColIndex === -1 || stockColIndex === -1) {
            alert(
              "File Excel phải có các cột: Tên, Giá, Số lượng. Vui lòng kiểm tra lại header."
            );
            return;
          }

          const parsedVariants: ProductVariantRequest[] = [];
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

            const variant: ProductVariantRequest = {
              name,
              price,
              stock,
              storages: [],
            };

            // If storage JSON is provided, validate and add it
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
                      `Dòng ${i + 2}: Variant "${name}" có tài khoản trùng lặp trong Storage JSON. Import đã bị hủy. Vui lòng kiểm tra lại file Excel.`
                    );
                    hasDuplicateUsername = true;
                    break; // Break out of loop to cancel import
                  }
                  
                  variant.storageJson = storageJson;
                } else {
                  alert(
                    `Dòng ${i + 2}: Storage JSON phải là một mảng. Bỏ qua storage cho variant này.`
                  );
                }
              } catch (parseError) {
                alert(
                  `Dòng ${i + 2}: Storage JSON không hợp lệ. Bỏ qua storage cho variant này.`
                );
              }
            }

            parsedVariants.push(variant);
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
          setVariants([...variants, ...parsedVariants]);

          alert(`Đã import thành công ${parsedVariants.length} variant từ file Excel`);
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
    [variants]
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
                <div className="flex gap-2">
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
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    + Thêm biến thể
                  </button>
                </div>
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
                    <strong>Số lượng</strong>, <strong>Storage JSON</strong>{" "}
                    (tùy chọn)
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
