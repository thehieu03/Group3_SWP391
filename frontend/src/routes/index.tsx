import type { FC, ReactNode } from "react";
import Home from "../pages/UserAndSeller/Home/Home.tsx";
import DefaultLayout from "../components/Layouts/DefaultLayout/DefaultLayout.tsx";
import HeaderAndFooter from "../components/Layouts/HeaderAndFooter/HeaderAndFooter.tsx";
import ProductDetails from "../pages/UserAndSeller/ProductDetails/ProductDetails.tsx";
import CategoryProducts from "../pages/UserAndSeller/CategoryProducts/CategoryProducts.tsx";
import Deposit from "../pages/UserAndSeller/Deposit/Deposit.tsx";
import UserProfile from "../pages/UserAndSeller/UserProfile/UserProfile.tsx";
import Login from "../pages/UserAndSeller/Login/Login.tsx";
import Register from "../pages/UserAndSeller/Register/Register.tsx";
import AdminPanel from "../pages/Admin/AdminPanel.tsx";
import ProductApproval from "../pages/Admin/ProductApproval.tsx";
import SellerDashboard from "../pages/Seller/SellerDashboard.tsx";
import SellerProductManagement from "../pages/Seller/SellerProductManagement.tsx";
import SellerLayout from "../components/Layouts/SellerLayout/SellerLayout.tsx";
import routesConfig from "../config/routesConfig.tsx";
import type { User } from "../models/modelResponse/LoginResponse";
type AppRoute = {
  path: string;
  element: ReactNode;
  layout: FC<{ children?: ReactNode }>;
  requiredRoles?: string[];
};
const publicRoutes: AppRoute[] = [
  {
    path: routesConfig.home,
    element: <Home />,
    layout: DefaultLayout,
  },
  {
    path: routesConfig.login,
    element: <Login />,
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.registerShop,
    element: <Register />,
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.productDetails,
    element: <ProductDetails />,
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.categoryProducts + '/:id',
    element: <CategoryProducts />,
    layout: DefaultLayout,
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
    requiredRoles: ['BUYER', 'SELLER', 'ADMIN'],
  },
  {
    path: routesConfig.infoAccount,
    element: <UserProfile />,
    layout: DefaultLayout,
    requiredRoles: ['BUYER', 'SELLER', 'ADMIN'],
  },
];

const sellerRoutes: AppRoute[] = [
  {
    path: routesConfig.sellerDashboard,
    element: <SellerDashboard />,
    layout: SellerLayout,
    requiredRoles: ['SELLER'],
  },
  {
    path: routesConfig.sellerProducts,
    element: <SellerProductManagement />,
    layout: SellerLayout,
    requiredRoles: ['SELLER'],
  },
  {
    path: routesConfig.sellerOrders,
    element: <div style={{ padding: '24px' }}>Quản lý đơn hàng - Coming soon</div>,
    layout: SellerLayout,
    requiredRoles: ['SELLER'],
  },
  {
    path: routesConfig.sellerShopInfo,
    element: <div style={{ padding: '24px' }}>Thông tin shop - Coming soon</div>,
    layout: SellerLayout,
    requiredRoles: ['SELLER'],
  },
  {
    path: routesConfig.sellerStatistics,
    element: <div style={{ padding: '24px' }}>Thống kê - Coming soon</div>,
    layout: SellerLayout,
    requiredRoles: ['SELLER'],
  },
];

const adminRoutes: AppRoute[] = [
  {
    path: '/admin/dashboard',
    element: <AdminPanel />,
    layout: DefaultLayout,
    requiredRoles: ['ADMIN'],
  },
  {
    path: routesConfig.productApproval,
    element: <ProductApproval />,
    layout: DefaultLayout,
    requiredRoles: ['ADMIN'],
  },
];
export const hasRequiredRole = (user: User | null, requiredRoles?: string[]): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  
  if (!user || !user.roles || user.roles.length === 0) {
    return false;
  }
  
  return requiredRoles.some(role => user.roles.includes(role));
};

export const getAccessibleRoutes = (user: User | null): AppRoute[] => {
  const allRoutes = [...publicRoutes, ...privateRoutes, ...sellerRoutes, ...adminRoutes];
  
  return allRoutes.filter(route => {
    if (!route.requiredRoles) {
      return true;
    }
    
    return hasRequiredRole(user, route.requiredRoles);
  });
};

export { publicRoutes, privateRoutes, sellerRoutes, adminRoutes };
