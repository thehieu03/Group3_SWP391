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

    if (formData.roles.length === 0) {
      alert(
        "Người dùng này chưa có vai trò gì trong hệ thống. Vui lòng chọn ít nhất một vai trò (Người bán hoặc Khách hàng)"
      );
      return;
    }

    const validRoles = formData.roles.filter(
      (role) => role === "SELLER" || role === "CUSTOMER"
    );

    if (validRoles.length === 0) {
      alert("Chỉ có thể chọn vai trò Người bán hoặc Khách hàng");
      return;
    }

    onSave({
      ...formData,
      roles: formData.roles,
    });
  };

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];

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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <div className="space-y-2">
              {["SELLER", "CUSTOMER"].map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {role === "SELLER" ? "Người bán" : "Khách hàng"}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Có thể chọn cả Người bán và Khách hàng
            </p>
            {formData.roles.length === 0 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  ⚠️ Người dùng này chưa có vai trò gì trong hệ thống. Vui lòng
                  chọn ít nhất một vai trò.
                </p>
              </div>
            )}
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
              disabled={isLoading || formData.roles.length === 0}
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
