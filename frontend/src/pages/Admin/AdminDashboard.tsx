import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faMoneyBillWave,
  faHeadset,
  faBox,
  faChartBar,
  faBell,
  faUsers,
  faShoppingCart,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { adminDashboardServices } from "@services/AdminDashboardServices";
import type { DashboardResponse } from "@models/modelResponse/DashboardResponse";
import {
  formatDate,
  formatPrice,
  getNotificationColor,
  getNotificationIcon,
} from "@/helpers";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminDashboardServices.getDashboardOverviewAsync();
        setDashboardData(data);
      } catch {
        setError("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  const getNotificationIconWrapper = (type: string) => {
    return getNotificationIcon(type, {
      faStore,
      faMoneyBillWave,
      faHeadset,
      faBox,
      faChartBar,
      faBell,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => globalThis.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Không có dữ liệu</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Người dùng hoạt động",
      value: dashboardData.totalActiveUsers,
      icon: <FontAwesomeIcon icon={faUsers} className="text-xl" />,
      color: "bg-blue-500",
    },
    {
      title: "Shop hoạt động",
      value: dashboardData.totalActiveShops,
      icon: <FontAwesomeIcon icon={faStore} className="text-xl" />,
      color: "bg-green-500",
    },
    {
      title: "Danh mục con",
      value: dashboardData.totalSubcategories,
      icon: <FontAwesomeIcon icon={faBox} className="text-xl" />,
      color: "bg-purple-500",
    },
    {
      title: "Giao dịch",
      value: dashboardData.totalTransactions,
      icon: <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />,
      color: "bg-yellow-500",
    },
    {
      title: "Hỗ trợ chờ xử lý",
      value: dashboardData.totalPendingSupportTickets,
      icon: (
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" />
      ),
      color: "bg-red-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Thông báo gần đây
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.notifications.map((notification) => (
                <div
                  key={`${notification.type}-${notification.createdAt}`}
                  className="flex items-center space-x-3"
                >
                  <div
                    className={`w-2 h-2 ${getNotificationColor(
                      notification.type
                    )} rounded-full`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-600">
                      {getNotificationIconWrapper(notification.type)}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {notification.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Thống kê nhanh
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.notifications
                .filter(
                  (n) =>
                    n.type === "TodayRevenue" ||
                    n.type === "NewOrder" ||
                    n.type === "SuccessfulTransactions"
                )
                .map((notification) => {
                  const getLabel = () => {
                    if (notification.type === "TodayRevenue") {
                      return "Doanh thu hôm nay";
                    }
                    if (notification.type === "NewOrder") {
                      return "Đơn hàng thành công hôm nay";
                    }
                    return "Giao dịch thành công hôm nay";
                  };

                  const getColorClass = () => {
                    if (notification.type === "TodayRevenue") {
                      return "text-blue-600";
                    }
                    if (notification.type === "NewOrder") {
                      return "text-purple-600";
                    }
                    return "text-green-600";
                  };

                  const getDisplayValue = () => {
                    if (notification.type === "TodayRevenue") {
                      return formatPrice(notification.count);
                    }
                    return notification.count;
                  };

                  return (
                    <div
                      key={`${notification.type}-${notification.createdAt}`}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600">
                        {getLabel()}
                      </span>
                      <span
                        className={`text-sm font-medium ${getColorClass()}`}
                      >
                        {getDisplayValue()}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
