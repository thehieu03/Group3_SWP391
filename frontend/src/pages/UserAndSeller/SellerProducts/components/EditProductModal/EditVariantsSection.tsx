import { memo } from "react";
import type { ProductVariantResponse } from "@/models/modelResponse/ProductVariantResponse";
import EditVariantItem from "./EditVariantItem";

interface VariantWithStorage {
  variant: ProductVariantResponse;
  storageJson: string;
}

interface EditVariantsSectionProps {
  variantsWithStorage: VariantWithStorage[];
  loadingVariants: boolean;
  onVariantChange: (
    variantIndex: number,
    field: "name" | "price" | "stock",
    value: string | number
  ) => void;
  onStorageChange: (variantIndex: number, value: string) => void;
}

const EditVariantsSection = memo(
  ({
    variantsWithStorage,
    loadingVariants,
    onVariantChange,
    onStorageChange,
  }: EditVariantsSectionProps) => {
    if (loadingVariants) {
      return <p className="text-sm text-gray-500">Đang tải biến thể...</p>;
    }

    if (variantsWithStorage.length === 0) {
      return (
        <p className="text-sm text-gray-500 italic">
          Sản phẩm này chưa có biến thể nào.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {variantsWithStorage.map((item, variantIndex) => (
          <EditVariantItem
            key={item.variant.id}
            item={item}
            variantIndex={variantIndex}
            onVariantChange={onVariantChange}
            onStorageChange={onStorageChange}
          />
        ))}
      </div>
    );
  }
);

EditVariantsSection.displayName = "EditVariantsSection";

export default EditVariantsSection;
