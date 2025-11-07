import Header from "@components/Layouts/components/Header/Header.tsx";
import type { FC, ReactNode } from "react";
import Footer from "@components/Layouts/components/Footer/Footer.tsx";
type DefaultLayoutProps = {
  children?: ReactNode;
};

const DefaultLayout: FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      <div>
        <div>{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default DefaultLayout;
