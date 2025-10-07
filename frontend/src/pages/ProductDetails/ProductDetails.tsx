import { useState } from "react";

const ProductDetails = () => {
    const [tab, setTab] = useState("mota");
    const [selectedProduct, setSelectedProduct] = useState(
        "GMAIL US 200X > 2016 CÓ THỂ LÀM FULL DỊCH VỤ CỦA GOOGLE"
    );


    return (

        <><div className="body flex items-center justify-center min-h-screen bg-white">
            <div className="container mx-auto p-4 font-sans text-gray-800">

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
    );
};

export default ProductDetails;