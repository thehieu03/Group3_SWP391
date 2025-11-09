import { memo } from "react";
import ProductTableRow from "./ProductTableRow";
import type { AdminProductResponse } from "@/models/modelResponse/AdminProductResponse";

interface ProductTableProps {
  products: AdminProductResponse[];
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  onEdit: (id: number) => void;
}

const ProductTable = memo(
  ({ products, onToggleStatus, onEdit }: ProductTableProps) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tồn kho
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onToggleStatus={onToggleStatus}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

ProductTable.displayName = "ProductTable";

export default ProductTable;
