interface ProfileStatsProps {
  ordersLoading: boolean;
  stats: {
    totalOrders: number;
    successfulOrders: number;
    totalSpent: number;
  };
}

const ProfileStats = ({ ordersLoading, stats }: ProfileStatsProps) => {
  return (
    <div className="mt-8 pt-8 border-t">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Thống kê tài khoản
      </h3>
      {ordersLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalOrders}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Đơn hàng thành công</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.successfulOrders}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Tổng chi tiêu</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalSpent.toLocaleString("vi-VN")} VNĐ
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileStats;
