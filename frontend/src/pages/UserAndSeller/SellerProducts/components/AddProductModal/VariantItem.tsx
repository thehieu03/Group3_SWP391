import { memo } from "react";
import type { ProductVariantRequest } from "@/models/modelRequest/ProductRequest";

interface VariantItemProps {
  variant: ProductVariantRequest;
  variantIndex: number;
  onVariantChange: (
    index: number,
    field: keyof ProductVariantRequest,
    value: string | number
  ) => void;
  onStorageChange: (variantIndex: number, value: string) => void;
  onRemove: (index: number) => void;
}

const VariantItem = memo(
  ({
    variant,
    variantIndex,
    onVariantChange,
    onStorageChange,
    onRemove,
  }: VariantItemProps) => {
    return (
      <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-700">
            Biến thể #{variantIndex + 1}
          </h4>
          <button
            type="button"
            onClick={() => onRemove(variantIndex)}
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
                onVariantChange(variantIndex, "name", e.target.value)
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
              Số lượng
            </label>
            <input
              type="number"
              min="0"
              value={variant.stock || 0}
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

        {/* Product Storages for this variant */}
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
              📋 Format JSON mẫu - Mảng tài khoản (Copy và dán vào ô bên dưới):
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
              <strong className="text-red-600">PHẢI KHỚP</strong> với số lượng{" "}
              <strong>Stock</strong> của variant ({variant.stock || 0})
              <br />
              • Mỗi phần tử trong mảng là 1 tài khoản
              <br />•{" "}
              <code className="bg-blue-100 px-1 rounded">status: false</code> =
              chưa bán,{" "}
              <code className="bg-blue-100 px-1 rounded">status: true</code> =
              đã bán
            </p>
          </div>

          {/* Textarea duy nhất cho mảng JSON */}
          <textarea
            value={variant.storageJson || ""}
            onChange={(e) => onStorageChange(variantIndex, e.target.value)}
            placeholder={`[{"username": "user1", "password": "pass1", "status": false}, {"username": "user2", "password": "pass2", "status": false}]`}
            rows={8}
            className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 <strong>Ví dụ:</strong> Nếu Stock = 2, bạn cần nhập mảng có đúng
            2 tài khoản:
            <br />
            <code className="bg-gray-100 px-1 rounded block mt-1">
              {`[{"username": "user1", "password": "pass1", "status": false}, {"username": "user2", "password": "pass2", "status": false}]`}
            </code>
          </p>
        </div>
      </div>
    );
  }
);

VariantItem.displayName = "VariantItem";

export default VariantItem;
