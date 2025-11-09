interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({
  page,
  totalPages,
  onPageChange,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages.map((pageNumber) => (
      <button
        key={pageNumber}
        onClick={() => onPageChange(pageNumber)}
        className={`px-3 py-1 rounded-md border text-sm ${
          page === pageNumber
            ? "bg-green-500 text-white border-green-500"
            : "text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
      >
        {pageNumber}
      </button>
    ));
  };

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Trang {page}/{totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`px-3 py-1 rounded-md border text-sm ${
            page === 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Trước
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={`px-3 py-1 rounded-md border text-sm ${
            page === totalPages
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
