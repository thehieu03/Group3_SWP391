import React, { useEffect, useState } from "react";
import { useAuth } from "@hooks/useAuth";
import { shopServices, type Shop, type UpdateShopRequest } from "@services/ShopServices";
import Button from "@components/Button/Button";

const SellerShop: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchShop = async () => {
      if (!isLoggedIn || !user) {
        setError("Bạn cần đăng nhập để xem thông tin shop");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Sử dụng endpoint my-shop thay vì getAllShopsAsync (yêu cầu ADMIN)
        const myShop = await shopServices.getMyShopAsync();

        if (!myShop) {
          setError("Bạn chưa có shop. Vui lòng đăng ký shop trước.");
          setLoading(false);
          return;
        }

        setShop(myShop);
        setName(myShop.name);
        setDescription(myShop.description || "");
      } catch (err: any) {
        console.error("Error fetching shop:", err);
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải thông tin shop";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [isLoggedIn, user]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (shop) {
      setName(shop.name);
      setDescription(shop.description || "");
    }
  };

  const handleSave = async () => {
    if (!shop) return;

    if (!name.trim()) {
      setError("Tên shop không được để trống");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData: UpdateShopRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
      };

      const updatedShop = await shopServices.updateMyShopAsync(updateData);
      setShop(updatedShop);
      setEditing(false);
      setError(null);
    } catch (err: any) {
      console.error("Error updating shop:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật shop";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? "Hoạt động" : "Không hoạt động";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin shop...</p>
        </div>
      </div>
    );
  }

  if (error && !shop) {
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

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bạn chưa có shop</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Thông tin shop
            </h2>
            {!editing && (
              <Button
                onClick={handleEdit}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Chỉnh sửa
              </Button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Shop Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái shop
              </label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  shop.isActive
                )}`}
              >
                {getStatusLabel(shop.isActive)}
              </span>
              <p className="text-xs text-gray-500 mt-1 italic">
                (Chỉ admin mới có thể thay đổi trạng thái)
              </p>
            </div>

            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên shop
              </label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{shop.name}</p>
              )}
            </div>

            {/* Shop Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả shop
              </label>
              {editing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {shop.description || "Chưa có mô tả"}
                </p>
              )}
            </div>

            {/* Shop Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Số sản phẩm</div>
                <div className="text-2xl font-bold text-blue-800">
                  {shop.productCount || 0}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 mb-1">
                  Số khiếu nại
                </div>
                <div className="text-2xl font-bold text-orange-800">
                  {shop.complaintCount || 0}
                </div>
              </div>
            </div>

            {/* Shop Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày tạo
                </label>
                <p className="text-gray-600">
                  {new Date(shop.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày cập nhật
                </label>
                <p className="text-gray-600">
                  {shop.updatedAt
                    ? new Date(shop.updatedAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Chưa cập nhật"}
                </p>
              </div>
            </div>

            {/* Edit Actions */}
            {editing && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className={`px-4 py-2 rounded-md text-white ${
                    saving || !name.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={saving}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                  Hủy
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerShop;

