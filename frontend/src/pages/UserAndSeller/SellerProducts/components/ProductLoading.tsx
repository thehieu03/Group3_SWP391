import { memo } from "react";

const ProductLoading = memo(() => {
  return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Đang tải dữ liệu...</p>
    </div>
  );
});

ProductLoading.displayName = "ProductLoading";

export default ProductLoading;

