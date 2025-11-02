import type { FC } from "react";
import type { ShopForAdmin } from "@services/ShopServices.ts";
import Button from "@components/Button/Button.tsx";
import { getStatusColor, getStatusText } from "@/helpers";

interface ShopTableProps {
  shops: ShopForAdmin[];
  isSearching: boolean;
  onViewShop: (shop: ShopForAdmin) => void;
  onApproveShop: (shop: ShopForAdmin) => void;
  onBanShop: (shop: ShopForAdmin) => void;
  isApproving: boolean;
  isBanning: boolean;
}

const ShopTable: FC<ShopTableProps> = ({
  shops,
  isSearching,
  onViewShop,
  onApproveShop,
  onBanShop,
  isApproving,
  isBanning,
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên shop
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chủ shop
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khiếu nại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shops.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-3"></div>
                      Đang tìm kiếm...
                    </div>
                  ) : (
                    "Không tìm thấy shop nào"
                  )}
                </td>
              </tr>
            ) : (
              shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {shop.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {shop.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shop.ownerUsername || "Chưa có"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shop.productCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shop.complaintCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        shop.status
                      )}`}
                    >
                      {getStatusText(shop.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(shop.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* View Button */}
                      <Button
                        onClick={() => onViewShop(shop)}
                        leftIcon={
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        }
                        className="text-blue-600 hover:text-blue-900 bg-transparent border-0 p-0"
                      >
                        Xem
                      </Button>

                      {/* Approve Button (for PENDING status) */}
                      {shop.status === "PENDING" && (
                        <Button
                          onClick={() => onApproveShop(shop)}
                          disabled={isApproving}
                          leftIcon={
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          }
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 bg-transparent border-0 p-0"
                        >
                          {isApproving ? "Đang duyệt..." : "Duyệt"}
                        </Button>
                      )}

                      {/* Ban Button (for APPROVED status) */}
                      {shop.status === "APPROVED" && (
                        <Button
                          onClick={() => onBanShop(shop)}
                          disabled={isBanning}
                          leftIcon={
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
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                              />
                            </svg>
                          }
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 bg-transparent border-0 p-0"
                        >
                          {isBanning ? "Đang ban..." : "Ban"}
                        </Button>
                      )}

                      {/* Unban Button (for BANNED status) */}
                      {shop.status === "BANNED" && (
                        <Button
                          onClick={() => onApproveShop(shop)}
                          disabled={isApproving}
                          leftIcon={
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          }
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 bg-transparent border-0 p-0"
                        >
                          {isApproving ? "Đang gỡ ban..." : "Gỡ ban"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShopTable;
