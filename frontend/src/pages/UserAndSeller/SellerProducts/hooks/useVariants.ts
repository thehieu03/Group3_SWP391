/**
 * Custom hook for managing product variants state
 */

import { useState, useCallback } from "react";
import type { ProductVariantRequest } from "@/models/modelRequest/ProductRequest";

export const useVariants = () => {
  const [variants, setVariants] = useState<ProductVariantRequest[]>([]);

  const addVariant = useCallback(() => {
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

  const removeVariant = useCallback((index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateVariant = useCallback(
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

  const updateStorage = useCallback((variantIndex: number, value: string) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex] = {
        ...updated[variantIndex],
        storageJson: value,
      };
      return updated;
    });
  }, []);

  const addVariants = useCallback((newVariants: ProductVariantRequest[]) => {
    setVariants((prev) => [...prev, ...newVariants]);
  }, []);

  const resetVariants = useCallback(() => {
    setVariants([]);
  }, []);

  return {
    variants,
    setVariants,
    addVariant,
    removeVariant,
    updateVariant,
    updateStorage,
    addVariants,
    resetVariants,
  };
};

