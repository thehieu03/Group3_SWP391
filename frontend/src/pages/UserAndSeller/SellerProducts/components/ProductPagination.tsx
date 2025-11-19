import { memo, useCallback, useMemo } from "react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const ProductPagination = memo(
  ({
    currentPage,
    totalPages,
    total,
    limit,
    onPageChange,
  }: ProductPaginationProps) => {
    const pageNumbers = useMemo(
      () => Array.from({ length: totalPages }, (_, i) => i + 1),
      [totalPages]
    );

    const displayRange = useMemo(() => {
      return {
        start: (currentPage - 1) * limit + 1,
        end: Math.min(currentPage * limit, total),
      };
    }, [currentPage, limit, total]);

    const handlePrevious = useCallback(() => {
      onPageChange(Math.max(1, currentPage - 1));
    }, [currentPage, onPageChange]);

    const handleNext = useCallback(() => {
      onPageChange(Math.min(totalPages, currentPage + 1));
    }, [currentPage, totalPages, onPageChange]);

    const handlePageClick = useCallback(
      (page: number) => {
        onPageChange(page);
      },
      [onPageChange]
    );

    if (totalPages <= 1) return null;

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Trước
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{displayRange.start}</span>{" "}
              đến <span className="font-medium">{displayRange.end}</span> trong{" "}
              <span className="font-medium">{total}</span> kết quả
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? "z-10 bg-green-50 border-green-500 text-green-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    );
  }
);

ProductPagination.displayName = "ProductPagination";

export default ProductPagination;

