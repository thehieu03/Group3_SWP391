import type { FC, ReactNode } from "react";
import Home from "../pages/UserAndSeller/Home/Home.tsx";
import DefaultLayout from "../components/Layouts/DefaultLayout/DefaultLayout.tsx";
import HeaderAndFooter from "../components/Layouts/HeaderAndFooter/HeaderAndFooter.tsx";
import ProductDetails from "../pages/UserAndSeller/ProductDetails/ProductDetails.tsx";
import Deposit from "../pages/UserAndSeller/Deposit/Deposit.tsx";
import UserProfile from "../pages/UserAndSeller/UserProfile/UserProfile.tsx";
import AdminPanel from "../pages/Admin/AdminPanel.tsx";
import PaymentHistory from "../pages/UserAndSeller/PaymentHistory/PaymentHistory.tsx";
import routesConfig from "../config/routesConfig.tsx";
import type { User } from "../models/modelResponse/LoginResponse";
import Products from "../pages/Products/Products.tsx";
type AppRoute = {
  path: string;
  element: ReactNode;
  layout: FC<{ children?: ReactNode }>;
  requiredRoles?: string[]; // Thêm trường roles
};
const publicRoutes: AppRoute[] = [
  {
    path: routesConfig.home,
    element: <Home />,
    layout: DefaultLayout,
  },
  { path: "/category/:id", element: <Products />, layout: HeaderAndFooter },
  {
    path: routesConfig.productDetails,
    element: <ProductDetails />,
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.deposit,
    element: <Deposit />,
    layout: DefaultLayout,
  },
];
const privateRoutes: AppRoute[] = [
  {
    path: routesConfig.userProfile,
    element: <UserProfile />,
    layout: DefaultLayout,
    requiredRoles: ['CUSTOMER', 'SELLER', 'ADMIN'], // User và Seller có thể truy cập
  },
  {
    path: routesConfig.infoAccount,
    element: <UserProfile />,
    layout: DefaultLayout,
    requiredRoles: ['CUSTOMER', 'SELLER', 'ADMIN'],
  },
  {
    path: routesConfig.paymentHistory,
    element: <PaymentHistory />,
    layout: DefaultLayout,
    requiredRoles: ['CUSTOMER', 'SELLER', 'ADMIN'],
  },
];

// Seller routes - chỉ seller mới truy cập được
const sellerRoutes: AppRoute[] = [
  {
    path: '/seller/dashboard',
    element: <div>Seller Dashboard - Quản lý shop</div>, // Placeholder
    layout: DefaultLayout,
    requiredRoles: ['SELLER'],
  },
  {
    path: '/seller/products',
    element: <div>Quản lý sản phẩm</div>, // Placeholder
    layout: DefaultLayout,
    requiredRoles: ['SELLER'],
  },
  {
    path: '/seller/orders',
    element: <div>Quản lý đơn hàng</div>, // Placeholder
    layout: DefaultLayout,
    requiredRoles: ['SELLER'],
  },
];

// Admin routes - chỉ admin mới truy cập được
const adminRoutes: AppRoute[] = [
  {
    path: '/admin/dashboard',
    element: <AdminPanel />,
    layout: DefaultLayout,
    requiredRoles: ['ADMIN'],
  },
];
// Helper function để check quyền truy cập
export const hasRequiredRole = (user: User | null, requiredRoles?: string[]): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // Không yêu cầu role cụ thể
  }
  
  if (!user || !user.roles || user.roles.length === 0) {
    return false; // User không có role
  }
  
  // Kiểm tra xem user có ít nhất 1 role trong danh sách required không
  return requiredRoles.some(role => user.roles.includes(role));
};

// Helper function để lấy routes dựa trên role
export const getAccessibleRoutes = (user: User | null): AppRoute[] => {
  const allRoutes = [...publicRoutes, ...privateRoutes, ...sellerRoutes, ...adminRoutes];
  
  return allRoutes.filter(route => {
    if (!route.requiredRoles) {
      return true; // Public routes
    }
    
    return hasRequiredRole(user, route.requiredRoles);
  });
};

export { publicRoutes, privateRoutes, sellerRoutes, adminRoutes };
