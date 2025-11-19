import { memo } from "react";
import type { RefObject } from "react";
import type { ProductVariantRequest } from "@/models/modelRequest/ProductRequest";
import VariantItem from "./VariantItem";
import ExcelImportGuide from "./ExcelImportGuide";

interface ProductVariantsSectionProps {
  variants: ProductVariantRequest[];
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onVariantChange: (
    index: number,
    field: keyof ProductVariantRequest,
    value: string | number
  ) => void;
  onStorageChange: (variantIndex: number, value: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImportClick: () => void;
  onExcelFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductVariantsSection = memo(
  ({
    variants,
    onAddVariant,
    onRemoveVariant,
    onVariantChange,
    onStorageChange,
    fileInputRef,
    onImportClick,
    onExcelFileChange,
  }: ProductVariantsSectionProps) => {

    return (
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Biến thể sản phẩm (Product Variants)
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onImportClick}
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
              onClick={onAddVariant}
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
          onChange={onExcelFileChange}
          className="hidden"
        />
        <ExcelImportGuide />

        {variants.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            Chưa có biến thể nào. Nhấn "Thêm biến thể" để thêm.
          </p>
        )}

        {variants.map((variant, variantIndex) => (
          <VariantItem
            key={variantIndex}
            variant={variant}
            variantIndex={variantIndex}
            onVariantChange={onVariantChange}
            onStorageChange={onStorageChange}
            onRemove={onRemoveVariant}
          />
        ))}
      </div>
    );
  }
);

ProductVariantsSection.displayName = "ProductVariantsSection";

export default ProductVariantsSection;
