import type { UserForAdmin } from "@/models";
import Button from "@components/Button/Button.tsx";

interface DeleteUserModalProps {
  user: UserForAdmin;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteUserModal = ({
  user,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteUserModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4 text-red-600">Xác nhận xóa</h2>

        <p className="text-gray-700 mb-6">
          Bạn có chắc chắn muốn xóa người dùng <strong>{user.username}</strong>{" "}
          không?
          <br />
          <span className="text-sm text-gray-500">Email: {user.email}</span>
        </p>

        <div className="flex justify-end space-x-3">
          <Button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
