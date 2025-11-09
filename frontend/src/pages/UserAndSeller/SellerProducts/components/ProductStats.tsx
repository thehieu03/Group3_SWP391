import { memo, useMemo } from "react";
import type { AdminProductResponse } from "@/models/modelResponse/AdminProductResponse";

interface ProductStatsProps {
  products: AdminProductResponse[];
  total: number;
}

const ProductStats = memo(({ products, total }: ProductStatsProps) => {
  const stats = useMemo(() => {
    const activeCount = products.filter((p) => p.isActive).length;
    const inactiveCount = products.filter((p) => !p.isActive).length;

    return {
      total,
      activeCount,
      inactiveCount,
    };
  }, [products, total]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        <div className="text-sm text-gray-600">Tổng sản phẩm</div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-2xl font-bold text-green-600">
          {stats.activeCount}
        </div>
        <div className="text-sm text-gray-600">Đang hoạt động</div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-2xl font-bold text-red-600">
          {stats.inactiveCount}
        </div>
        <div className="text-sm text-gray-600">Ngừng hoạt động</div>
      </div>
    </div>
  );
});

ProductStats.displayName = "ProductStats";

export default ProductStats;
