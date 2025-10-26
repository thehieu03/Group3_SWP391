import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox } from "@fortawesome/free-solid-svg-icons";
import Image from "../Image";
import routesConfig from "@/config/routesConfig";
import { orderServices } from "@/services/OrderServices";
import type { OrderResponse } from "@/models/modelResponse/OrderResponse";
import { useAuth } from "@/hooks/useAuth";

/** ---- Format helpers (an toàn) ---- */
const fmtVND = (v: unknown) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") : "0";
};

const fmtDateVN = (d?: string | number | Date) => {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("vi-VN");
};

const text = (v: unknown, fallback = "—") =>
  typeof v === "string" && v.trim().length > 0 ? v : fallback;

const PurchasedProducts: React.FC = () => {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const userOrders = await orderServices.getOrdersUserAsync();
        // Phòng thủ: đảm bảo luôn là mảng object
        const safe = Array.isArray(userOrders)
          ? userOrders.filter((x) => x && typeof x === "object")
          : [];
        setOrders(safe as unknown as OrderResponse[]);
      } catch {
        setError("Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, [isLoggedIn]);

  const handleProductClick = (productId?: number) => {
    if (typeof productId === "number") {
      window.location.href = routesConfig.getProductUrl(productId);
    }
  };

  if (authLoading || !isLoggedIn) return null;

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Lối tắt</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Lối tắt</h2>
        <div className="flex items-center justify-center py-12">
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
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Lối tắt</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">
              <FontAwesomeIcon icon={faBox} className="text-6xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-500">
              Bạn chưa mua sản phẩm nào. Hãy khám phá các sản phẩm trên trang!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Lối tắt</h2>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {(orders ?? []).map((order, idx) => {
            const key = order?.id ?? `${idx}-${order?.productId ?? "x"}`;
            const ratingText =
              typeof order?.rating === "number"
                ? `${order.rating} Reviews`
                : "Chưa đánh giá";

            return (
              <div
                key={key}
                className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
                onClick={() => handleProductClick(order?.productId)}
              >
                <div className="bg-green-600 text-white text-center py-1 px-2 rounded-t-lg">
                  <span className="text-sm font-medium">Sản phẩm đã mua</span>
                </div>

                <div className="aspect-square p-4">
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    {order?.productImage ? (
                      <Image
                        src={order.productImage}
                        alt={text(order?.productName, "Sản phẩm")}
                        className="w-16 h-16 object-contain"
                      />
                    ) : (
                      <div className="text-gray-400">No Image</div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {ratingText}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    Số lượng: {order?.quantity ?? 0} | Tổng:{" "}
                    {fmtVND(order?.totalAmount)} ₫
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                    {text(order?.productName, "Sản phẩm")}
                  </h3>

                  <div className="text-xs text-gray-500 mb-1">
                    <span className="font-medium">Sản phẩm:</span>{" "}
                    {text(order?.categoryName)}
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">Người bán:</span>{" "}
                    {text(order?.sellerName)}
                  </div>

                  <div className="text-sm font-bold text-green-600">
                    {fmtVND(order?.price)} ₫
                  </div>

                  <div className="text-xs text-gray-400 mt-2">
                    Mua ngày: {fmtDateVN(order?.orderDate)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
          aria-label="Scroll left"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          type="button"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
          aria-label="Scroll right"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PurchasedProducts;
