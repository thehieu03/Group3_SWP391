import type { FC, ReactNode } from "react";
import Home from "../pages/Home/Home.tsx";
import DefaultLayout from "../components/Layouts/DefaultLayout/DefaultLayout.tsx";
import Login from "../pages/Login/Login.tsx";
import HeaderAndFooter from "../components/Layouts/HeaderAndFooter/HeaderAndFooter.tsx";
import ProductDetails from "../pages/ProductDetails/ProductDetails.tsx";
import Deposit from "../pages/Deposit/Deposit.tsx";
import ChangePassword from "../pages/ChangePassword/ChangePassword.tsx";
import routesConfig from "../config/routesConfig.tsx";
<<<<<<< Updated upstream
import Products from "../pages/Products/Products.tsx";
import Support from "../pages/Support/Support.tsx";
import RegisterShop from "../pages/RegisterShop/RegisterShop.tsx";

=======
import type { User } from "../models/modelResponse/LoginResponse";
import SupportTicket from "../pages/Admin/SupportTickets.tsx";
import ChangePassword from "../pages/UserAndSeller/ChangePassword/ChangePassword.tsx";
import RegisterShop from "../pages/UserAndSeller/RegisterShop/RegisterShop.tsx";
<<<<<<< Updated upstream
import SubcategoryProducts from "../pages/UserAndSeller/SubcategoryProducts/SubcategoryProducts.tsx";
>>>>>>> Stashed changes
=======
import SubCategoryProducts from "../pages/UserAndSeller/SubCategoryProducts/SubCategoryProducts.tsx";

>>>>>>> Stashed changes
type AppRoute = {
  path: string;
  element: ReactNode;
  layout: FC<{ children?: ReactNode }>;
};

const publicRoutes: AppRoute[] = [
  {
    path: routesConfig.home,
    element: <Home />,
    layout: DefaultLayout,
  },
  {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    path: routesConfig.products,
    element: <Products />,
    layout: HeaderAndFooter,
  },

  { path: "/gmail", element: <Products />, layout: HeaderAndFooter },
  { path: "/software", element: <Products />, layout: HeaderAndFooter },
  { path: "/account", element: <Products />, layout: HeaderAndFooter },
  { path: "/other", element: <Products />, layout: HeaderAndFooter },
  {
    path: routesConfig.login,
    element: <Login />,
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.productDetails,
=======
    path: "/product/:id",
>>>>>>> Stashed changes
    element: <ProductDetails />,
    layout: HeaderAndFooter,
=======
    path: "/product/:id",
    element: <ProductDetails />,
    layout: HeaderAndFooter,
  },
  {
    path: "/products",
    element: <SubcategoryProducts />,
    layout: HeaderAndFooter,
  },
  {
    path: "/products",
    element: <CategoryProducts />,
    layout: HeaderAndFooter,
  },

  {
    path: "/changePassword",
    element: <ChangePassword />,
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.getProductDetailsUrl(":id"),
    element: <ProductDetails />,
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.categoryProducts,
    element: <CategoryProducts />,
<<<<<<< Updated upstream
    layout: DefaultLayout,
>>>>>>> Stashed changes
=======
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.subCategoryProducts,
    element: <SubCategoryProducts />,
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.changePassword,
    element: <ChangePassword />,
    layout: HeaderAndFooter,
>>>>>>> Stashed changes
  },
  {
    path: routesConfig.deposit,
    element: <Deposit />,
    layout: DefaultLayout,
  },
<<<<<<< Updated upstream
=======
];


const privateRoutes: AppRoute[] = [
>>>>>>> Stashed changes
  {
    path: routesConfig.changePassword,
    element: <ChangePassword />,
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.support,
    element: <Support />,
    layout: HeaderAndFooter,
  },
  {
    path: routesConfig.registerShop,
    element: <RegisterShop />,
    layout: HeaderAndFooter,
  },
  {
    path: "/registerShop",
    element: <RegisterShop />,
    layout: HeaderAndFooter,
  },
  {
    path: "/registerShop",
    element: <RegisterShop />,
    layout: HeaderAndFooter,
  },
];

const privateRoutes: AppRoute[] = [];

<<<<<<< Updated upstream
export { publicRoutes, privateRoutes };
=======
const adminRoutes: AppRoute[] = [
  {
    path: "/admin/dashboard",
    element: <AdminPanel />,
    layout: DefaultLayout,
    requiredRoles: ["ADMIN"],
  },
  {
    path: "/admin/products",
    element: <AdminProductManagement />,
    layout: DefaultLayout,
    requiredRoles: ["ADMIN"],
  },
  {
    path: "/admin/supporttickets",
    element: <SupportTicket />,
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
>>>>>>> Stashed changes
