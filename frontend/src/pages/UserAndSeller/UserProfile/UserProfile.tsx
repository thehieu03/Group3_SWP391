import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import routesConfig from "@config/routesConfig.ts";
import { orderServices } from "@services/OrderServices.ts";
import { userServices } from "@services/UserServices.ts";
import type { OrderResponse } from "../../../models/modelResponse/OrderResponse";
import Image from "../../../components/Image";
import Button from "../../../components/Button/Button.tsx";

const UserProfile: React.FC = () => {
  const { user, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate(routesConfig.login);
    }
  }, [isLoggedIn, loading, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (isLoggedIn) {
        try {
          setOrdersLoading(true);
          const userOrders = await orderServices.getMyOrdersAsync();
          setOrders(userOrders);
        } catch {
          setOrders([]);
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    fetchOrders();
  }, [isLoggedIn]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setSaveMessage({
          type: "error",
          text: "Vui lòng chọn file ảnh hợp lệ",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setSaveMessage({
          type: "error",
          text: "Kích thước file không được vượt quá 5MB",
        });
        return;
      }

      setAvatarFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      if (avatarFile) {
        try {
          await userServices.uploadAvatarAsync(avatarFile);
        } catch {
          setSaveMessage({
            type: "error",
            text: "Có lỗi khi upload avatar. Vui lòng thử lại.",
          });
          return;
        }
      }

      const updateData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
      };

      await userServices.updateProfileAsync(updateData);

      setFormData({
        username: updateData.username || formData.username,
        email: updateData.email || formData.email,
        phone: updateData.phone || formData.phone,
      });

      setSaveMessage({
        type: "success",
        text: "Cập nhật thông tin thành công!",
      });

      setAvatarFile(null);
      setIsEditing(false);

      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch {
      setSaveMessage({
        type: "error",
        text: "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    setAvatar(null);
    setAvatarFile(null);
    setIsEditing(false);
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const successfulOrders = orders.filter(
      (order) => order.status === "completed" || order.status === "success"
    ).length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    return {
      totalOrders,
      successfulOrders,
      totalSpent,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Thông tin cá nhân
            </h1>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Chỉnh sửa
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {formData.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-2 cursor-pointer hover:bg-green-600 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {formData.username || "Chưa có tên"}
                </h2>
                <p className="text-gray-600">
                  {formData.email || "Chưa có email"}
                </p>
                {isEditing && (
                  <p className="text-sm text-gray-500 mt-1">
                    Nhấn vào icon + để thay đổi avatar
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập tên đăng nhập"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {formData.username || "Chưa có thông tin"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập email"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {formData.email || "Chưa có thông tin"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {formData.phone || "Chưa có thông tin"}
                  </p>
                )}
              </div>
            </div>

            {saveMessage && (
              <div
                className={`p-4 rounded-md ${
                  saveMessage.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {saveMessage.text}
              </div>
            )}

            {isEditing && (
              <div className="flex space-x-4 pt-6 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`font-medium py-2 px-6 rounded-md transition-colors duration-200 ${
                    isSaving
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Hủy
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thống kê tài khoản
            </h3>
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Đơn hàng thành công</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.successfulOrders}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalSpent.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
