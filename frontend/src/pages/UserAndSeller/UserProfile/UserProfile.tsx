import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import routesConfig from "@config/routesConfig.ts";
import { orderServices } from "@services/OrderServices.ts";
import { userServices } from "@services/UserServices.ts";
import { authServices } from "@services/AuthServices.ts";
import type { OrderUserResponse } from "@/models/modelResponse/OrderUserResponse";
import ProfileHeader from "./ProfileHeader.tsx";
import AvatarSection from "./AvatarSection.tsx";
import ProfileFormFields from "./ProfileFormFields.tsx";
import ProfileMessage from "./ProfileMessage.tsx";
import ProfileActions from "./ProfileActions.tsx";
import ProfileStats from "./ProfileStats.tsx";

const UserProfile: React.FC = () => {
  const { user, isLoggedIn, loading, login } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [orders, setOrders] = useState<OrderUserResponse[]>([]);
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
      // Debug avatar data when opening infoAccount
      console.log("UserProfile user:", user);
      console.log(
        "UserProfile avatar raw:",
        (
          user as unknown as {
            avatar?: unknown;
            avatarBase64?: unknown;
            image?: unknown;
          }
        )?.avatar ??
          (user as unknown as { avatarBase64?: unknown })?.avatarBase64 ??
          (user as unknown as { image?: unknown })?.image
      );
      const u = user as unknown as {
        avatar?: unknown;
        avatarBase64?: unknown;
        image?: unknown;
      };
      const raw = u?.avatar ?? u?.avatarBase64 ?? u?.image;
      if (!raw) {
        setAvatar(null);
      } else if (typeof raw === "string") {
        const s = raw.trim();
        const src =
          s.startsWith("data:") ||
          s.startsWith("http://") ||
          s.startsWith("https://")
            ? s
            : `data:image/jpeg;base64,${s}`;
        setAvatar(src);
      } else if (Array.isArray(raw)) {
        const bytes = new Uint8Array(raw as number[]);
        let binary = "";
        const chunk = 8192;
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode.apply(
            null,
            Array.from(bytes.subarray(i, i + chunk)) as unknown as number[]
          );
        }
        const b64 = btoa(binary);
        setAvatar(`data:image/jpeg;base64,${b64}`);
      } else {
        setAvatar(null);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (isLoggedIn) {
        try {
          setOrdersLoading(true);
          const userOrders = await orderServices.getOrdersUserAsync();
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

      const updateData = {
        username: formData.username,
        phone: formData.phone,
      };

      if (avatarFile) {
        try {
          await userServices.updateProfileWithAvatarAsync(
            updateData,
            avatarFile
          );
        } catch {
          setSaveMessage({
            type: "error",
            text: "Có lỗi khi cập nhật thông tin kèm avatar. Vui lòng thử lại.",
          });
          return;
        }
      } else {
        await userServices.updateProfileAsync(updateData);
      }

      // Refresh auth user so menus and other places get latest avatar
      try {
        const refreshed = await authServices.getCurrentUserAsync();
        login(refreshed);
      } catch {
        // ignore
      }

      setFormData({
        username: updateData.username || formData.username,
        email: formData.email,
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
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

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
          <ProfileHeader
            isEditing={isEditing}
            onEditClick={() => setIsEditing(true)}
          />

          <div className="space-y-6">
            <AvatarSection
              avatar={avatar}
              username={formData.username}
              email={formData.email}
              isEditing={isEditing}
              onAvatarChange={handleAvatarChange}
            />

            <ProfileFormFields
              formData={formData}
              isEditing={isEditing}
              onInputChange={handleInputChange}
            />

            <ProfileMessage message={saveMessage} />

            {isEditing && (
              <ProfileActions
                isSaving={isSaving}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )}
          </div>

          <ProfileStats ordersLoading={ordersLoading} stats={stats} />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
