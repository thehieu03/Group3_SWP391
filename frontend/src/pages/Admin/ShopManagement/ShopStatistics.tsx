import type { FC } from "react";

interface ShopStatisticsProps {
  totalShops: number;
  pendingShops: number;
  approvedShops: number;
  bannedShops: number;
}

const ShopStatistics: FC<ShopStatisticsProps> = ({
  totalShops,
  pendingShops,
  approvedShops,
  bannedShops,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Shops */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Tổng shop</p>
            <p className="text-2xl font-semibold text-gray-900">{totalShops}</p>
          </div>
        </div>
      </div>

      {/* Pending Shops */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Chờ duyệt</p>
            <p className="text-2xl font-semibold text-gray-900">
              {pendingShops}
            </p>
          </div>
        </div>
      </div>

      {/* Approved Shops */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
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
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Đã duyệt</p>
            <p className="text-2xl font-semibold text-gray-900">
              {approvedShops}
            </p>
          </div>
        </div>
      </div>

      {/* Banned Shops */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600"
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
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Đã ban</p>
            <p className="text-2xl font-semibold text-gray-900">
              {bannedShops}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopStatistics;
