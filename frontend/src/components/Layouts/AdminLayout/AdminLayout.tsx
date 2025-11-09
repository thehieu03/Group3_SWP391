import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUsers,
  faStore,
  faBox,
  faMoneyBillWave,
  faHeadset,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";
import routesConfig from "@config/routesConfig.ts";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    logout();
    navigate(routesConfig.home);
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FontAwesomeIcon icon={faChartBar} className="text-lg" />,
      path: "/admin/dashboard",
    },
    {
      id: "users",
      label: "Quản lý người dùng",
      icon: <FontAwesomeIcon icon={faUsers} className="text-lg" />,
      path: "/admin/users",
    },
    {
      id: "shops",
      label: "Quản lý shop",
      icon: <FontAwesomeIcon icon={faStore} className="text-lg" />,
      path: "/admin/shops",
    },
    {
      id: "categories",
      label: "Quản lý danh mục",
      icon: <FontAwesomeIcon icon={faCog} className="text-lg" />,
      path: "/admin/categories",
    },
    {
      id: "products",
      label: "Quản lý sản phẩm",
      icon: <FontAwesomeIcon icon={faBox} className="text-lg" />,
      path: "/admin/products",
    },
    {
      id: "transactions",
      label: "Lịch sử giao dịch",
      icon: <FontAwesomeIcon icon={faMoneyBillWave} className="text-lg" />,
      path: "/admin/transactions",
    },
    {
      id: "support",
      label: "Hỗ trợ khách hàng",
      icon: <FontAwesomeIcon icon={faHeadset} className="text-lg" />,
      path: "/admin/support",
    },
    {
      id: "settings",
      label: "Cài đặt hệ thống",
      icon: <FontAwesomeIcon icon={faCog} className="text-lg" />,
      path: "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Xin chào, <span className="font-medium">{user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(item.path);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-green-100 text-green-700 border-r-2 border-green-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
