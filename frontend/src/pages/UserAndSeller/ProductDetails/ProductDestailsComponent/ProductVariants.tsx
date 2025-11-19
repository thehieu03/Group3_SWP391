import type { ProductVariantResponse } from "@models/modelResponse/ProductVariantResponse";

interface ProductVariantsProps {
  variants: ProductVariantResponse[];
  selectedVariant: ProductVariantResponse | null;
  onSelectVariant: (variant: ProductVariantResponse) => void;
}

const ProductVariants = ({
  variants,
  selectedVariant,
  onSelectVariant,
}: ProductVariantsProps) => {
  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 border-t border-gray-200 pt-4">
      <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-md inline-block">
        SẢN PHẨM
      </div>
      <div className="space-y-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isAvailable =
            variant.stock !== null &&
            variant.stock !== undefined &&
            variant.stock > 0;

          return (
            <button
              key={variant.id}
              onClick={() => {
                if (isAvailable) {
                  onSelectVariant(variant);
                }
              }}
              disabled={!isAvailable}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? "bg-green-50 border-green-500 text-green-900 font-medium"
                  : isAvailable
                  ? "bg-gray-50 border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
                  : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              <div className={isSelected ? "font-semibold" : "font-medium"}>
                {variant.name}
              </div>
              {!isAvailable && (
                <div className="text-xs text-red-500 mt-1">
                  {variant.stock === 0 || variant.stock === null
                    ? "Hết hàng"
                    : "Không khả dụng"}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductVariants;
