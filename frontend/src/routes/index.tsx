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
import OrderUser from "../pages/UserAndSeller/OrderUser/OrderUser.tsx";
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
    requiredRoles: ["USER", "SELLER", "ADMIN"],
  },

  {
    path: routesConfig.infoAccount,
    element: <UserProfile />,
    layout: DefaultLayout,
    requiredRoles: ["USER", "SELLER", "ADMIN"],
  },
  {
    path: routesConfig.userOrder,
    element: <OrderUser />,
    layout: DefaultLayout,
    requiredRoles: ["CUSTOMER", "SELLER", "ADMIN"],
  },
];

const sellerRoutes: AppRoute[] = [
  {
    path: "/seller/dashboard",
    element: <div>Seller Dashboard - Quản lý shop</div>,
    layout: DefaultLayout,
    requiredRoles: ["SELLER"],
  },
  {
    path: "/seller/products",
    element: <div>Quản lý sản phẩm</div>,
    layout: DefaultLayout,
    requiredRoles: ["SELLER"],
  },
  {
    path: "/seller/orders",
    element: <div>Quản lý đơn hàng</div>,
    layout: DefaultLayout,
    requiredRoles: ["SELLER"],
  },
];

const adminRoutes: AppRoute[] = [
  {
    path: "/admin/dashboard",
    element: <AdminPanel />,
    layout: DefaultLayout,
    requiredRoles: ["ADMIN"],
  },

];
export const hasRequiredRole = (
  user: User | null,
  requiredRoles?: string[]
): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (!user || !user.roles || user.roles.length === 0) {
    return false;
  }

  return requiredRoles.some((role) => user.roles.includes(role));
};

export const getAccessibleRoutes = (user: User | null): AppRoute[] => {
  const allRoutes = [
    ...publicRoutes,
    ...privateRoutes,
    ...sellerRoutes,
    ...adminRoutes,
  ];

  return allRoutes.filter((route) => {
    if (!route.requiredRoles) {
      return true;
    }

    return hasRequiredRole(user, route.requiredRoles);
  });
};

export { publicRoutes, privateRoutes, sellerRoutes, adminRoutes };
