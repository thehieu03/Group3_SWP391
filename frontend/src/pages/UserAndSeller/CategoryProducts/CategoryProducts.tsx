import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox } from "@fortawesome/free-solid-svg-icons";
import { productServices } from "../../../services/ProductServices";
import { categoryServices } from "../../../services/CategoryServices";
import type { ProductResponse } from "../../../models/modelResponse/ProductResponse";
import type { CategoriesResponse } from "../../../models/modelResponse/CategoriesResponse";
import Image from "../../../components/Image";
import routesConfig from "../../../config/routesConfig";

const CategoryProducts: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [category, setCategory] = useState<CategoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const categories = await categoryServices.getAllCategoryAsync();
        const foundCategory = categories.find((cat) => cat.id === parseInt(id));
        setCategory(foundCategory || null);

        const categoryProducts =
          await productServices.getProductsByCategoryAsync(parseInt(id));
        setProducts(categoryProducts);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleProductClick = (productId: number) => {
    window.location.href = routesConfig.getProductUrl(productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            {category?.name || "Danh mục sản phẩm"}
          </h1>
          <p className="text-gray-600">Tổng {products.length} sản phẩm</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <FontAwesomeIcon icon={faBox} className="text-6xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-500">
              Danh mục này hiện tại chưa có sản phẩm nào.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="aspect-square rounded-t-lg overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isActive ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
