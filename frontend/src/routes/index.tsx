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
=======

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
    layout: HeaderAndFooter,
  },
];

const privateRoutes: AppRoute[] = [];

export { publicRoutes, privateRoutes };
