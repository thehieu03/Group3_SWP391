import Button from "@components/Button/Button";
import routesConfig from "@config/routesConfig.ts";
import type { ProductResponse } from "@models/modelResponse/ProductResponse";

interface ProductBreadcrumbProps {
  product: ProductResponse;
}

const ProductBreadcrumb = ({ product }: ProductBreadcrumbProps) => {
  return (
    <nav className="mb-6 text-sm">
      <ol className="flex items-center space-x-2 text-gray-600">
        <li>
          <Button to={routesConfig.home} className="hover:text-green-600">
            Trang chủ
          </Button>
        </li>
        <li>/</li>
        <li>
          <Button
            to={routesConfig.getCategoryProductsUrl(product.categoryId ?? 1)}
            className="hover:text-green-600"
          >
            {product.categoryName ?? "Danh mục"}
          </Button>
        </li>
        <li>/</li>
        <li className="text-gray-900 font-medium">{product.name}</li>
      </ol>
    </nav>
  );
};

export default ProductBreadcrumb;
