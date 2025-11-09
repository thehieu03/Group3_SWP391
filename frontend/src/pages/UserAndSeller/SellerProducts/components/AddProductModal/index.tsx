import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { productServices } from "@services/ProductServices";
import { categoryServices } from "@services/CategoryServices";
import { subcategoryServices } from "@services/SubcategoryServices";
import type { CategoriesResponse } from "@/models/modelResponse/CategoriesResponse";
import type { SubcategoryResponse } from "@/models/modelResponse/SubcategoryResponse";
import type { ProductVariantRequest } from "@/models/modelRequest/ProductRequest";
import * as XLSX from "xlsx";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductVariantsSection from "./ProductVariantsSection";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Memoized handlers
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

  const handleAddVariant = useCallback(() => {
    setVariants((prev) => [
      ...prev,
      {
        name: "",
        price: 0,
        stock: 0,
        storages: [],
      },
    ]);
  }, []);

  const handleRemoveVariant = useCallback((index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleVariantChange = useCallback(
    (
      index: number,
      field: keyof ProductVariantRequest,
      value: string | number
    ) => {
      setVariants((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
        return updated;
      });
    },
    []
  );

  const handleStorageChange = useCallback(
    (variantIndex: number, value: string) => {
      setVariants((prev) => {
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

  const handleExcelFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
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

          // Find column indices
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
                  // Check for duplicate usernames
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
                    break;
                  }

                  variant.storageJson = storageJson;
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

          // Add imported variants
          setVariants((prev) => [...prev, ...parsedVariants]);

          alert(
            `Đã import thành công ${parsedVariants.length} variant từ file Excel`
          );
        } catch (err) {
          alert(
            `Lỗi khi đọc file Excel: ${
              err instanceof Error ? err.message : "Lỗi không xác định"
            }`
          );
        } finally {
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
    []
  );

  // Memoized valid variants
  const validVariants = useMemo(
    () => variants.filter((v) => v.name.trim() !== "" && v.price > 0),
    [variants]
  );

  // Memoized processed variants
  const processedVariants = useMemo(() => {
    try {
      return validVariants.map((variant) => {
        const processedVariant = { ...variant };

        if (variant.storageJson && variant.storageJson.trim() !== "") {
          const accountsArray = JSON.parse(variant.storageJson);

          if (!Array.isArray(accountsArray)) {
            throw new Error("JSON phải là một mảng");
          }

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

          // Validate each account
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

          // Convert to backend format
          processedVariant.storages = accountsArray.map((account) => ({
            result: JSON.stringify({
              username: account.username,
              password: account.password,
              status: account.status !== undefined ? account.status : false,
            }),
          }));

          delete processedVariant.storageJson;
        }

        return processedVariant;
      });
    } catch {
      return null;
    }
  }, [validVariants]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name || !description || !categoryId || !shopId) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Mô tả, Danh mục)");
        return;
      }

      if (!processedVariants) {
        alert("Có lỗi trong validation storage. Vui lòng kiểm tra lại.");
        return;
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
      processedVariants,
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
            <ProductBasicInfo
              name={name}
              description={description}
              categoryId={categoryId}
              subcategoryId={subcategoryId}
              details={details}
              imagePreview={imagePreview}
              categories={categories}
              subcategories={subcategories}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onCategoryChange={setCategoryId}
              onSubcategoryChange={setSubcategoryId}
              onDetailsChange={setDetails}
              onImageChange={handleImageChange}
            />

            <ProductVariantsSection
              variants={variants}
              onAddVariant={handleAddVariant}
              onRemoveVariant={handleRemoveVariant}
              onVariantChange={handleVariantChange}
              onStorageChange={handleStorageChange}
              onExcelFileChange={handleExcelFileChange}
            />

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
