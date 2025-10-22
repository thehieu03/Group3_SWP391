import { useState } from "react";
import type { UserForAdmin, UpdateAccountRequest } from "@/models";
import Button from "@components/Button/Button.tsx";

interface EditUserModalProps {
  user: UserForAdmin;
  onSave: (data: UpdateAccountRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditUserModal = ({
  user,
  onSave,
  onCancel,
  isLoading,
}: EditUserModalProps) => {
  const [formData, setFormData] = useState<UpdateAccountRequest>({
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    balance: user.balance,
    isActive: user.isActive,
    createdAt: user.createdAt,
    roles: [...user.roles],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure roles array is not empty
    if (formData.roles.length === 0) {
      alert("Vui lòng chọn ít nhất một vai trò");
      return;
    }

    console.log("Form data before submit:", formData);
    onSave(formData);
  };

  const handleRoleToggle = (role: string) => {
    console.log("Toggling role:", role);
    console.log("Current roles before toggle:", formData.roles);

    setFormData((prev) => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];

      console.log("New roles after toggle:", newRoles);
      return {
        ...prev,
        roles: newRoles,
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa người dùng</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số dư (VNĐ)
            </label>
            <input
              type="number"
              value={formData.balance}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  balance: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <div className="space-y-2">
              {["ADMIN", "SELLER", "CUSTOMER"].map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {role === "ADMIN"
                      ? "Quản trị viên"
                      : role === "SELLER"
                      ? "Người bán"
                      : "Khách hàng"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="mr-2"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              Tài khoản hoạt động
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
