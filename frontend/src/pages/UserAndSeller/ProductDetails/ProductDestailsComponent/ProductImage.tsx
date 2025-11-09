import Image from "@components/Image";
import type { ProductResponse } from "@models/modelResponse/ProductResponse";

interface ProductImageProps {
  product: ProductResponse;
}

const ProductImage = ({ product }: ProductImageProps) => {
  return (
    <div className="relative">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
        <Image
          src={product.imageUrl ?? undefined}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {product.isActive && (
          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-md shadow-lg">
            ĐANG BÁN
          </span>
        )}
        {!product.isActive && (
          <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-md shadow-lg">
            NGỪNG BÁN
          </span>
        )}
        {product.complaintRate === 0 && (
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-md shadow-lg">
            KHÔNG KHIẾU NẠI
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductImage;
