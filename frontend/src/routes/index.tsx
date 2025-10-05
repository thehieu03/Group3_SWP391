import type {FC, ReactNode} from "react";
import Home from "../pages/Home/Home.tsx";
import DefaultLayout from "../components/Layouts/DefaultLayout/DefaultLayout.tsx";
import Login from "../pages/Login/Login.tsx";
import HeaderAndFooter from "../components/Layouts/HeaderAndFooter/HeaderAndFooter.tsx";
import ProductDetails from "../pages/ProductDetails/ProductDetails.tsx";
type AppRoute={
    path:string,
    element:ReactNode,
    layout:FC<{children?:ReactNode}>
}
const publicRoutes: AppRoute[] = [
    {
        path:'/',
        element:<Home/>,
        layout:DefaultLayout,
    },{
        path:'/login',
        element:<Login/>,
        layout:HeaderAndFooter
    },{
        path:'/productDetails',
        element:<ProductDetails/>,
        layout:HeaderAndFooter
    }
];
const privateRoutes: AppRoute[] = [];
export {publicRoutes, privateRoutes};