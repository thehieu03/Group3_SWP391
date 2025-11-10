/**
 * Utility functions for parsing Excel files and extracting variant data
 */

import * as XLSX from "xlsx";
import type { ProductVariantRequest } from "@/models/modelRequest/ProductRequest";
import { validateStorageJson, checkDuplicateUsernamesInVariant } from "./variantValidation";

export interface ExcelParseResult {
  success: boolean;
  variants?: ProductVariantRequest[];
  errors?: string[];
}

export interface ExcelColumnIndices {
  name: number;
  price: number;
  stock: number;
  storage?: number;
}

/**
 * Find column indices in Excel header row
 */
const findColumnIndices = (headerRow: string[]): ExcelColumnIndices | null => {
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

  if (nameColIndex === -1 || priceColIndex === -1 || stockColIndex === -1) {
    return null;
  }

  return {
    name: nameColIndex,
    price: priceColIndex,
    stock: stockColIndex,
    storage: storageColIndex !== -1 ? storageColIndex : undefined,
  };
};

/**
 * Validate Excel file type
 */
export const validateExcelFile = (file: File): boolean => {
  const validTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ];
  return (
    validTypes.includes(file.type) ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls") ||
    file.name.endsWith(".csv")
  );
};

/**
 * Parse Excel file and extract variants
 */
export const parseExcelFile = async (file: File): Promise<ExcelParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) {
          resolve({
            success: false,
            errors: ["Không thể đọc file"],
          });
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
          resolve({
            success: false,
            errors: ["File Excel phải có ít nhất 1 dòng dữ liệu (không tính header)"],
          });
          return;
        }

        // Parse variants from Excel
        const headerRow = jsonData[0] as string[];
        const dataRows = jsonData.slice(1);

        const columnIndices = findColumnIndices(headerRow);
        if (!columnIndices) {
          resolve({
            success: false,
            errors: [
              "File Excel phải có các cột: Tên, Giá, Số lượng. Vui lòng kiểm tra lại header.",
            ],
          });
          return;
        }

        const parsedVariants: ProductVariantRequest[] = [];
        const validationErrors: string[] = [];

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const name = String(row[columnIndices.name] || "").trim();
          const price = parseFloat(String(row[columnIndices.price] || "0"));
          const stock = parseInt(String(row[columnIndices.stock] || "0"), 10);
          const storageJson =
            columnIndices.storage !== undefined
              ? String(row[columnIndices.storage] || "").trim()
              : "";

          // Skip empty rows
          if (!name && price === 0 && stock === 0) continue;

          // Validate required fields
          if (!name) {
            validationErrors.push(`Dòng ${i + 2}: Thiếu tên variant`);
            continue;
          }
          if (isNaN(price) || price <= 0) {
            validationErrors.push(`Dòng ${i + 2}: Giá không hợp lệ`);
            continue;
          }
          if (isNaN(stock) || stock < 0) {
            validationErrors.push(`Dòng ${i + 2}: Số lượng không hợp lệ`);
            continue;
          }

          const variant: ProductVariantRequest = {
            name,
            price,
            stock,
            storages: [],
          };

          // Validate storage JSON if provided
          if (storageJson) {
            const validation = validateStorageJson(storageJson);
            if (!validation.isValid) {
              validationErrors.push(`Dòng ${i + 2} - Variant "${name}": ${validation.error}`);
              continue;
            }
            
            // Check for duplicate usernames within this variant
            const duplicateCheck = checkDuplicateUsernamesInVariant(name, storageJson);
            if (duplicateCheck.hasDuplicate) {
              validationErrors.push(`Dòng ${i + 2}: ${duplicateCheck.errorMessage}`);
              continue;
            }
            
            variant.storageJson = storageJson;
          }

          parsedVariants.push(variant);
        }

        if (validationErrors.length > 0) {
          resolve({
            success: false,
            errors: validationErrors,
          });
          return;
        }

        if (parsedVariants.length === 0) {
          resolve({
            success: false,
            errors: ["Không tìm thấy variant hợp lệ trong file Excel"],
          });
          return;
        }

        resolve({
          success: true,
          variants: parsedVariants,
        });
      } catch (err) {
        resolve({
          success: false,
          errors: [
            `Lỗi khi đọc file Excel: ${err instanceof Error ? err.message : "Lỗi không xác định"}`,
          ],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        errors: ["Lỗi khi đọc file"],
      });
    };

    reader.readAsBinaryString(file);
  });
};

