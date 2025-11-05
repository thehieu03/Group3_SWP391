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
import { toAbsoluteImageUrl } from "@/utils/apiBase";

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

  // Helper function to get avatar URL from user object (backend now returns URL)
  const parseAvatarFromUser = React.useCallback((userData: typeof user) => {
    if (!userData) return null;
    const u = userData as unknown as {
      imageUrl?: unknown;
      avatarUrl?: unknown;
    };
    const raw = (u?.imageUrl ?? u?.avatarUrl) as string | undefined;
    if (!raw || typeof raw !== "string" || raw.trim() === "") return null;
    return toAbsoluteImageUrl(raw);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      // Parse avatar from user
      const parsedAvatar = parseAvatarFromUser(user);
      setAvatar(parsedAvatar);

      console.log("[UserProfile] initial user:", user);
      console.log("[UserProfile] initial avatar URL:", parsedAvatar);
    }
  }, [user, parseAvatarFromUser]);

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

      // Show a temporary preview for local selection
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
      let refreshedUser = null;
      try {
        // Add a small delay to ensure backend has processed the update
        await new Promise((resolve) => setTimeout(resolve, 500));

        refreshedUser = await authServices.getCurrentUserAsync();

        // Thử gọi API accounts/profile để xem có avatar không (nếu endpoint hỗ trợ GET)
        // Note: Endpoint này có thể không hỗ trợ GET method, sẽ bỏ qua nếu lỗi
        let profileAvatarData: string | null = null;
        try {
          const profileResponse = await userServices.getProfileAsync();

          // Kiểm tra tất cả các field có thể chứa avatar
          const profileObj = profileResponse as unknown as Record<
            string,
            unknown
          >;
          const avatarFields = ["imageUrl", "avatarUrl"];
          for (const field of avatarFields) {
            const value = profileObj[field];
            if (value && typeof value === "string" && value.trim() !== "") {
              profileAvatarData = value;
              break;
            }
          }
        } catch {
          // API accounts/profile có thể không hỗ trợ GET method (405 error)
          // Bỏ qua nếu lỗi
        }

        // If avatar was uploaded, retry getting user if avatar is not yet available
        if (avatarFile) {
          let retryCount = 0;
          while (retryCount < 3) {
            const parsedAvatar = parseAvatarFromUser(refreshedUser);
            if (parsedAvatar) {
              break; // Avatar is available
            }
            // Wait and retry
            await new Promise((resolve) => setTimeout(resolve, 500));
            refreshedUser = await authServices.getCurrentUserAsync();
            retryCount++;
          }
        }

        let finalParsedAvatar = parseAvatarFromUser(refreshedUser);

        // Nếu không có avatar từ auth/me nhưng có từ profile API, sử dụng profile API
        if (!finalParsedAvatar && profileAvatarData) {
          finalParsedAvatar = toAbsoluteImageUrl(profileAvatarData);
          refreshedUser = {
            ...(refreshedUser as object),
            imageUrl: profileAvatarData,
          } as typeof refreshedUser;
        }

        console.log("[UserProfile] refreshed user:", refreshedUser);
        console.log("[UserProfile] final avatar URL:", finalParsedAvatar);

        login(refreshedUser);
      } catch {
        // ignore
      }

      // Update form data
      setFormData({
        username: updateData.username || formData.username,
        email: formData.email,
        phone: updateData.phone || formData.phone,
      });

      // Always update avatar from refreshed user data if available
      // If avatar was uploaded but backend hasn't processed it yet, keep the preview
      if (refreshedUser) {
        const parsedAvatar = parseAvatarFromUser(refreshedUser);

        // Only update avatar if we got a valid one from backend, otherwise keep preview
        if (parsedAvatar) {
          setAvatar(parsedAvatar);
          // Clear avatarFile vì đã có từ backend
          setAvatarFile(null);
        } else if (avatarFile) {
          // If avatarFile exists and no avatar from backend, keep the preview (avatar state already set)
          // Avatar preview sẽ bị mất khi refresh page vì chỉ là base64 từ file local
        }
      }

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
