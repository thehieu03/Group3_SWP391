import { useState, useCallback, useMemo } from "react";
import Button from "@components/Button/Button";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag, faWallet } from "@fortawesome/free-solid-svg-icons";
import routesConfig from "@config/routesConfig.ts";
import type { ProductResponse } from "@models/modelResponse/ProductResponse";
import type { ProductVariantResponse } from "@models/modelResponse/ProductVariantResponse";
import PurchaseModal from "./PurchaseModal";

interface ProductActionButtonsProps {
  product: ProductResponse;
  variants: ProductVariantResponse[];
  selectedVariant: ProductVariantResponse | null;
  isLoggedIn: boolean;
  authLoading?: boolean;
  onPurchase?: (quantity: number, variantId?: number) => Promise<void>;
  accountBalance?: number | null;
  balanceLoading?: boolean;
}

const ProductActionButtons = ({
  product,
  variants,
  selectedVariant,
  isLoggedIn,
  authLoading = false,
  onPurchase,
  accountBalance,
  balanceLoading = false,
}: ProductActionButtonsProps) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Tính giá tối thiểu (giá của variant hoặc product)
  const minPrice = useMemo(() => {
    if (variants.length > 0 && selectedVariant) {
      return selectedVariant.price ?? 0;
    }
    return product.minPrice ?? 0;
  }, [variants.length, selectedVariant, product.minPrice]);

  // Kiểm tra số dư có đủ không (ít nhất cho 1 sản phẩm)
  const hasEnoughBalance = useMemo(() => {
    if (accountBalance === null || accountBalance === undefined) {
      return true; // Nếu chưa load được balance, cho phép hiển thị nút mua hàng
    }
    return accountBalance >= minPrice;
  }, [accountBalance, minPrice]);

  const isDisabled =
    variants.length > 0
      ? !selectedVariant ||
        !selectedVariant.stock ||
        selectedVariant.stock === 0
      : product.totalStock === 0 || !product.isActive;

  const buttonText =
    variants.length > 0
      ? selectedVariant &&
        (!selectedVariant.stock || selectedVariant.stock === 0)
        ? "Không thể mua"
        : "Mua hàng"
      : product.totalStock === 0 || !product.isActive
      ? "Không thể mua"
      : "Mua hàng";

  const handleOpenModal = useCallback(() => {
    if (!isDisabled) {
      setIsModalOpen(true);
    }
  }, [isDisabled]);

  const handleCloseModal = useCallback(() => {
    if (!isProcessing) {
      setIsModalOpen(false);
    }
  }, [isProcessing]);

  const handleConfirmPurchase = useCallback(
    async (quantity: number) => {
      if (!onPurchase) {
        return;
      }

      try {
        setIsProcessing(true);
        const variantId = variants.length > 0 ? selectedVariant?.id : undefined;
        await onPurchase(quantity, variantId);
        setIsModalOpen(false);
      } catch {
        // Error handling is done in parent component
      } finally {
        setIsProcessing(false);
      }
    },
    [onPurchase, variants.length, selectedVariant?.id]
  );

  // Hiển thị loading nếu auth đang load
  if (authLoading || balanceLoading) {
    return (
      <div className="flex gap-3 pt-4">
        <div className="w-full p-3 bg-gray-100 rounded-lg text-center text-gray-600 text-sm">
          Đang kiểm tra đăng nhập...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 pt-4">
        {isLoggedIn ? (
          <>
            {variants.length > 0 && !selectedVariant && (
              <div className="w-full p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
                Vui lòng chọn một biến thể sản phẩm để tiếp tục.
              </div>
            )}
            {!hasEnoughBalance && !isDisabled ? (
              <Button
                onClick={() => navigate(routesConfig.deposit)}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faWallet} />
                Nạp tiền
              </Button>
            ) : (
              <Button
                onClick={handleOpenModal}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isDisabled}
              >
                <FontAwesomeIcon icon={faShoppingBag} />
                {buttonText}
              </Button>
            )}
          </>
        ) : (
          <div className="w-full">
            <button
              onClick={() => navigate(routesConfig.loginValidator)}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center justify-center"
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {isLoggedIn && (
        <PurchaseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmPurchase}
          product={product}
          selectedVariant={selectedVariant}
          variants={variants}
          loading={isProcessing}
        />
      )}
    </>
  );
};

export default ProductActionButtons;
