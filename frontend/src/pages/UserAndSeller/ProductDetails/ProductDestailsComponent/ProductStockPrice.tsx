import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import type { ProductResponse } from "@models/modelResponse/ProductResponse";
import type { ProductVariantResponse } from "@models/modelResponse/ProductVariantResponse";

interface ProductStockPriceProps {
  product: ProductResponse;
  selectedVariant: ProductVariantResponse | null;
}

const ProductStockPrice = ({
  product,
  selectedVariant,
}: ProductStockPriceProps) => {
  const getStock = () => {
    return selectedVariant ? selectedVariant.stock ?? 0 : product.totalStock;
  };

  const getPriceDisplay = () => {
    if (selectedVariant) {
      return `${selectedVariant.price.toLocaleString()} đ`;
    }
    if (product.minPrice === product.maxPrice) {
      return `${(product.minPrice ?? 0).toLocaleString()} đ`;
    }
    return `${(product.minPrice ?? 0).toLocaleString()} đ - ${(
      product.maxPrice ?? 0
    ).toLocaleString()} đ`;
  };

  const stock = getStock();
  const priceDisplay = getPriceDisplay();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Tồn kho:</span>
        <span
          className={`font-semibold ${
            stock === 0
              ? "text-red-600"
              : stock < 10
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {stock === 0 ? (
            <>
              <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
              Hết hàng
            </>
          ) : (
            `${stock} sản phẩm`
          )}
        </span>
      </div>

      <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
        <div className="text-sm text-gray-600 mb-1">Giá sản phẩm</div>
        <div className="text-3xl font-bold text-green-700">{priceDisplay}</div>
      </div>
    </div>
  );
};

export default ProductStockPrice;

