import type {FC, ReactNode} from "react";
import Header from "./Header/Header.tsx";
import Footer from "./Footer/Footer.tsx";

type LoginLayoutProps = {
    children?:ReactNode;
}
const LoginLayout:FC<LoginLayoutProps> = ({children}) => {
    return (
        <div>
            <Header/>
            <div>{children}</div>
            <Footer/>
        </div>
    );
};

export default LoginLayout;