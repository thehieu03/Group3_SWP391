import type {FC, ReactNode} from "react";
import Home from "../pages/Home/Home.tsx";
import DefaultLayout from "../components/Layouts/DefaultLayout/DefaultLayout.tsx";

type AppRoute={
    path:string,
    element:ReactNode,
    layout:FC<{children?:ReactNode}>
}
const publicRoutes: AppRoute[] = [
    {
        path:'/',
        element:<Home/>,
        layout:DefaultLayout
    }
];
const privateRoutes: AppRoute[] = [];
export {publicRoutes, privateRoutes};