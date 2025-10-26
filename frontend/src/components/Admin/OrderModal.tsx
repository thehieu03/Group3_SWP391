import type { OrderAdminResponse } from "@models/modelResponse/OrderAdminResponse";
import { formatDate, formatPrice } from "@/helpers";

interface OrderModalProps {
  isOpen: boolean;
  order: OrderAdminResponse | null;
  onClose: () => void;
}

const OrderModal = ({ isOpen, order, onClose }: OrderModalProps) => {
  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Chi tiết đơn hàng #{order.orderId}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Đóng</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shop
                </label>
                <p className="mt-1 text-sm text-gray-900">{order.shopName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số lượng
                </label>
                <p className="mt-1 text-sm text-gray-900">{order.quantity}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Người mua
                </label>
                <p className="mt-1 text-sm text-gray-900">{order.buyerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Người bán
                </label>
                <p className="mt-1 text-sm text-gray-900">{order.sellerName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tổng tiền
                </label>
                <p className="mt-1 text-sm text-gray-900 font-semibold">
                  {formatPrice(order.totalPrice)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày đặt hàng
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(order.orderDate)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
