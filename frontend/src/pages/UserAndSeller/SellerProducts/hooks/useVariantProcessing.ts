/**
 * Custom hook for processing and validating product variants
 */

import { useMemo } from "react";
import type { ProductVariantRequest } from "@/models/modelRequest/ProductRequest";
import {
  validateStorageJson,
  checkDuplicateUsernamesInVariant,
  validateVariantStock,
} from "../utils/variantValidation";

interface UseVariantProcessingProps {
  variants: ProductVariantRequest[];
}

export const useVariantProcessing = ({ variants }: UseVariantProcessingProps) => {
  // Filter valid variants (have name and price > 0)
  const validVariants = useMemo(
    () => variants.filter((v) => v.name.trim() !== "" && v.price > 0),
    [variants]
  );

  // Process variants: validate storage JSON and convert to backend format
  const processedVariants = useMemo(() => {
    try {
      return validVariants.map((variant) => {
        const processedVariant = { ...variant };

        if (variant.storageJson && variant.storageJson.trim() !== "") {
          const validation = validateStorageJson(variant.storageJson);
          
          if (!validation.isValid) {
            throw new Error(`Variant "${variant.name}": ${validation.error}`);
          }

          if (!validation.accounts) {
            throw new Error(`Variant "${variant.name}": Không thể parse accounts`);
          }

          // Check for duplicate usernames within this variant
          const duplicateCheck = checkDuplicateUsernamesInVariant(
            variant.name,
            variant.storageJson
          );
          if (duplicateCheck.hasDuplicate) {
            throw new Error(
              duplicateCheck.errorMessage ||
                `Variant "${variant.name}" có username trùng lặp. Vui lòng kiểm tra lại.`
            );
          }

          // Validate stock matches accounts count
          const stockValidation = validateVariantStock(
            variant.name,
            variant.stock,
            validation.accounts.length
          );
          if (!stockValidation.isValid) {
            throw new Error(stockValidation.error);
          }

          // Convert to backend format
          processedVariant.storages = validation.accounts.map((account) => ({
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
    } catch (error) {
      return null;
    }
  }, [validVariants]);

  return {
    validVariants,
    processedVariants,
  };
};

