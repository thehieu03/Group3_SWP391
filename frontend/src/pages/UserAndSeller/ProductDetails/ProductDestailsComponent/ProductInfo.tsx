import Button from "@components/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import ProductRating from "./ProductRating";
import type { ProductResponse } from "@models/modelResponse/ProductResponse";
import type { FeedbackResponse } from "@models/modelResponse/FeedbackResponse";

interface ProductInfoProps {
  product: ProductResponse;
  feedbacks?: FeedbackResponse[];
  shopName?: string | null;
  categoryName?: string | null;
}

const ProductInfo = ({
  product,
  feedbacks = [],
  shopName,
  categoryName,
}: ProductInfoProps) => {
  // Calculate rating from feedbacks if product.averageRating is 0 or feedbacks exist
  const calculatedRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : product.averageRating;

  const displayRating =
    product.averageRating > 0 ? product.averageRating : calculatedRating;
  const reviewCount =
    feedbacks.length > 0 ? feedbacks.length : product.reviewCount;
  return (
    <div className="space-y-4">
      {/* Category Badge */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-md">
          {categoryName ?? product.categoryName ?? "Sản phẩm"}
        </span>
        {product.subcategoryName && (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
            {product.subcategoryName}
          </span>
        )}
      </div>

      {/* Product Name */}
      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

      {/* Rating and Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ProductRating rating={displayRating} />
          <span className="text-sm font-semibold text-gray-700">
            {displayRating.toFixed(1)}
          </span>
        </div>
        <span className="text-gray-400">|</span>
        <span className="text-sm text-gray-600">{reviewCount} đánh giá</span>
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-gray-700 leading-relaxed">{product.description}</p>
      )}

      {/* Seller Info */}
      <div className="border-t border-b border-gray-200 py-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Người bán:</span>
          <Button
            to="#"
            className="text-green-700 font-semibold hover:underline px-0"
          >
            {shopName ?? product.shopName ?? "Unknown Shop"}
          </Button>
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-green-600 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Danh mục:</span>
          <span className="font-semibold text-gray-900">
            {categoryName ?? product.categoryName ?? "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
