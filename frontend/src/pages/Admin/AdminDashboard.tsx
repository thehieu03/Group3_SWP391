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
      } catch (err) {
        setError("Không thể tải dữ liệu dashboard");
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LatestShop":
        return <FontAwesomeIcon icon={faStore} className="text-lg" />;
      case "LatestTransaction":
        return <FontAwesomeIcon icon={faMoneyBillWave} className="text-lg" />;
      case "LatestSupportTicket":
        return <FontAwesomeIcon icon={faHeadset} className="text-lg" />;
      case "NewOrder":
        return <FontAwesomeIcon icon={faBox} className="text-lg" />;
      case "TodayRevenue":
        return <FontAwesomeIcon icon={faChartBar} className="text-lg" />;
      default:
        return <FontAwesomeIcon icon={faBell} className="text-lg" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "LatestShop":
        return "bg-green-400";
      case "LatestTransaction":
        return "bg-blue-400";
      case "LatestSupportTicket":
        return "bg-yellow-400";
      case "NewOrder":
        return "bg-purple-400";
      case "TodayRevenue":
        return "bg-indigo-400";
      default:
        return "bg-gray-400";
    }
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
            onClick={() => window.location.reload()}
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
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
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
              {dashboardData.notifications.map((notification, index) => (
                <div key={index} className="flex items-center space-x-3">
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
                      {getNotificationIcon(notification.type)}
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
                  (n) => n.type === "TodayRevenue" || n.type === "NewOrder"
                )
                .map((notification, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600">
                      {notification.type === "TodayRevenue"
                        ? "Doanh thu hôm nay"
                        : "Đơn hàng mới"}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        notification.type === "TodayRevenue"
                          ? "text-blue-600"
                          : "text-purple-600"
                      }`}
                    >
                      {notification.type === "TodayRevenue"
                        ? formatPrice(notification.count)
                        : notification.count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
