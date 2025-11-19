import type { FC, ReactNode } from "react";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faShoppingBag,
  faBox,
  faStore,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import routesConfig from "@config/routesConfig.ts";
import Button from "@components/Button/Button";

interface SellerLayoutProps {
  children?: ReactNode;
}

const SellerLayout: FC<SellerLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Determine active tab based on current route
  const getActiveTab = (pathname: string) => {
    if (pathname.includes("/seller/dashboard")) return "dashboard";
    if (pathname.includes("/seller/products")) return "products";
    if (pathname.includes("/seller/orders")) return "orders";
    if (pathname.includes("/seller/shop")) return "shop";
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(() => getActiveTab(location.pathname));

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getActiveTab(location.pathname));
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate(routesConfig.home);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "dashboard":
        navigate("/seller/dashboard");
        break;
      case "products":
        navigate("/seller/products");
        break;
      case "orders":
        navigate("/seller/orders");
        break;
      case "shop":
        navigate("/seller/shop");
        break;
      default:
        navigate("/seller/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="border-b border-gray-700 p-4">
            <h2 className="text-xl font-bold text-white">Seller Panel</h2>
            {user && (
              <p className="mt-1 text-sm text-gray-300">{user.email}</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              <Button
                onClick={() => handleTabChange("dashboard")}
                className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                leftIcon={<FontAwesomeIcon icon={faChartBar} className="w-5" />}
              >
                Dashboard
              </Button>

              <Button
                onClick={() => handleTabChange("products")}
                className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  activeTab === "products"
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                leftIcon={<FontAwesomeIcon icon={faBox} className="w-5" />}
              >
                Quản lý sản phẩm
              </Button>

              <Button
                onClick={() => handleTabChange("orders")}
                className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  activeTab === "orders"
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                leftIcon={<FontAwesomeIcon icon={faShoppingBag} className="w-5" />}
              >
                Quản lý đơn hàng
              </Button>

              <Button
                onClick={() => handleTabChange("shop")}
                className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  activeTab === "shop"
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                leftIcon={<FontAwesomeIcon icon={faStore} className="w-5" />}
              >
                Thông tin shop
              </Button>
            </div>
          </nav>

          {/* Back to Homepage Button */}
          <div className="border-t border-gray-700 p-4">
            <Button
              to={routesConfig.home}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-700 px-4 py-3 text-white transition-colors hover:bg-gray-600"
              leftIcon={<FontAwesomeIcon icon={faArrowLeft} className="w-4" />}
            >
              Về trang chủ
            </Button>
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-700 p-4">
            <Button
              onClick={handleLogout}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default SellerLayout;

