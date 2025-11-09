import ProductCard from "@components/ProductCard/ProductCard";
import type { ProductCardData } from "@components/ProductCard/ProductCard";
import type { ProductResponse } from "@models/modelResponse/ProductResponse";

interface RelatedProductsProps {
  relatedProducts: ProductResponse[];
}

const RelatedProducts = ({ relatedProducts }: RelatedProductsProps) => {
  if (relatedProducts.length === 0) {
    return null;
  }

  const mappedProducts: ProductCardData[] = relatedProducts.map((p) => ({
    id: String(p.id),
    name: p.name,
    seller: p.shopName ?? "Unknown Shop",
    category: p.categoryName ?? "Unknown Category",
    rating: Math.round(p.averageRating),
    reviews: p.reviewCount,
    sold: p.totalSold,
    complaintRate: p.complaintRate,
    stock: p.totalStock,
    minPrice: p.minPrice ?? 0,
    maxPrice: p.maxPrice ?? 0,
    descriptionItems: p.details
      ? p.details.split("\n").filter((line) => line.trim())
      : p.description
      ? [p.description]
      : [],
    imageUrl: p.imageUrl ?? null,
    imageLetter: p.name.charAt(0).toUpperCase(),
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sản phẩm tương tự
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mappedProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;

