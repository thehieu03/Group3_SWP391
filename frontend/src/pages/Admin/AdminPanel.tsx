import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUsers,
  faStore,
  faFolder,
  faMoneyBillWave,
  faHeadset,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import AdminDashboard from "./AdminDashboard";
import UserManagement from "./UserManagement/UserManagement.tsx";
import ShopManagement from "./ShopManagement/ShopManagement.tsx";
import CategoryManagement from "./CategoryManagement";
import AdminOrderManagement from "./AdminOrderManagement";
import SystemSettings from "./SystemSettings";
import SupportTickets from "./SupportTickets";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <UserManagement />;
      case "shops":
        return <ShopManagement />;
      case "categories":
        return <CategoryManagement />;
      case "transactions":
        return <AdminOrderManagement />;
      case "support":
        return <SupportTickets />;
      case "settings":
        return <SystemSettings />;
      default:
        return <AdminDashboard />;
    }
  };

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
                Xin chào, <span className="font-medium">Admin</span>
              </span>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
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
              {[
                {
                  id: "dashboard",
                  label: "Dashboard",
                  icon: (
                    <FontAwesomeIcon icon={faChartBar} className="text-lg" />
                  ),
                },
                {
                  id: "users",
                  label: "Quản lý người dùng",
                  icon: <FontAwesomeIcon icon={faUsers} className="text-lg" />,
                },
                {
                  id: "shops",
                  label: "Quản lý shop",
                  icon: <FontAwesomeIcon icon={faStore} className="text-lg" />,
                },
                {
                  id: "categories",
                  label: "Quản lý danh mục",
                  icon: <FontAwesomeIcon icon={faFolder} className="text-lg" />,
                },
                {
                  id: "transactions",
                  label: "Lịch sử giao dịch",
                  icon: (
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="text-lg"
                    />
                  ),
                },
                {
                  id: "support",
                  label: "Hỗ trợ khách hàng",
                  icon: (
                    <FontAwesomeIcon icon={faHeadset} className="text-lg" />
                  ),
                },
                {
                  id: "settings",
                  label: "Cài đặt hệ thống",
                  icon: <FontAwesomeIcon icon={faCog} className="text-lg" />,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
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
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
