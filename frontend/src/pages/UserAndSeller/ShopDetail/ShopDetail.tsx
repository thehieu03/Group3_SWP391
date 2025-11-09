import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shopServices, type Shop, type UpdateShopRequest } from "../../../services/ShopServices.tsx";
import "./ShopDetail.css";

const ShopDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<UpdateShopRequest>({
    name: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchShop = async () => {
      if (!id) {
        setError("Không tìm thấy ID shop");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const shopData = await shopServices.getShopByIdAsync(Number(id));
        setShop(shopData);
        setEditData({
          name: shopData.name,
          description: shopData.description || "",
          isActive: shopData.isActive,
        });
      } catch (err: any) {
        console.error("Error fetching shop:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Không thể tải thông tin shop";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void fetchShop();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (shop) {
      setEditData({
        name: shop.name,
        description: shop.description || "",
        isActive: shop.isActive,
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!id || !shop) return;

    // Validation
    if (!editData.name?.trim()) {
      setError("Tên shop không được để trống");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const updatedShop = await shopServices.updateShopAsync(
        Number(id),
        editData
      );
      setShop(updatedShop);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating shop:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể cập nhật thông tin shop";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setEditData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && !shop) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Không tìm thấy shop</p>
      </div>
    );
  }

  return (
    <div className="shop-detail-container">
      <div className="container mx-auto p-4 font-sans text-gray-800">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Thông tin shop
            </h1>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Chỉnh sửa
              </button>
            )}
          </div>

          {error && isEditing && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Shop
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-600">
                {shop.id}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              {isEditing ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editData.isActive ?? false}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {editData.isActive ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </div>
              ) : (
                <div
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    shop.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {shop.isActive ? "Hoạt động" : "Không hoạt động"}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên shop <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập tên shop"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 font-semibold">
                  {shop.name}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={editData.description || ""}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập mô tả shop"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-700 whitespace-pre-wrap">
                  {shop.description || "Chưa có mô tả"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chủ shop
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-600">
                {shop.ownerUsername || "Chưa có"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng sản phẩm
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-600">
                {shop.productCount || 0}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày tạo
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-600">
                {shop.createdAt
                  ? new Date(shop.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày cập nhật
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-600">
                {shop.updatedAt
                  ? new Date(shop.updatedAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editData.name?.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;

