import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import gmailImage from "../../assets/gmail.png";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ProductDetails() {
  const query = useQuery();
  const navigate = useNavigate();
  const productId = query.get("id") || "1";

  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [tab, setTab] = useState("mota");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [discountCode, setDiscountCode] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const isLoggedIn = false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/products/${productId}`);
        setProduct(res.data[0]);
      } catch (err: any) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError("Không thể tải sản phẩm từ server");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
<<<<<<< Updated upstream
    const fetchRelated = async () => {
      if (!product?.categoryId) return;
      try {
        const res = await axios.get(`https://localhost:7031/api/products`);
        setRelatedProducts(
          res.data.filter((p: any) => p.id !== product.id).slice(0, 5)
        );
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm liên quan:", err);
      }
    };
    fetchRelated();
  }, [product?.categoryId]);

  if (loading)
    return (
<<<<<<< Updated upstream

        <><div className="body flex items-center justify-center min-h-screen bg-white">
            <div className="container mx-auto max-w-[1024px] p-4 font-sans text-gray-800">

                <div className="flex flex-col md:flex-row bg-white p-4 rounded shadow">

                    <div className="md:w-1/2 flex justify-center mb-4 md:mb-0 relative">
                        <img
                            src="src\assets\gmail-us-co-chua-qua-dich-vu-co-lich-su-hoat-ong-lau-oi_675443.png"
                            alt="Gmail US"
                            className="rounded w-96 h-auto border"
                        />

                        <div className="absolute top-2 left-2 space-y-1 text-xs font-bold text-white">
                            <div className="px-2 py-1 bg-green-600 rounded">KHÔNG TRÙNG</div>
                            <div className="px-2 py-1 bg-blue-600 rounded">KHO TAPHOAMMO</div>
                            <div className="px-2 py-1 bg-yellow-500 rounded text-black">ĐÁNH GIÁ HOÀN TIỀN</div>
                        </div>
                    </div>

                    {/* Thông tin sản phẩm */}
                    <div className="md:w-1/2 md:pl-6">
                        <div className="flex gap-2 mb-2">
                            <span className="bg-green-600 text-white text-sm px-2 py-1 rounded">
                                Sản phẩm
                            </span>
                            <span className="text-green-700 font-bold">
                                GMAIL US CÓ CHƯA QUA DỊCH VỤ CÓ LỊCH SỬ HOẠT ĐỘNG LÂU ĐỜI
                            </span>
                        </div>

                        <div className="flex items-center mb-2">
                            <div className="text-yellow-400 mr-2">★★★★★</div>
                            <span className="text-gray-500 text-sm">
                                905 Reviews | Đã bán: 84847 | Khiếu nại: 0.0%
                            </span>
                        </div>

                        <p className="text-gray-700 mb-3">
                            GMAIL CÓ LỊCH SỬ HOẠT ĐỘNG LÂU ĐỜI. ĐỘ TRUST CAO DÙNG LÀM ĐÁNH GIÁ
                            GOOGLE MAP, REG TÀI KHOẢN ADS ADW GOOGLE ADSEN
                        </p>

                        <div className="text-sm mb-2">
                            Người bán:{" "}
                            <span className="text-green-700 font-semibold">bee690</span> |
                            <span className="text-green-600 ml-1">Online</span> |
                            <span className="text-green-600 ml-1">Đã xác thực</span>
                        </div>
                        <div className="text-sm mb-2">
                            Sản phẩm: <span className="font-semibold">Gmail</span>
                        </div>
                        <div className="text-sm mb-3">
                            Kho: <span className="text-red-600 font-semibold">Hết hàng</span>
                        </div>

                        <div className="text-green-700 font-bold text-2xl mb-4">
                            20.000 VND
                        </div>

                        <div className="border-t pt-3">
                            <div className="font-semibold mb-2 text-gray-700">SẢN PHẨM</div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    "GMAIL US 200X > 2016 CÓ THỂ LÀM FULL DỊCH VỤ CỦA GOOGLE",
                                    "GMAIL US 200X>2016 KÈM KÊNH YOUTUBE 2011 LÀM FULL DỊCH VỤ",
                                    "GMAIL US 200X > 2016 KÈM KÊNH YOUTUBE 2025",
                                    "GMAIL RAROM 200X > 2016 KÈM KÊNH YOUTUBE 2025",
                                    "GMAIL US 200X > 2010 KÈM KÊNH YOUTUBE 200X KO VIDEO",
                                ].map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedProduct(item)}
                                        className={`px-2 py-1 rounded text-sm font-medium border transition ${selectedProduct === item
                                            ? "bg-green-600 text-white border-green-600"
                                            : "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mt-4 mb-2">
                            Vui lòng đăng nhập để mua hàng, hoặc liên hệ với chủ shop.
                        </p>
                        <form method="get" asp-page="/Login">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Đăng nhập
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-white rounded mt-6 shadow">
                    <div className="flex border-b">
                        <button
                            className={`flex-1 py-2 text-center font-semibold ${tab === "mota" ? "text-green-600 border-b-2 border-green-600" : ""}`}
                            onClick={() => setTab("mota")}
                        >
                            Mô tả
                        </button>
                        <button
                            className={`flex-1 py-2 text-center font-semibold ${tab === "reviews"
                                ? "text-green-600 border-b-2 border-green-600"
                                : ""}`}
                            onClick={() => setTab("reviews")}
                        >
                            Reviews
                        </button>
                        <button
                            className={`flex-1 py-2 text-center font-semibold ${tab === "api" ? "text-green-600 border-b-2 border-green-600" : ""}`}
                            onClick={() => setTab("api")}
                        >
                            API
                        </button>
                    </div>

                    <div className="p-4">
                        {tab === "mota" && (
                            <div className="text-sm leading-relaxed">\
                                <p className="mb-2">
                                    .
                                    .
                                </p>
                                <p className="mb-2">
                                    .
                                    .
                                </p>
                                <p className="mb-2">
                                    .
                                    .
                                </p>
                                <p className="mb-2">
                                    .
                                    .
                                </p>
                                <p className="mb-2">
                                    .
                                    .
                                </p>
                                <p className="mb-2">
                                    .
                                    .
                                </p>
                                <p className="mb-2">
                                    .
                                    .
                                </p>
                                <p className="mb-2">
                                    .
                                    .
                                </p>
                                <p className="mb-2">
                                    .
                                    .
                                </p>
                                <p className="mb-2">
                                    .
                                    .
                                </p>
                                <p className="mb-2">
                                    .
                                    .
                                </p>

                                <p className="mb-2">
                                    CÁC DẠNG MAIL BÁN RA SẼ CÓ ĐỊNH DẠNG MAIL | PASS | 2FA ( MÃ 2FA
                                    CHỈ DÙNG CHO LOGIN GOOGLE )
                                </p>
                                <p className="mb-2">
                                    QUÝ VỊ CHỈ VIỆC LOGIN VÀ SỬ DỤNG. MỌI THẮC MẮC QUÝ VỊ VUI LÒNG
                                    INBOX SHOP. LỖI 1 ĐỔI 1 KHI MAIL BÁN RA KHÔNG ĐĂNG NHẬP ĐƯỢC
                                    GOOGLE.
                                </p>
                                <p className="mb-3">BẢO HÀNH LOGIN 3 NGÀY CHO MỌI SẢN PHẨM.</p>

                                <h4 className="text-red-600 font-bold mt-4 mb-2">
                                    HƯỚNG DẪN SỬ DỤNG MAIL LOGIN GOOGLE
                                </h4>
                                <p>ĐỂ LOGIN SAU KHI NHẬP PASS THÌ NÓ SẼ BẮT NHẬP 2FA.</p>
                                <img
                                    src="src/assets/hd1.jpeg"
                                    alt="Hướng dẫn"
                                    className="w-full mt-3 rounded" />
                                <img
                                    src="src/assets/hd2.jpeg"
                                    alt="Hướng dẫn"
                                    className="w-full mt-3 rounded" />
                            </div>
                        )}
                        {tab === "reviews" && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold mb-2">Đánh giá sản phẩm</h3>

                                <link
                                    rel="stylesheet"
                                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
                                />

                                {/* Feedback 1 */}
                                <div className="border-b pb-3">
                                    <div className="flex items-center mb-1">
                                        <span className="font-semibold mr-2">Nguyễn Văn A</span>
                                        <div className="flex text-yellow-500 text-sm">
                                            <i className="fa fa-star"></i>
                                            <i className="fa fa-star"></i>
                                            <i className="fa fa-star"></i>
                                            <i className="fa fa-star"></i>
                                            <i className="fa fa-star-half-alt"></i>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm">
                                        Giao hàng nhanh, tài khoản dùng ổn định. Sẽ ủng hộ thêm!
                                    </p>
                                    <span className="text-xs text-gray-400">2 ngày trước</span>
                                </div>

                                {/* Feedback 2 */}
                                <div className="border-b pb-3">
                                    <div className="flex items-center mb-1">
                                        <span className="font-semibold mr-2">Lê Thị B</span>
                                        <div className="flex text-yellow-500 text-sm">
                                            <i className="fa fa-star"></i>
                                            <i className="fa fa-star"></i>
                                            <i className="fa fa-star"></i>
                                            <i className="fa fa-star"></i>
                                            <i className="fa fa-star"></i>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm">
                                        Sản phẩm đúng mô tả, đáng tiền. Đã nhận được hỗ trợ nhiệt tình.
                                    </p>
                                    <span className="text-xs text-gray-400">5 ngày trước</span>
                                </div>

                                {/* Feedback 3 */}
                                <div>
                                    <div className="flex items-center mb-1">
                                        <span className="font-semibold mr-2">Trần Minh C</span>
                                        <div className="flex text-yellow-500 text-sm">
                                            <i className="fa fa-star"></i>
                                            <i className="fa fa-star"></i>
                                            <i className="fa fa-star"></i>
                                            <i className="fa fa-star-half-alt"></i>
                                            <i className="fa fa-star text-gray-300"></i>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm">
                                        Cũng ổn, nhưng cần cải thiện phần hướng dẫn sử dụng.
                                    </p>
                                    <span className="text-xs text-gray-400">1 tuần trước</span>
                                </div>
                            </div>
                        )}

                        {tab === "api" && <p>API sẽ được cập nhật sau.</p>}
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="font-bold text-lg mb-4">Sản phẩm tương tự</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            {
                                name: "Chuyên bán Gmail New giá rẻ hàng ngâm lâu ngày",
                                img: "src/assets/1.png",
                                price: "2.000 đ",
                            },
                            {
                                name: "Mail Kháng 2024 Mail New Live Trâu",
                                img: "src/assets/2.png",
                                price: "8.979 đ - 19.979 đ",
                            },
                            {
                                name: "Gmail Việt, Ngoại Cổ 2006-2022",
                                img: "src/assets/3.png",
                                price: "19.000 đ - 57.000 đ",
                            },
                            {
                                name: "Sản phẩm Outlook Trusted Graph API",
                                img: "src/assets/4.png",
                                price: "280 đ - 350 đ",
                            },
                            {
                                name: "KÊNH YOUTUBE VIDEO CỔ 200X 201X",
                                img: "src/assets/5.png",
                                price: "60.000 đ - 140.000 đ",
                            },
                        ].map((p, i) => (
                            <div
                                key={i}
                                className="bg-white border rounded shadow-sm hover:shadow-lg p-2 text-center transform transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                            >
                                <img
                                    src={p.img}
                                    alt={p.name}
                                    className="h-40 w-full object-contain mb-2 transition-transform duration-300 hover:scale-110"
                                />
                                <div className="text-sm font-semibold line-clamp-2 mb-1">
                                    {p.name}
                                </div>
                                <div className="text-green-700 font-bold text-sm">{p.price}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        </>
=======
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
      </div>
>>>>>>> Stashed changes
    );

  if (error || !product)
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-red-500 text-lg font-medium">
          Lỗi: {error || "Không tìm thấy sản phẩm"}
        </p>
      </div>
    );

  return (
    <div className="container mx-auto max-w-[1024px] p-4 font-sans text-gray-800">
      
      <div className="flex flex-col md:flex-row bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition">
        
=======
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

  const currentPrice = selectedVariant?.price ?? product.fee ?? 0;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;

  const handleShopClick = () => {
    if (product.shop?.id) {
      navigate(`/shopDetails?id=${product.shop.id}`);
    }
  };

  const handleCategoryClick = () => {
    if (product.category?.id) {
      navigate(`/products?categoryId=${product.category.id}`);
    }
  };

  const handleRelatedProductClick = (id: number) => {
    navigate(`/productDetails?id=${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto max-w-[1024px] p-4 font-sans text-gray-800">
      <div className="flex flex-col md:flex-row bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition">
        {/* Ảnh */}
>>>>>>> Stashed changes
        <div className="md:w-1/2 flex justify-center mb-4 md:mb-0 relative">
          <img
            src={
              product.imageBase64
                ? `data:image/png;base64,${product.imageBase64}`
<<<<<<< Updated upstream
                : "/no-image.png"
=======
                : gmailImage
>>>>>>> Stashed changes
            }
            alt={product.name}
            className="rounded-2xl w-96 h-auto border"
          />
          <div className="absolute top-3 left-3 flex flex-col space-y-1 text-xs font-bold text-white">
<<<<<<< Updated upstream
            <span className="bg-green-600 px-2 py-1 rounded">HÀNG CHÍNH HÃNG</span>
=======
            <span className="bg-green-600 px-2 py-1 rounded">KHÔNG TRÙNG</span>
>>>>>>> Stashed changes
            <span className="bg-blue-600 px-2 py-1 rounded">KHO TAPHOAMMO</span>
          </div>
        </div>

<<<<<<< Updated upstream
        
        <div className="md:w-1/2 md:pl-6">
          <h2 className="text-2xl font-bold text-green-700 mb-2">{product.name}</h2>

          <div className="flex items-center mb-2">
            <div className="text-yellow-400 mr-2">
              {"★".repeat(Math.round(product.averageRating || 0))}
              {"☆".repeat(5 - Math.round(product.averageRating || 0))}
            </div>
            <span className="text-gray-500 text-sm">
              {product.ratingCount || 0} đánh giá
            </span>
          </div>
=======
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
>>>>>>> Stashed changes

          <p className="text-gray-700 mb-3 text-sm">
            {product.description || "Không có mô tả sản phẩm."}
          </p>

<<<<<<< Updated upstream
          <div className="text-green-700 font-bold text-2xl mb-4">
            {product.fee?.toLocaleString("vi-VN")} VND
          </div>

          {product.variants?.length > 0 && (
            <div className="border-t pt-3 mb-4">
              <div className="font-semibold mb-2 text-gray-700">CHỌN BIẾN THỂ</div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-2 py-1 rounded text-sm font-medium border transition ${
                      selectedVariant?.id === v.id
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
=======
          <div className="text-green-700 font-bold text-2xl mb-1">
            {currentPrice.toLocaleString("vi-VN")} VND
          </div>
          <div className="text-sm text-gray-500 mb-4">Kho: {currentStock}</div>

          {product.productVariants && product.productVariants.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">SẢN PHẨM</h4>
              <div className="flex flex-wrap gap-3">
                {product.productVariants.map((variant: any) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`border rounded-lg px-3 py-2 text-sm font-semibold transition ${isSelected
                        ? "border-green-600 bg-green-100 text-green-700"
                        : "border-gray-300 hover:border-green-400"
                        }`}
                    >
                      {variant.name}
                    </button>
                  );
                })}
>>>>>>> Stashed changes
              </div>
            </div>
          )}

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

            <input
              type="text"
              placeholder="NHẬP MÃ GIẢM GIÁ"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full text-sm focus:ring-1 focus:ring-green-600"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              disabled={!isLoggedIn}
<<<<<<< Updated upstream
              className={`flex-1 py-2 rounded font-semibold text-white transition ${
                isLoggedIn
                  ? "bg-[#7cc47f] hover:opacity-90"
                  : "bg-[#7cc47f]/60 cursor-not-allowed"
              }`}
=======
              className={`flex-1 py-2 rounded font-semibold text-white transition ${isLoggedIn
                ? "bg-[#7cc47f] hover:opacity-90"
                : "bg-[#7cc47f]/60 cursor-not-allowed"
                }`}
>>>>>>> Stashed changes
            >
              Mua hàng
            </button>

            <button
              disabled={!isLoggedIn}
<<<<<<< Updated upstream
              className={`flex-1 py-2 rounded font-semibold text-white transition ${
                isLoggedIn
                  ? "bg-[#2d8a34] hover:opacity-90"
                  : "bg-[#2d8a34]/60 cursor-not-allowed"
              }`}
=======
              className={`flex-1 py-2 rounded font-semibold text-white transition ${isLoggedIn
                ? "bg-[#2d8a34] hover:opacity-90"
                : "bg-[#2d8a34]/60 cursor-not-allowed"
                }`}
>>>>>>> Stashed changes
            >
              Đặt trước
            </button>

            <button
              disabled={!isLoggedIn}
<<<<<<< Updated upstream
              className={`flex-1 py-2 rounded font-semibold border-2 transition ${
                isLoggedIn
                  ? "border-[#2d8a34] text-[#2d8a34] hover:bg-[#e8f6e9]"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
=======
              className={`flex-1 py-2 rounded font-semibold border-2 transition ${isLoggedIn
                ? "border-[#2d8a34] text-[#2d8a34] hover:bg-[#e8f6e9]"
                : "border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
>>>>>>> Stashed changes
            >
              Nhắn tin
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl mt-6 shadow-md">
        <div className="flex border-b">
          {["mota", "reviews"].map((t) => (
            <button
              key={t}
<<<<<<< Updated upstream
              className={`flex-1 py-2 text-center font-semibold ${
                tab === t
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600"
              }`}
=======
              className={`flex-1 py-2 text-center font-semibold ${tab === t
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-600"
                }`}
>>>>>>> Stashed changes
              onClick={() => setTab(t)}
            >
              {t === "mota" ? "Mô tả" : "Đánh giá"}
            </button>
          ))}
        </div>

        <div className="p-4">
<<<<<<< Updated upstream
          {tab === "mota" && (
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {product.details || "Chưa có thông tin chi tiết cho sản phẩm này."}
            </div>
          )}
          {tab === "reviews" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Đánh giá sản phẩm</h3>
              {product.feedbacks?.length > 0 ? (
                product.feedbacks.map((fb: any) => (
                  <div key={fb.id} className="border-b pb-3">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold mr-2 text-gray-800">
                        Người dùng #{fb.accountId || "Ẩn danh"}
                      </span>
                      <span className="text-yellow-500 text-sm">
                        {"★".repeat(fb.rating)}{" "}
                        {"☆".repeat(5 - fb.rating)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{fb.comment}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(fb.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  Chưa có đánh giá nào cho sản phẩm này.
                </p>
              )}
            </div>
=======
          {tab === "mota" ? (
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {product.details || "Chưa có thông tin chi tiết cho sản phẩm này."}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              Chưa có đánh giá nào cho sản phẩm này.
            </p>
>>>>>>> Stashed changes
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <h4 className="font-bold text-lg mb-4">Sản phẩm tương tự</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {relatedProducts.map((p: any) => (
              <div
                key={p.id}
<<<<<<< Updated upstream
                className="bg-white border rounded-lg shadow-sm hover:shadow-lg p-2 text-center transform transition hover:-translate-y-1 hover:scale-[1.02]"
=======
                onClick={() => handleRelatedProductClick(p.id)}
                className="bg-white border rounded-lg shadow-sm hover:shadow-lg p-2 text-center transform transition hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                <div className="text-sm font-semibold mb-1 line-clamp-2">
                  {p.name}
                </div>
=======
                <div className="text-sm font-semibold mb-1 line-clamp-2">{p.name}</div>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
}

export default ProductDetails;
=======
}
>>>>>>> Stashed changes
