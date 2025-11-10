import { useEffect, useCallback } from "react";
import { productServices } from "@services/ProductServices";
import type { ProductVariantRequest } from "@/models/modelRequest/ProductRequest";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductVariantsSection from "./ProductVariantsSection";
import { useProductForm } from "../../hooks/useProductForm";
import { useExcelImport } from "../../hooks/useExcelImport";
import { useVariantProcessing } from "../../hooks/useVariantProcessing";
import { useVariants } from "../../hooks/useVariants";

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
  // Form state management
  const {
    name,
    description,
    categoryId,
    subcategoryId,
    details,
    image,
    imagePreview,
    loading,
    categories,
    subcategories,
    setName,
    setDescription,
    setCategoryId,
    setSubcategoryId,
    setDetails,
    setLoading,
    handleImageChange,
  } = useProductForm({ isOpen, shopId });

  // Variants management
  const {
    variants,
    addVariant,
    removeVariant,
    updateVariant,
    updateStorage,
    addVariants,
    resetVariants,
  } = useVariants();

  // Reset variants when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetVariants();
    }
  }, [isOpen, resetVariants]);

  // Excel import
  const { fileInputRef, handleImportClick, handleFileChange } = useExcelImport({
    onImportSuccess: (importedVariants: ProductVariantRequest[]) => {
      addVariants(importedVariants);
      alert(
        `Đã import thành công ${importedVariants.length} variant từ file Excel`
      );
    },
    onImportError: (errors: string[]) => {
      alert(
        `Có lỗi validation:\n${errors.join("\n")}\n\nImport đã bị hủy. Vui lòng kiểm tra lại file Excel.`
      );
    },
  });

  // Variant processing
  const { processedVariants } = useVariantProcessing({ variants });

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
            isActive: false, // Mặc định sản phẩm mới tạo sẽ chưa hoạt động
          },
          image || undefined
        );
        onSuccess();
        onClose();
      } catch (error: unknown) {
        const err = error as {
          response?: { 
            data?: { 
              message?: string;
              errors?: string[] | Record<string, string[]>;
            }; 
            status?: number;
          };
          message?: string;
        };
        
        let errorMessage = "Không thể tạo sản phẩm. Vui lòng thử lại.";
        
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
          
          // Append detailed errors if available
          if (err.response.data.errors) {
            if (Array.isArray(err.response.data.errors)) {
              errorMessage += "\n\nChi tiết lỗi:\n" + err.response.data.errors.join("\n");
            } else if (typeof err.response.data.errors === "object") {
              const errorList = Object.entries(err.response.data.errors)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
                .join("\n");
              errorMessage += `\n\nChi tiết lỗi:\n${errorList}`;
            }
          }
        } else if (err.response?.status) {
          errorMessage = `Lỗi ${err.response.status}. Vui lòng thử lại.`;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        alert(errorMessage);
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
              onAddVariant={addVariant}
              onRemoveVariant={removeVariant}
              onVariantChange={updateVariant}
              onStorageChange={updateStorage}
              fileInputRef={fileInputRef}
              onImportClick={handleImportClick}
              onExcelFileChange={handleFileChange}
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
