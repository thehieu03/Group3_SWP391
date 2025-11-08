import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@components/Button/Button";
import type { ProductResponse } from "@models/modelResponse/ProductResponse";
import type { ProductVariantResponse } from "@models/modelResponse/ProductVariantResponse";
import { productServices } from "@services/ProductServices";
import { productVariantServices } from "@services/ProductVariantServices";
import { feedbackServices } from "@services/FeedbackServices";
import { shopServices } from "@services/ShopServices";
import { categoryServices } from "@services/CategoryServices";
import { useAuth } from "@hooks/useAuth";
import type { FeedbackResponse } from "@models/modelResponse/FeedbackResponse";
import routesConfig from "@config/routesConfig.ts";
import ProductBreadcrumb from "./ProductDestailsComponent/ProductBreadcrumb";
import ProductImage from "./ProductDestailsComponent/ProductImage";
import ProductInfo from "./ProductDestailsComponent/ProductInfo";
import ProductStockPrice from "./ProductDestailsComponent/ProductStockPrice";
import ProductVariants from "./ProductDestailsComponent/ProductVariants";
import ProductActionButtons from "./ProductDestailsComponent/ProductActionButtons";
import ProductTabs from "./ProductDestailsComponent/ProductTabs";
import RelatedProducts from "./ProductDestailsComponent/RelatedProducts";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductResponse[]>([]);
  const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantResponse | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [shopName, setShopName] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("Không tìm thấy sản phẩm");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get product by ID
        const foundProduct = await productServices.getProductByIdAsync(
          Number(id)
        );
        setProduct(foundProduct);

        // Load product variants
        try {
          const productVariants =
            await productVariantServices.getProductVariantsAsync(
              foundProduct.id
            );
          setVariants(productVariants);
          // Auto-select first variant with stock if available
          const firstAvailableVariant = productVariants.find(
            (v) => v.stock && v.stock > 0
          );
          if (firstAvailableVariant) {
            setSelectedVariant(firstAvailableVariant);
          }
        } catch {
          // If variants endpoint doesn't exist or fails (404), continue without variants
          setVariants([]);
        }

        // Load related products (same category) for display
        try {
          if (foundProduct.categoryId) {
            const products = await productServices.getProductsByCategoryAsync(
              foundProduct.categoryId
            );
            const related = products
              .filter((p) => p.id !== foundProduct.id)
              .slice(0, 5);
            setRelatedProducts(related);
          }
        } catch {
          // If related products fail to load, continue without them
          setRelatedProducts([]);
        }

        // Load feedbacks to calculate real rating
        try {
          const productFeedbacks =
            await feedbackServices.getFeedbacksByProductIdAsync(
              foundProduct.id
            );
          setFeedbacks(productFeedbacks);
        } catch {
          // If feedbacks fail to load, continue without them
          setFeedbacks([]);
        }

        // Load shop name if shopId exists
        if (foundProduct.shopId) {
          try {
            const shop = await shopServices.getShopDetailsAsync(
              foundProduct.shopId
            );
            setShopName(shop.name);
          } catch {
            setShopName(null);
          }
        }

        // Load category name if categoryId exists
        if (foundProduct.categoryId) {
          try {
            const categories = await categoryServices.getAllCategoryAsync();
            const category = categories.find(
              (c) => c.id === foundProduct.categoryId
            );
            if (category) {
              setCategoryName(category.name);
            }
          } catch {
            setCategoryName(null);
          }
        }
      } catch {
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Không tìm thấy sản phẩm"}
          </p>
          <Button
            onClick={() => navigate(routesConfig.home)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductBreadcrumb product={product} />

        {/* Main Product Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProductImage product={product} />

            <div className="space-y-4">
              <ProductInfo
                product={product}
                feedbacks={feedbacks}
                shopName={shopName}
                categoryName={categoryName}
              />
              <ProductStockPrice
                product={product}
                selectedVariant={selectedVariant}
              />
              <ProductVariants
                variants={variants}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
              />
              <ProductActionButtons
                product={product}
                variants={variants}
                selectedVariant={selectedVariant}
                isLoggedIn={isLoggedIn}
                authLoading={authLoading}
              />
            </div>
          </div>
        </div>

        <ProductTabs product={product} />
        <RelatedProducts relatedProducts={relatedProducts} />

        {/* Login Button Section - Show when not logged in */}
        {!authLoading && !isLoggedIn && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="text-center space-y-4">
              <p className="text-gray-700 text-lg font-medium">
                Bạn cần đăng nhập để mua hàng
              </p>
              <p className="text-sm text-gray-600">
                Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng và tiến hành
                thanh toán
              </p>
              <Button
                to={routesConfig.loginValidator}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                Đăng nhập ngay
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
