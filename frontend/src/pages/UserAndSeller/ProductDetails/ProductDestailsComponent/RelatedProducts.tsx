import { useState, useMemo, useEffect, useRef } from "react";
import ProductCard from "@components/ProductCard/ProductCard";
import type { ProductCardData } from "@components/ProductCard/ProductCard";
import type { ProductResponse } from "@models/modelResponse/ProductResponse";

interface RelatedProductsProps {
  relatedProducts: ProductResponse[];
}

const RelatedProducts = ({ relatedProducts }: RelatedProductsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const sectionRef = useRef<HTMLDivElement>(null);

  // Memoized mapped products
  const mappedProducts: ProductCardData[] = useMemo(
    () =>
      relatedProducts.map((p) => ({
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
      })),
    [relatedProducts]
  );

  // Memoized pagination calculations
  const { paginatedProducts, totalPages } = useMemo(() => {
    const total = mappedProducts.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = mappedProducts.slice(startIndex, endIndex);

    return { paginatedProducts, totalPages };
  }, [mappedProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when relatedProducts change
  useEffect(() => {
    setCurrentPage(1);
  }, [relatedProducts]);

  if (relatedProducts.length === 0) {
    return null;
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of related products section
    if (sectionRef.current) {
      const top =
        sectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      ref={sectionRef}
      className="bg-white rounded-lg shadow-sm p-6 related-products-section"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sản phẩm tương tự
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {paginatedProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === page
                  ? "bg-green-600 text-white"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}

      {/* Page info */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-gray-600 mt-4">
          Trang {currentPage} / {totalPages} (Hiển thị{" "}
          {paginatedProducts.length} / {mappedProducts.length} sản phẩm)
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;
