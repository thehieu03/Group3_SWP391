import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ thêm useNavigate
import axios from "axios";
import Image from "../../../components/Image";
import routesConfig from "../../../config/routesConfig"; // ✅ để dùng đường dẫn chuẩn

const SubCategoryProducts: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // ✅ hook điều hướng

  const [products, setProducts] = useState<any[]>([]);
  const [subCategoryName, setSubCategoryName] = useState<string>("Danh mục");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 20;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        // ✅ Lấy danh sách sản phẩm theo Subcategory
        const res = await axios.get(
          `/api/products/by-subcategory?subcategoryId=${id}&page=${page}&pageSize=${pageSize}&sort=${sortOrder}`
        );

        const data = res.data;
        if (data && Array.isArray(data)) {
          setProducts(data);
          setTotalCount(data.length);
        } else if (data && data.items) {
          setProducts(data.items);
          setTotalCount(data.totalCount || 0);
        } else {
          setProducts([]);
          setTotalCount(0);
        }

        // ✅ Lấy tên subcategory
        try {
          const subRes = await axios.get(`/api/subcategories/${id}`);
          if (subRes?.data?.name) setSubCategoryName(subRes.data.name);
        } catch {
          setSubCategoryName("Danh mục");
        }
      } catch (err) {
        console.error("❌ Error fetching subcategory data:", err);
        setError("Không thể tải dữ liệu sản phẩm từ subcategory này");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, page, sortOrder]);

  const handleSort = (order: string) => {
    setSortOrder(order);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Hàm click sản phẩm → sang ProductDetails
  const handleProductClick = (productId: number) => {
    // dùng đường dẫn chuẩn từ routesConfig
    navigate(routesConfig.getProductDetailsUrl(productId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-600 text-lg">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* --- Tiêu đề và tổng số --- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-700 mb-1">
              {subCategoryName}
            </h1>
            <p className="text-gray-600">
              Tổng{" "}
              <span className="text-green-700 font-semibold">
                {totalCount || products.length}
              </span>{" "}
              sản phẩm
            </p>
          </div>

          <div className="flex items-center gap-3 mt-3 md:mt-0">
            <button
              onClick={() => handleSort("asc")}
              className={`px-3 py-1 rounded-md border ${
                sortOrder === "asc"
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Giá tăng dần
            </button>
            <button
              onClick={() => handleSort("desc")}
              className={`px-3 py-1 rounded-md border ${
                sortOrder === "desc"
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Giá giảm dần
            </button>
          </div>
        </div>

        {/* --- Danh sách sản phẩm --- */}
        {products.length === 0 ? (
          <div className="text-center text-gray-600 py-10">
            Chưa có sản phẩm nào trong danh mục này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => handleProductClick(p.id)} // ✅ Thêm sự kiện click
                className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 transition overflow-hidden cursor-pointer flex flex-col"
              >
                {/* --- Ảnh sản phẩm --- */}
                <div className="aspect-square rounded-t-lg overflow-hidden bg-gray-100">
                  <Image
                    src={
                      p.imageBase64
                        ? `data:image/png;base64,${p.imageBase64}`
                        : "/no-image.png" // ✅ fallback “No Image”
                    }
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* --- Thông tin sản phẩm --- */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {p.description || "Không có mô tả chi tiết"}
                  </p>

                  <div className="mt-auto">
                    <div className="text-green-700 font-bold text-sm">
                      {p.fee?.toLocaleString("vi-VN")} đ
                    </div>
                    <span
                      className={`inline-block mt-1 px-2 py-[2px] text-xs font-semibold rounded-full ${
                        p.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.isActive ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Phân trang --- */}
        {totalCount > pageSize && (
          <div className="flex justify-center items-center mt-8 gap-2">
            {Array.from(
              { length: Math.ceil(totalCount / pageSize) },
              (_, i) => i + 1
            ).map((num) => (
              <button
                key={num}
                onClick={() => handlePageChange(num)}
                className={`px-3 py-1 border rounded ${
                  num === page
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCategoryProducts;
