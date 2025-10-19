import type { FC, ReactNode } from "react";
import Home from "../pages/Home/Home.tsx";
import DefaultLayout from "../components/Layouts/DefaultLayout/DefaultLayout.tsx";
import Login from "../pages/Login/Login.tsx";
import HeaderAndFooter from "../components/Layouts/HeaderAndFooter/HeaderAndFooter.tsx";
import ProductDetails from "../pages/ProductDetails/ProductDetails.tsx";
import Deposit from "../pages/Deposit/Deposit.tsx";
import routesConfig from "../config/routesConfig.tsx";
import ChangePassword from "../pages/ChangePassword/ChangePassword.tsx";
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
    path: routesConfig.login,
    element: <Login />,
    layout: HeaderAndFooter,
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
  {
    path: routesConfig.changePassword,
    element: <ChangePassword />,
    layout: DefaultLayout,
  },
];
const privateRoutes: AppRoute[] = [];
export { publicRoutes, privateRoutes };
