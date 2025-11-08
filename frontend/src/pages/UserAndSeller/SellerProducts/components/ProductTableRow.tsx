import { memo, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Image from "@/components/Image";
import { formatPrice, formatDateOnly } from "@/helpers";
import type { AdminProductResponse } from "@/models/modelResponse/AdminProductResponse";

interface ProductTableRowProps {
  product: AdminProductResponse;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  onEdit: (id: number) => void; // Keep for compatibility but not used
}

const ProductTableRow = memo(
  ({ product, onToggleStatus }: ProductTableRowProps) => {
    const navigate = useNavigate();

    const productImage = useMemo(() => {
      return (
        product.primaryImageUrl ||
        (product.imageUrls && product.imageUrls[0]) ||
        (product.images && product.images[0])
      );
    }, [product]);

    const stockColorClass = useMemo(() => {
      if (product.stock < 10) return "text-red-600";
      if (product.stock < 50) return "text-yellow-600";
      return "text-green-600";
    }, [product.stock]);

    const handleToggleStatus = useCallback(() => {
      onToggleStatus(product.id, product.isActive);
    }, [product.id, product.isActive, onToggleStatus]);

    const handleEdit = useCallback(() => {
      navigate(`/seller/products/edit/${product.id}`);
    }, [product.id, navigate]);

    const handleProductClick = useCallback(() => {
      navigate(`/seller/products/edit/${product.id}`);
    }, [product.id, navigate]);

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              {productImage ? (
                <Image
                  className="h-10 w-10 rounded-lg object-cover"
                  src={productImage}
                  alt={product.name}
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </div>
            <div className="ml-4">
              <div
                className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={handleProductClick}
              >
                {product.name}
              </div>
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {product.description}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{product.categoryName}</div>
          {product.subcategoryName && (
            <div className="text-sm text-gray-500">
              {product.subcategoryName}
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatPrice(product.price)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`text-sm font-medium ${stockColorClass}`}>
            {product.stock}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              product.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.isActive ? "Hoạt động" : "Ngừng hoạt động"}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDateOnly(product.createdAt)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              Sửa
            </button>
            <button
              onClick={handleToggleStatus}
              className={`px-3 py-1 text-xs rounded-md ${
                product.isActive
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {product.isActive ? "Ngừng bán" : "Bán lại"}
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

ProductTableRow.displayName = "ProductTableRow";

export default ProductTableRow;
