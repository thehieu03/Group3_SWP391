<<<<<<< Updated upstream
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductDetails() {
  const { id } = useParams();
=======
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Image from "../../../components/Image";
import routesConfig from "../../../config/routesConfig";

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
>>>>>>> Stashed changes
  const navigate = useNavigate();
  const productId = id || "1";

  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [tab, setTab] = useState("mota");
  const [loading, setLoading] = useState(true);
<<<<<<< Updated upstream
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showBuyModal, setShowBuyModal] = useState(false); // ✅ Modal
  const isLoggedIn = true;

  // ✅ Lấy sản phẩm theo ID
=======
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const isLoggedIn = true;

  // ✅ Lấy chi tiết sản phẩm
>>>>>>> Stashed changes
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
<<<<<<< Updated upstream
        const res = await axios.get(`/api/products/${productId}`);
        setProduct(res.data[0]);
      } catch (err: any) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError("Không thể tải sản phẩm từ server");
=======
        const res = await axios.get(`/api/products/getProductById?id=${productId}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError("Không thể tải dữ liệu sản phẩm.");
>>>>>>> Stashed changes
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

<<<<<<< Updated upstream
  // ✅ Lấy sản phẩm tương tự
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.categoryId) return;
      try {
        const res = await axios.get(`/api/products?categoryId=${product.categoryId}`);
        const filtered = res.data
          .filter((p: any) => p.categoryId === product.categoryId && p.id !== product.id)
          .slice(0, 5);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm tương tự:", err);
      }
    };
    fetchRelatedProducts();
  }, [product?.categoryId, product?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-red-500 text-lg font-medium">
          {error || "Không tìm thấy sản phẩm"}
        </p>
      </div>
    );
  }

  // ✅ Tính giá, tồn kho, tổng tiền
  const currentPrice = selectedVariant?.price ?? product.fee ?? 0;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
  const totalPrice = currentPrice * quantity;

  // ✅ Chuyển trang
  const handleShopClick = () => {
    if (product.shop?.id) navigate(`/shopDetails?id=${product.shop.id}`);
  };

  const handleCategoryClick = () => {
    if (product.category?.id) navigate(`/products?categoryId=${product.category.id}`);
  };

  const handleRelatedProductClick = (id: number) => {
    navigate(`/product/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Mua hàng
  const handleBuyClick = () => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để mua hàng!");
      return;
    }
    setShowBuyModal(true);
  };

  return (
    <div className="container mx-auto max-w-[1024px] p-4 font-sans text-gray-800">
      {/* --- Chi tiết sản phẩm --- */}
      <div className="flex flex-col md:flex-row bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition">
        {/* Ảnh */}
        <div className="md:w-1/2 flex justify-center mb-4 md:mb-0 relative">
          <img
            src={
              product.imageBase64
                ? `data:image/png;base64,${product.imageBase64}`
                : "/no-image.png"
            }
            alt={product.name}
            className="rounded-2xl w-96 h-auto border"
          />
          <div className="absolute top-3 left-3 flex flex-col space-y-1 text-xs font-bold text-white">
            <span className="bg-green-600 px-2 py-1 rounded">KHÔNG TRÙNG</span>
            <span className="bg-blue-600 px-2 py-1 rounded">KHO TAPHOAMMO</span>
          </div>
        </div>

        {/* Thông tin */}
        <div className="md:w-1/2 md:pl-6">
          <h2 className="text-2xl font-bold text-green-700 mb-1">{product.name}</h2>

          {product.shop?.name && (
            <p className="text-sm text-gray-700 mb-1">
              Cửa hàng:{" "}
              <span
                onClick={handleShopClick}
                className="font-semibold text-green-700 cursor-pointer hover:underline hover:text-green-800 transition"
              >
                {product.shop.name}
              </span>
            </p>
          )}

          {product.category && (
            <p className="text-sm text-gray-600 mb-2">
              Danh mục:{" "}
              <span
                onClick={handleCategoryClick}
                className="font-semibold text-green-700 cursor-pointer hover:underline hover:text-green-800 transition"
              >
                {product.category.name}
              </span>
            </p>
          )}

          <p className="text-gray-700 mb-3 text-sm">
            {product.description || "Không có mô tả sản phẩm."}
          </p>

          <div className="text-green-700 font-bold text-2xl mb-1">
            {currentPrice.toLocaleString("vi-VN")} VND
          </div>
          <div className="text-sm text-gray-500 mb-4">Kho: {currentStock}</div>

          {/* Biến thể */}
          {product.productVariants && product.productVariants.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">SẢN PHẨM</h4>
              <div className="flex flex-wrap gap-3">
                {product.productVariants.map((variant: any) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => navigate(`/products?categoryId=${product.categoryId}`)}
                      className={`border rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? "border-green-600 bg-green-100 text-green-700"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {variant.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Số lượng */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">SỐ LƯỢNG</p>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 border rounded text-gray-600 font-bold hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 border rounded text-gray-600 font-bold hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* ✅ Nút mua hàng hoạt động */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleBuyClick}
              className="flex-1 py-2 rounded font-semibold text-white bg-green-600 hover:opacity-90"
            >
              Mua hàng
            </button>

            <button
              onClick={() => navigate(`/chat?shopId=${product.shop?.id || ""}`)}
              className="flex-1 py-2 rounded font-semibold border-2 border-green-700 text-green-700 hover:bg-green-50"
            >
              Nhắn tin
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal Xác nhận đơn hàng */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[400px] p-5 animate-fadeIn">
            <h2 className="text-lg font-bold text-green-700 mb-3 text-center">
              Xác nhận đơn hàng
            </h2>
            <p className="text-gray-700 text-sm mb-3 text-center">
              Vui lòng xác nhận các thông tin sau:
            </p>

            <div className="bg-yellow-100 border border-yellow-400 rounded-md p-3 mb-3">
              <p className="font-semibold text-sm text-gray-700">
                Mặt hàng: {product.name}
              </p>
            </div>

            <p className="text-sm">Số lượng: {quantity}</p>
            <p className="text-sm">
              Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VND
            </p>
            <p className="font-semibold text-lg mt-1">
              Tổng thanh toán:{" "}
              <span className="text-green-700">
                {totalPrice.toLocaleString("vi-VN")} VND
              </span>
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowBuyModal(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  alert(
                    `🛒 Mua hàng thành công!\nTổng tiền: ${totalPrice.toLocaleString(
                      "vi-VN"
                    )} VND`
                  );
                  setShowBuyModal(false);
                }}
                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Mua hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Tabs mô tả / đánh giá --- */}
      <div className="bg-white rounded-2xl mt-6 shadow-md">
        <div className="flex border-b">
          {["mota", "reviews"].map((t) => (
            <button
              key={t}
              className={`flex-1 py-2 text-center font-semibold ${
                tab === t
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600"
              }`}
              onClick={() => setTab(t)}
            >
              {t === "mota" ? "Mô tả" : "Đánh giá"}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === "mota" ? (
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {product.details || "Chưa có thông tin chi tiết cho sản phẩm này."}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              Chưa có đánh giá nào cho sản phẩm này.
            </p>
          )}
        </div>
      </div>

      {/* ✅ SẢN PHẨM TƯƠNG TỰ */}
      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <h4 className="font-bold text-lg mb-4">Sản phẩm khác</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {relatedProducts.map((p: any) => (
              <div
                key={p.id}
                onClick={() => handleRelatedProductClick(p.id)}
                className="bg-white border rounded-lg shadow-sm hover:shadow-lg p-2 text-center transform transition hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
              >
                <img
                  src={
                    p.imageBase64
                      ? `data:image/png;base64,${p.imageBase64}`
                      : "/no-image.png"
                  }
                  alt={p.name}
                  className="h-40 w-full object-contain mb-2 rounded"
                />
                <div className="text-sm font-semibold mb-1 line-clamp-2">{p.name}</div>
                <div className="text-green-700 font-bold text-sm">
                  {p.fee?.toLocaleString("vi-VN")} đ
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
=======
  // ✅ Lấy tồn kho (tự fallback nếu API lỗi hoặc không có endpoint)
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const urls = [
          `/api/productvariants/get-by-product-id?productId=${productId}`,
          `/api/productvariants/getByProductId?productId=${productId}`,
          `/api/productvariants/byProductId?productId=${productId}`,
          `/api/productvariants?productId=${productId}`,
          `/api/products/${productId}/variants`,
        ];

        let res = null;
        for (const url of urls) {
          try {
            const r = await axios.get(url);
            if (r.status === 200 && Array.isArray(r.data)) {
              res = r;
              console.log("✅ Tìm thấy API tồn kho:", url);
              break;
            }
          } catch {
            // thử tiếp URL khác
          }
        }

        if (res && Array.isArray(res.data) && res.data.length > 0) {
          const totalStock = res.data.reduce(
            (sum: number, v: any) => sum + (Number(v.stock) || 0),
            0
          );
          setProduct((prev: any) =>
            prev
              ? { ...prev, stock: totalStock, productVariants: res.data }
              : { stock: totalStock, productVariants: res.data }
          );
        } else {
          console.warn("⚠️ Không có API tồn kho hợp lệ, dùng fallback");
          setProduct((prev: any) =>
            prev
              ? {
                ...prev,
                stock: prev.stock && prev.stock > 0 ? prev.stock : 9999,
                productVariants: prev.productVariants || [],
              }
              : { stock: 9999, productVariants: [] }
          );
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy số lượng tồn kho:", err);
        // ✅ fallback nếu lỗi
        setProduct((prev: any) =>
          prev
            ? {
              ...prev,
              stock: prev.stock && prev.stock > 0 ? prev.stock : 9999,
              productVariants: prev.productVariants || [],
            }
            : { stock: 9999, productVariants: [] }
        );
      }
    };
    fetchStock();
  }, [productId]);

  // ✅ Lấy sản phẩm liên quan
  useEffect(() => {
    const fetchRelated = async () => {
      if (!product?.categoryId) return;
      try {
        const res = await axios.get(`/api/products?categoryId=${product.categoryId}`);
        const related = res.data
          .filter((p: any) => p.categoryId === product.categoryId && p.id !== product.id)
          .slice(0, 5);
        setRelatedProducts(related);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm liên quan:", err);
      }
    };
    fetchRelated();
  }, [product?.categoryId, product?.id]);

  // ✅ Chuyển sang trang subcategory
  const handleViewMore = () => {
    const subcategoryId = product?.subCategoryId || product?.subcategoryId;
    if (!subcategoryId) {
      alert("Không tìm thấy danh mục con của sản phẩm này.");
      return;
    }
    navigate(routesConfig.getSubCategoryProductsUrl(subcategoryId));
  };

  const handleBuyClick = () => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để mua hàng!");
      return;
    }
    setShowBuyModal(true);
  };

  const handleRelatedProductClick = (productId: number) => {
    navigate(routesConfig.getProductDetailsUrl(productId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-red-600 text-lg">{error || "Không tìm thấy sản phẩm"}</p>
      </div>
    );
  }

  // ✅ ép kiểu và đảm bảo không bị undefined
  const currentPrice = Number(selectedVariant?.price ?? product.fee ?? 0);
  const currentStock = Math.max(Number(selectedVariant?.stock ?? product?.stock ?? 0), 0);
  const totalPrice = currentPrice * quantity;

  return (
    <div className="container mx-auto max-w-[1024px] p-4 font-sans text-gray-800">
      <div className="flex flex-col md:flex-row bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition">
        {/* ✅ Ảnh sản phẩm */}
        <div className="md:w-1/2 flex justify-center mb-4 md:mb-0 relative">
          <div className="w-96 h-96 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border">
            <Image
              src={
                product.imageBase64
                  ? `data:image/png;base64,${product.imageBase64}`
                  : "/no-image.png"
              }
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="absolute top-3 left-3 flex flex-col space-y-1 text-xs font-bold text-white">
            <span className="bg-green-600 px-2 py-1 rounded">KHÔNG TRÙNG</span>
            <span className="bg-blue-600 px-2 py-1 rounded">KHO TAPHOAMMO</span>
          </div>
        </div>

        {/* --- Thông tin sản phẩm --- */}
        <div className="md:w-1/2 md:pl-6">
          <h2 className="text-2xl font-bold text-green-700 mb-1">{product.name}</h2>

          {product.shop?.name && (
            <p className="text-sm text-gray-700 mb-1">
              Cửa hàng:{" "}
              <span
                onClick={() => navigate(`/shopDetails?id=${product.shop?.id || ""}`)}
                className="font-semibold text-green-700 cursor-pointer hover:underline hover:text-green-800 transition"
              >
                {product.shop.name}
              </span>
            </p>
          )}

          {product.category && (
            <p className="text-sm text-gray-600 mb-2">
              Danh mục:{" "}
              <span
                onClick={() =>
                  navigate(routesConfig.getCategoryProductsUrl(product.category?.id || 0))
                }
                className="font-semibold text-green-700 cursor-pointer hover:underline hover:text-green-800 transition"
              >
                {product.category.name}
              </span>
            </p>
          )}

          <p className="text-gray-700 mb-3 text-sm">
            {product.description || "Không có mô tả sản phẩm."}
          </p>

          <div className="text-green-700 font-bold text-2xl mb-1">
            {currentPrice.toLocaleString("vi-VN")} đ
          </div>

          {/* ✅ Kho hiển thị đúng kể cả khi API lỗi */}
          <div className="text-sm text-gray-500 mb-4">
            Kho còn lại:{" "}
            <span
              className={`font-semibold ${currentStock > 0 ? "text-green-700" : "text-red-600"
                }`}
            >
              {currentStock > 0 ? `${currentStock}` : "Hết hàng"}
            </span>
          </div>

          {/* --- Biến thể --- */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.productVariants?.map((v: any) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                title={`Kho còn: ${v.stock}`}
                className={`border rounded-lg px-3 py-2 text-sm font-semibold transition ${selectedVariant?.id === v.id
                    ? "border-green-600 bg-green-100 text-green-700"
                    : "border-gray-300 hover:border-green-400"
                  }`}
              >
                {v.name}
              </button>
            ))}
          </div>

          {/* --- Số lượng --- */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">SỐ LƯỢNG</p>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 border rounded text-gray-600 font-bold hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 border rounded text-gray-600 font-bold hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* --- Nút mua giữ nguyên --- */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleBuyClick}
              className="flex-1 py-2 rounded font-semibold text-white bg-green-600 hover:opacity-90"
            >
              Mua hàng
            </button>
            <button
              onClick={() => navigate(`/chat?shopId=${product.shop?.id || ""}`)}
              className="flex-1 py-2 rounded font-semibold border-2 border-green-700 text-green-700 hover:bg-green-50"
            >
              Nhắn tin
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal mua hàng */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[400px] p-5 animate-fadeIn">
            <h2 className="text-lg font-bold text-green-700 mb-3 text-center">
              Xác nhận đơn hàng
            </h2>
            <p className="text-gray-700 text-sm mb-3 text-center">
              Vui lòng xác nhận thông tin trước khi thanh toán
            </p>
            <div className="bg-yellow-100 border border-yellow-400 rounded-md p-3 mb-3">
              <p className="font-semibold text-sm text-gray-700">
                Mặt hàng: {product.name}
              </p>
            </div>

            <p className="text-sm">Số lượng: {quantity}</p>
            <p className="text-sm mb-1">
              Tổng tiền: {totalPrice.toLocaleString("vi-VN")} đ
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowBuyModal(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  if (quantity <= (product?.stock ?? 0)) {
                    setProduct((prev: any) =>
                      prev ? { ...prev, stock: (prev.stock || 0) - quantity } : prev
                    );
                  } else {
                    alert("❌ Không đủ hàng trong kho!");
                    return;
                  }

                  // 🧠 phần gốc của bạn — GIỮ NGUYÊN KHÔNG XOÁ
                  alert(
                    `🛒 Mua hàng thành công!\nTổng tiền: ${totalPrice.toLocaleString(
                      "vi-VN"
                    )} đ`
                  );
                  setShowBuyModal(false);
                }}
                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Tabs: Mô tả / Đánh giá --- */}
      <div className="bg-white rounded-2xl mt-6 shadow-md">
        <div className="flex border-b">
          {["mota", "reviews"].map((t) => (
            <button
              key={t}
              className={`flex-1 py-2 text-center font-semibold ${tab === t
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-600"
                }`}
              onClick={() => setTab(t)}
            >
              {t === "mota" ? "Mô tả" : "Đánh giá"}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === "mota" ? (
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {product.details || "Chưa có thông tin chi tiết cho sản phẩm này."}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              Chưa có đánh giá nào cho sản phẩm này.
            </p>
          )}
        </div>
      </div>

      {/* --- Sản phẩm liên quan --- */}
      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <h4 className="font-bold text-lg whitespace-nowrap">
              Sản phẩm khác
            </h4>
            <div className="flex-1 h-[1px] bg-gray-300 mx-4"></div>
            <button
              onClick={handleViewMore}
              className="text-green-600 border border-green-600 px-3 py-1 rounded hover:bg-green-600 hover:text-white transition"
            >
              Xem thêm
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleRelatedProductClick(p.id)}
                className="bg-white border rounded-lg shadow-sm hover:shadow-lg p-2 text-center transform transition hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
              >
                <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={
                      p.imageBase64
                        ? `data:image/png;base64,${p.imageBase64}`
                        : "/no-image.png"
                    }
                    alt={p.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-sm font-semibold mb-1 line-clamp-2 mt-2">
                  {p.name}
                </div>
                <div className="text-green-700 font-bold text-sm">
                  {p.fee?.toLocaleString("vi-VN")} đ
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
>>>>>>> Stashed changes
