
import Header from "../components/Header/Header.tsx";
import type {FC, ReactNode} from "react";
import Footer from "../components/Footer/Footer.tsx";
type DefaultLayoutProps = {
    children?: ReactNode
}

const DefaultLayout:FC<DefaultLayoutProps> = ({children}) => {
    return (
        <div>
            <Header/>

            <div>
                <div>{children}</div>
                <Footer/>
            </div>
        </div>
    );
};

export default DefaultLayout;
