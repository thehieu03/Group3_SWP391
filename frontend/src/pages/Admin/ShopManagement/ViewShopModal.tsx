import { type FC } from "react";
import type { ShopForAdmin } from "@services/ShopServices.ts";
import Button from "@components/Button/Button.tsx";
import { formatDate } from "@/helpers";
import Image from "@/components/Image";

interface ViewShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: ShopForAdmin | null;
}

const ViewShopModal: FC<ViewShopModalProps> = ({ isOpen, onClose, shop }) => {
  if (!isOpen || !shop) return null;

  const resolveImageSrc = (input?: string | null): string => {
    if (!input) return "";
    const trimmed = input.trim();
    if (trimmed.startsWith("data:")) return trimmed;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
      return trimmed;
    // treat as base64 without prefix
    return `data:image/jpeg;base64,${trimmed}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Thông tin chi tiết shop
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
                  ID Shop
                </label>
                <p className="mt-1 text-sm text-gray-900">{shop.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên shop
                </label>
                <p className="mt-1 text-sm text-gray-900">{shop.name}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <p className="mt-1 text-sm text-gray-900">{shop.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Chủ shop
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {shop.ownerUsername || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số sản phẩm
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {shop.productCount}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số khiếu nại
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {shop.complaintCount || 0}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái shop
                </label>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    shop.status === "APPROVED"
                      ? "text-green-600"
                      : shop.status === "BANNED"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {shop.status === "APPROVED"
                    ? "Đã duyệt"
                    : shop.status === "BANNED"
                    ? "Đã khóa"
                    : "Chờ duyệt"}
                </p>
              </div>
            </div>
          </div>

          {/* Giấy tờ xác minh */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Giấy tờ xác minh
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mặt trước (Front)
                </label>
                <div className="w-full max-w-sm border rounded-md p-2 bg-white">
                  <Image
                    src={resolveImageSrc(
                      shop.identificationF as unknown as string
                    )}
                    alt="Identification Front"
                    className="w-full h-56 object-contain"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mặt sau (Back)
                </label>
                <div className="w-full max-w-sm border rounded-md p-2 bg-white">
                  <Image
                    src={resolveImageSrc(
                      shop.identificationB as unknown as string
                    )}
                    alt="Identification Back"
                    className="w-full h-56 object-contain"
                  />
                </div>
              </div>
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
                  Ngày tạo shop
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(shop.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cập nhật lần cuối
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(shop.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

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

export default ViewShopModal;
