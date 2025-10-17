
import Header from "../components/Header/Header.tsx";
import type {FC, ReactNode} from "react";
import Sidebar from "./Sidebar/Sidebar.tsx";
import Footer from "../components/Footer/Footer.tsx";
type DefaultLayoutProps = {
    children?: ReactNode
}

const DefaultLayout:FC<DefaultLayoutProps> = ({children}) => {
    return (
        <div>
            <Header/>

            <div>
                <Sidebar types={true}/>
                <div>{children}</div>
                <Footer/>
                <Sidebar types={false}/>
            </div>
        </div>
    );
};

export default DefaultLayout;