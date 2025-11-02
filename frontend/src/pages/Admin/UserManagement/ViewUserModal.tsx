import React from "react";
import type { UserForAdmin } from "@/models/modelResponse/UserResponse";
import Button from "@components/Button/Button.tsx";
import {
  getRoleDisplayName,
  getActiveStatusTextColor,
  getActiveStatusText,
  formatCurrency,
  formatDate,
} from "@/helpers";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserForAdmin | null;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Thông tin chi tiết người dùng
          </h2>
          <Button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </Button>
        </div>

        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ID người dùng
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên đăng nhập
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.phone}</p>
              </div>
            </div>
          </div>

          {/* Thông tin tài chính */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin tài chính
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số dư tài khoản
                </label>
                <p className="mt-1 text-sm text-gray-900 font-semibold">
                  {formatCurrency(user.balance)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái tài khoản
                </label>
                <p
                  className={`mt-1 text-sm font-semibold ${getActiveStatusTextColor(
                    user.isActive
                  )}`}
                >
                  {getActiveStatusText(user.isActive)}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin vai trò */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Vai trò trong hệ thống
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {getRoleDisplayName(role)}
                </span>
              ))}
            </div>
          </div>

          {/* Thông tin thời gian */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin thời gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngày tạo tài khoản
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cập nhật lần cuối
                </label>
                <p className="mt-1 text-sm text-gray-900">Chưa có thông tin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nút đóng */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
