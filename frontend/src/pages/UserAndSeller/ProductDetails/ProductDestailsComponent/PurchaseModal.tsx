import { useState, useEffect, useCallback } from "react";
import Button from "@components/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import type { ProductResponse } from "@models/modelResponse/ProductResponse";
import type { ProductVariantResponse } from "@models/modelResponse/ProductVariantResponse";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  product: ProductResponse;
  selectedVariant: ProductVariantResponse | null;
  variants: ProductVariantResponse[];
  loading?: boolean;
}

const PurchaseModal = ({
  isOpen,
  onClose,
  onConfirm,
  product,
  selectedVariant,
  variants,
  loading = false,
}: PurchaseModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Tính toán stock hiện tại
  const currentStock = variants.length > 0
    ? selectedVariant?.stock ?? 0
    : product.totalStock ?? 0;

  // Reset quantity khi modal mở/đóng hoặc variant thay đổi
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError(null);
    }
  }, [isOpen, selectedVariant]);

  const handleQuantityChange = useCallback((value: number) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 1) {
      setQuantity(1);
      setError(null);
      return;
    }

    if (numValue > currentStock) {
      setError(`Số lượng không được vượt quá ${currentStock} sản phẩm có sẵn`);
      setQuantity(numValue);
    } else {
      setError(null);
      setQuantity(numValue);
    }
  }, [currentStock]);

  const handleIncrement = useCallback(() => {
    if (quantity < currentStock) {
      handleQuantityChange(quantity + 1);
    }
  }, [quantity, currentStock, handleQuantityChange]);

  const handleDecrement = useCallback(() => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  }, [quantity, handleQuantityChange]);

  const handleConfirm = useCallback(() => {
    if (quantity < 1) {
      setError("Số lượng phải lớn hơn 0");
      return;
    }

    if (quantity > currentStock) {
      setError(`Số lượng không được vượt quá ${currentStock} sản phẩm có sẵn`);
      return;
    }

    onConfirm(quantity);
  }, [quantity, currentStock, onConfirm]);

  if (!isOpen) return null;

  const productName = variants.length > 0
    ? `${product.name} - ${selectedVariant?.name ?? ""}`
    : product.name;

  const unitPrice = variants.length > 0
    ? selectedVariant?.price ?? 0
    : product.minPrice ?? 0;

  const totalPrice = quantity * unitPrice;
  const isQuantityExceeded = quantity > currentStock;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Mua hàng</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Product Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {productName}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Giá:</span>{" "}
              {unitPrice.toLocaleString("vi-VN")} VNĐ
            </p>
            <p>
              <span className="font-medium">Tồn kho:</span> {currentStock} sản phẩm
            </p>
          </div>
        </div>

        {/* Quantity Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lượng
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1 || loading}
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={currentStock}
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= currentStock || loading}
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Total Price */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">
              Tổng tiền:
            </span>
            <span className="text-xl font-bold text-green-600">
              {totalPrice.toLocaleString("vi-VN")} VNĐ
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isQuantityExceeded || quantity < 1 || loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Xác nhận mua"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;

