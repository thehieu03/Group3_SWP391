import { useState, useEffect } from "react";
import ProductRating from "./ProductRating";
import type { ProductResponse } from "@models/modelResponse/ProductResponse";
import type { FeedbackResponse } from "@models/modelResponse/FeedbackResponse";
import { feedbackServices } from "@services/FeedbackServices";

interface ProductTabsProps {
  product: ProductResponse;
}

type TabType = "mota" | "reviews" | "api";

const ProductTabs = ({ product }: ProductTabsProps) => {
  const [tab, setTab] = useState<TabType>("mota");
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [errorFeedbacks, setErrorFeedbacks] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedbacks = async () => {
      if (tab === "reviews") {
        try {
          setLoadingFeedbacks(true);
          setErrorFeedbacks(null);
          const data = await feedbackServices.getFeedbacksByProductIdAsync(
            product.id
          );
          setFeedbacks(data);
        } catch {
          setErrorFeedbacks("Không thể tải đánh giá");
          setFeedbacks([]);
        } finally {
          setLoadingFeedbacks(false);
        }
      }
    };

    void loadFeedbacks();
  }, [tab, product.id]);

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setTab("mota")}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              tab === "mota"
                ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              tab === "reviews"
                ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
            }`}
          >
            Đánh giá (
            {feedbacks.length > 0 ? feedbacks.length : product.reviewCount})
          </button>
          <button
            onClick={() => setTab("api")}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              tab === "api"
                ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
            }`}
          >
            API
          </button>
        </div>
      </div>

      <div className="p-6">
        {tab === "mota" && (
          <div className="prose max-w-none">
            {product.details ? (
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {product.details}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Chưa có mô tả chi tiết cho sản phẩm này.
              </p>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-6">
            {/* Hiển thị rating summary nếu có */}
            {(product.reviewCount > 0 || feedbacks.length > 0) && (
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {product.averageRating > 0
                      ? product.averageRating.toFixed(1)
                      : feedbacks.length > 0
                      ? (
                          feedbacks.reduce((sum, f) => sum + f.rating, 0) /
                          feedbacks.length
                        ).toFixed(1)
                      : "0.0"}
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <ProductRating
                      rating={
                        product.averageRating > 0
                          ? product.averageRating
                          : feedbacks.length > 0
                          ? feedbacks.reduce((sum, f) => sum + f.rating, 0) /
                            feedbacks.length
                          : 0
                      }
                      size="md"
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {feedbacks.length > 0
                      ? `${feedbacks.length} đánh giá`
                      : product.reviewCount > 0
                      ? `${product.reviewCount} đánh giá`
                      : "0 đánh giá"}
                  </div>
                </div>
              </div>
            )}

            {loadingFeedbacks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Đang tải đánh giá...</p>
              </div>
            ) : errorFeedbacks ? (
              <div className="text-center py-8 text-red-600">
                <p>{errorFeedbacks}</p>
              </div>
            ) : feedbacks.length > 0 ? (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-semibold text-gray-900">
                            {feedback.accountUsername}
                          </div>
                          <ProductRating rating={feedback.rating} size="sm" />
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {feedback.comment}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(feedback.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">Chưa có đánh giá nào</p>
                <p className="text-sm">
                  Hãy là người đầu tiên đánh giá sản phẩm này!
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "api" && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">Tính năng API</p>
            <p className="text-sm">Tính năng này sẽ được cập nhật sau.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
