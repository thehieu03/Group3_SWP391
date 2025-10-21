import type {FC, ReactNode} from "react";
import Header from "../components/Header/Header.tsx";
import Footer from "../components/Footer/Footer.tsx";
type LoginLayoutProps = {
    children?:ReactNode;
}
const HeaderAndFooter:FC<LoginLayoutProps> = ({children}) => {
    return (
        <div>
            <Header/>
            <div>{children}</div>
            <Footer/>
        </div>
    );
};

export default HeaderAndFooter;