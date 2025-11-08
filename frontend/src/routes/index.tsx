import type { FC, ReactNode } from "react";
import Home from "@pages/UserAndSeller/Home/Home.tsx";
import DefaultLayout from "@components/Layouts/DefaultLayout/DefaultLayout.tsx";
import HeaderAndFooter from "@components/Layouts/HeaderAndFooter/HeaderAndFooter.tsx";
import AdminLayoutNoHeader from "@components/Layouts/AdminLayoutNoHeader.tsx";
import ProductDetails from "@pages/UserAndSeller/ProductDetails/ProductDetails.tsx";
import Products from "@pages/Products/Products.tsx";
import Deposit from "@pages/UserAndSeller/Deposit/Deposit.tsx";
import UserProfile from "@pages/UserAndSeller/UserProfile/UserProfile.tsx";
import AdminPanel from "@pages/Admin/AdminPanel.tsx";
import AdminProductManagement from "@pages/Admin/AdminProductManagement.tsx";
import routesConfig from "@config/routesConfig.ts";
import type { User } from "@models/modelResponse/LoginResponse";
import ChangePassword from "@pages/UserAndSeller/ChangePassword/ChangePassword.tsx";
import OrderUser from "@/pages/UserAndSeller/OrderUser/OrderUser";
import RegisterShop from "@pages/UserAndSeller/RegisterShop/RegisterShop.tsx";
import Share from "@pages/UserAndSeller/Share/Share.tsx";
import LoginValidator from "@pages/UserAndSeller/LoginValidator/LoginValidator.tsx";
import ForgotPassword from "@pages/UserAndSeller/ForgotPassword/ForgotPassword.tsx";
import SellerDashboard from "@pages/UserAndSeller/SellerDashboard/SellerDashboard.tsx";
import SellerProducts from "@pages/UserAndSeller/SellerProducts/SellerProducts.tsx";
import EditProductPage from "@pages/UserAndSeller/SellerProducts/EditProductPage.tsx";
import PaymentHistory from "@pages/UserAndSeller/PaymentHistory/PaymentHistory.tsx";
import SellerLayout from "@components/Layouts/SellerLayout/SellerLayout.tsx";
import SellerShop from "@pages/UserAndSeller/SellerShop/SellerShop.tsx";

/**
 * Định nghĩa cấu trúc route trong ứng dụng
 */
export type AppRoute = {
  path: string; // Đường dẫn URL
  element: ReactNode; // Component sẽ render
  layout: FC<{ children?: ReactNode }>; // Layout wrapper
  requiredRoles?: string[]; // Roles được phép truy cập (undefined = public)
};

// ============================================================================
// PUBLIC ROUTES - Tất cả người dùng đều truy cập được (không cần đăng nhập)
// ============================================================================
const publicRoutes: AppRoute[] = [
  {
    path: routesConfig.home,
    element: <Home />,
    layout: DefaultLayout,
  },
  {
    path: routesConfig.productDetails + "/:id",
    element: <ProductDetails />,
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.categoryProducts + "/:id",
    element: <Products />,
    layout: DefaultLayout,
  },
  {
    path: routesConfig.deposit,
    element: <Deposit />,
    layout: DefaultLayout,
  },
  {
    path: routesConfig.registerShop,
    element: <RegisterShop />,
    layout: DefaultLayout,
  },
  {
    path: routesConfig.loginValidator,
    element: <LoginValidator />,
    layout: DefaultLayout,
  },
  {
    path: routesConfig.forgotPassword,
    element: <ForgotPassword />,
    layout: DefaultLayout,
  },
];

// ============================================================================
// SHARED ROUTES - Dùng chung cho CUSTOMER, SELLER, ADMIN (cần đăng nhập)
// ============================================================================
const sharedRoutes: AppRoute[] = [
  {
    path: routesConfig.userProfile,
    element: <UserProfile />,
    layout: DefaultLayout,
    requiredRoles: ["CUSTOMER", "SELLER", "ADMIN"],
  },
  {
    path: routesConfig.changePassword,
    element: <ChangePassword />,
    layout: DefaultLayout,
    requiredRoles: ["CUSTOMER", "SELLER", "ADMIN"],
  },
  {
    path: routesConfig.infoAccount,
    element: <UserProfile />,
    layout: DefaultLayout,
    requiredRoles: ["CUSTOMER", "SELLER", "ADMIN"],
  },
  {
    path: routesConfig.userOrder,
    element: <OrderUser />,
    layout: DefaultLayout,
    requiredRoles: ["CUSTOMER", "SELLER", "ADMIN"],
  },
  {
    path: routesConfig.share,
    element: <Share />,
    layout: DefaultLayout,
    requiredRoles: ["CUSTOMER", "SELLER", "ADMIN"],
  },
  {
    path: routesConfig.paymentHistory,
    element: <PaymentHistory />,
    layout: DefaultLayout,
    requiredRoles: ["CUSTOMER", "SELLER", "ADMIN"],
  },
];

// ============================================================================
// CUSTOMER ROUTES - Chỉ dành cho CUSTOMER
// ============================================================================
const customerRoutes: AppRoute[] = [
  // Hiện tại chưa có route riêng cho CUSTOMER
  // Các route của CUSTOMER nằm trong sharedRoutes
];

// ============================================================================
// SELLER ROUTES - Chỉ dành cho SELLER (người bán)
// ============================================================================
const sellerRoutes: AppRoute[] = [
  {
    path: "/seller/dashboard",
    element: <SellerDashboard />,
    layout: SellerLayout,
    requiredRoles: ["SELLER"],
  },
  {
    path: "/seller/products",
    element: <SellerProducts />,
    layout: SellerLayout,
    requiredRoles: ["SELLER"],
  },
  {
    path: "/seller/products/edit/:id",
    element: <EditProductPage />,
    layout: SellerLayout,
    requiredRoles: ["SELLER"],
  },
  {
    path: "/seller/orders",
    element: <div>Quản lý đơn hàng</div>,
    layout: SellerLayout,
    requiredRoles: ["SELLER"],
  },
  {
    path: "/seller/shop",
    element: <SellerShop />,
    layout: SellerLayout,
    requiredRoles: ["SELLER"],
  },
];

// ============================================================================
// ADMIN ROUTES - Chỉ dành cho ADMIN (quản trị viên)
// ============================================================================
const adminRoutes: AppRoute[] = [
  {
    path: "/admin/dashboard",
    element: <AdminPanel />,
    layout: AdminLayoutNoHeader,
    requiredRoles: ["ADMIN"],
  },
  {
    path: "/admin/products",
    element: <AdminProductManagement />,
    layout: AdminLayoutNoHeader,
    requiredRoles: ["ADMIN"],
  },
];

// ============================================================================
// HELPER FUNCTIONS - Kiểm tra quyền truy cập
// ============================================================================

/**
 * Kiểm tra user có role phù hợp với requiredRoles không
 * @param user - User object từ auth context
 * @param requiredRoles - Mảng roles được yêu cầu
 * @returns true nếu user có ít nhất 1 role trong requiredRoles
 */
export const hasRequiredRole = (
  user: User | null,
  requiredRoles?: string[]
): boolean => {
  // Nếu không yêu cầu role nào => public route
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Nếu user chưa đăng nhập hoặc không có role => không được phép
  if (!user || !user.roles || user.roles.length === 0) {
    return false;
  }

  // Kiểm tra user có ít nhất 1 role trong danh sách requiredRoles
  return requiredRoles.some((role) => user.roles.includes(role));
};

/**
 * Lấy danh sách routes mà user hiện tại có quyền truy cập
 * @param user - User object từ auth context (null nếu chưa đăng nhập)
 * @returns Mảng routes mà user có thể truy cập
 */
export const getAccessibleRoutes = (user: User | null): AppRoute[] => {
  // Gộp tất cả routes lại
  const allRoutes = [
    ...publicRoutes,
    ...sharedRoutes,
    ...customerRoutes,
    ...sellerRoutes,
    ...adminRoutes,
  ];

  // Lọc chỉ giữ lại routes mà user có quyền truy cập
  return allRoutes.filter((route) => {
    // Public routes (không có requiredRoles) => luôn cho phép
    if (!route.requiredRoles) {
      return true;
    }

    // Kiểm tra user có role phù hợp không
    return hasRequiredRole(user, route.requiredRoles);
  });
};

// Export để sử dụng ở nơi khác
export {
  publicRoutes,
  sharedRoutes,
  customerRoutes,
  sellerRoutes,
  adminRoutes,
};
