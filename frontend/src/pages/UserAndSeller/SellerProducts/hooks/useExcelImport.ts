/**
 * Custom hook for handling Excel file import for product variants
 */

import { useCallback, useRef } from "react";
import type { ProductVariantRequest } from "@/models/modelRequest/ProductRequest";
import { validateExcelFile, parseExcelFile } from "../utils/excelParser";

interface UseExcelImportProps {
  onImportSuccess: (variants: ProductVariantRequest[]) => void;
  onImportError: (errors: string[]) => void;
}

export const useExcelImport = ({ onImportSuccess, onImportError }: UseExcelImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!validateExcelFile(file)) {
        onImportError(["Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV"]);
        return;
      }

      // Parse Excel file
      const result = await parseExcelFile(file);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (result.success && result.variants) {
        onImportSuccess(result.variants);
      } else {
        onImportError(result.errors || ["Lỗi không xác định khi import file Excel"]);
      }
    },
    [onImportSuccess, onImportError]
  );

  return {
    fileInputRef,
    handleImportClick,
    handleFileChange,
  };
};

