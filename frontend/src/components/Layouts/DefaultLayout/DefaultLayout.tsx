
import Header from "./Header/Header.tsx";
import type {FC} from "react";
import Sidebar from "./Sidebar/Sidebar.tsx";
import Footer from "./Footer/Footer.tsx";
type DefaultLayoutProps = {
    children?: React.ReactNode
}
const DefaultLayout:FC<DefaultLayoutProps> = ({children}) => {
    return (
        <div>
            <Header/>

            <div>
                <Sidebar/>
                <div>{children}</div>
                <Footer/>
                <Sidebar/>
            </div>
        </div>
    );
};

export default DefaultLayout;