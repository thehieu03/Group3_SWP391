import Button from "@components/Button/Button";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import routesConfig from "@config/routesConfig.ts";
import type { ProductResponse } from "@models/modelResponse/ProductResponse";
import type { ProductVariantResponse } from "@models/modelResponse/ProductVariantResponse";

interface ProductActionButtonsProps {
  product: ProductResponse;
  variants: ProductVariantResponse[];
  selectedVariant: ProductVariantResponse | null;
  isLoggedIn: boolean;
  authLoading?: boolean;
}

const ProductActionButtons = ({
  product,
  variants,
  selectedVariant,
  isLoggedIn,
  authLoading = false,
}: ProductActionButtonsProps) => {
  const navigate = useNavigate();

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
        : "Thêm vào giỏ hàng"
      : product.totalStock === 0 || !product.isActive
      ? "Không thể mua"
      : "Thêm vào giỏ hàng";

  // Hiển thị loading nếu auth đang load
  if (authLoading) {
    return (
      <div className="flex gap-3 pt-4">
        <div className="w-full p-3 bg-gray-100 rounded-lg text-center text-gray-600 text-sm">
          Đang kiểm tra đăng nhập...
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 pt-4">
      {isLoggedIn ? (
        <>
          {variants.length > 0 && !selectedVariant && (
            <div className="w-full p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
              Vui lòng chọn một biến thể sản phẩm để tiếp tục.
            </div>
          )}
          <Button
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isDisabled}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            {buttonText}
          </Button>
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
  );
};

export default ProductActionButtons;
