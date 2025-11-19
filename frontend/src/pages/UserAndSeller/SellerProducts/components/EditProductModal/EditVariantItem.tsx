import { memo } from "react";
import type { ProductVariantResponse } from "@/models/modelResponse/ProductVariantResponse";

interface VariantWithStorage {
  variant: ProductVariantResponse;
  storageJson: string;
}

interface EditVariantItemProps {
  item: VariantWithStorage;
  variantIndex: number;
  onVariantChange: (
    variantIndex: number,
    field: "name" | "price" | "stock",
    value: string | number
  ) => void;
  onStorageChange: (variantIndex: number, value: string) => void;
}

const EditVariantItem = memo(
  ({
    item,
    variantIndex,
    onVariantChange,
    onStorageChange,
  }: EditVariantItemProps) => {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">
          Biến thể #{variantIndex + 1}: {item.variant.name}
        </h4>

        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tên biến thể
            </label>
            <input
              type="text"
              value={item.variant.name}
              onChange={(e) =>
                onVariantChange(variantIndex, "name", e.target.value)
              }
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Giá (VNĐ)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.variant.price}
              onChange={(e) =>
                onVariantChange(
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
              Số lượng (Stock)
            </label>
            <input
              type="number"
              min="0"
              value={item.variant.stock || 0}
              onChange={(e) =>
                onVariantChange(
                  variantIndex,
                  "stock",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Storage for this variant */}
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Product Storage (JSON) - Mảng tài khoản
            {item.variant.stock !== undefined &&
              item.variant.stock !== null &&
              item.variant.stock > 0 && (
                <span className="ml-2 text-red-600 font-semibold">
                  (Cần đúng {item.variant.stock} tài khoản)
                </span>
              )}
          </label>
          <textarea
            value={item.storageJson}
            onChange={(e) => onStorageChange(variantIndex, e.target.value)}
            placeholder={`[{"username": "user1", "password": "pass1", "status": false}, {"username": "user2", "password": "pass2", "status": false}]`}
            rows={6}
            className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Nhập mảng JSON chứa tài khoản. Số lượng tài khoản phải khớp với
            Stock.
          </p>
        </div>
      </div>
    );
  }
);

EditVariantItem.displayName = "EditVariantItem";

export default EditVariantItem;
