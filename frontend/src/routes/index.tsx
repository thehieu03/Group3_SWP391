import type {FC, ReactNode} from "react";

type AppRoute={
    path:string,
    element:ReactNode,
    layout:FC<{children?:ReactNode}>
}
const publicRoutes: AppRoute[] = [];
const privateRoutes: AppRoute[] = [];
export {publicRoutes, privateRoutes};