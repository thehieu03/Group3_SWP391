import { FaFacebookSquare } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { CiClock1 } from "react-icons/ci";
import Button from "@components/Button/Button.tsx";
import { ImageLogo as Logo } from "@assets/ImageLogo.tsx";
import CategoryMenuHeader from "@/components/Layouts/components/Header/menu/CategoryMenuHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faMessage,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import TippyHeadless from "@tippyjs/react/headless";
import UserMenu from "@/components/Layouts/components/Header/menu/UserMenu";
import LoginMenu from "@/components/Layouts/components/Header/menu/LoginMenu";
import { useEffect, useState } from "react";
import routesConfig from "@config/routesConfig.ts";
import { useAuth } from "@/hooks/useAuth.tsx";

const headerStyle = {
  notification:
    "absolute -top-3 -right-1 bg-gray-500 text-white text-[15px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
};
const Header = () => {
  const { isLoggedIn, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (viewportWidth > 991 && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [viewportWidth, isMobileMenuOpen]);
  return (
    <div>
      <div className="h-[34px] flex justify-between items-center bg-[#8c8c8c] max-[991px]:hidden">
        <div className="flex items-center gap-2 text-white">
          <a>Hỗ trợ trực tuyến:</a>
          <FaFacebookSquare className="text-[#28a745]" />
          <p className="text-[#28a745]">Tạp hóa MMO</p>
          <MdOutlineEmail />
          <p>hieunthe171211@gmail.com</p>
          <CiClock1 />
          <p>Thứ 2 - Chủ nhật: 8h - 21h</p>
        </div>
        <div className="text-red-400 cursor-pointer">
          <Button to={routesConfig.registerShop}>Đăng kí bán hàng</Button>
        </div>
      </div>
      <div className="h-[54px] w-full bg-[var(--green-color)]">
        <div className="flex h-full pl-[20px] pr-[15px] justify-between items-center ">
          <div className="flex w-full h-full items-center">
            <div className="h-full flex items-center">
              <Button to="/">
                <Logo />
              </Button>
            </div>
            <div className="max-[991px]:hidden">
              <CategoryMenuHeader isLogin={isLoggedIn} />
            </div>
          </div>
          <div className="flex items-center gap-3 font-medium whitespace-nowrap text-white h-full">
            {isLoggedIn && (
              <>
                <div className="font-semibold cursor-pointer ">
                  {user?.balance?.toLocaleString()}
                </div>
                <div className="relative cursor-pointer ">
                  <FontAwesomeIcon icon={faMessage} className="text-xl" />
                  <span className={headerStyle.notification}>0</span>
                </div>
              </>
            )}
            <TippyHeadless
              interactive
              offset={[0, 8]}
              placement="bottom-start"
              delay={[0, 100]}
              trigger="click"
              appendTo={() => document.body}
              render={() => (
                <div>{isLoggedIn ? <UserMenu /> : <LoginMenu />}</div>
              )}
            >
              <div className="relative cursor-pointer">
                <FontAwesomeIcon icon={faUser} className="text-xl" />
                <span className={headerStyle.notification}>0</span>
              </div>
            </TippyHeadless>
            <button
              className="hidden max-[991px]:flex items-center justify-center text-white ml-2"
              aria-label="Open menu"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <FontAwesomeIcon icon={faBars} className="text-2xl" />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed z-50 top-0 left-0 h-screen w-[300px] bg-white shadow-2xl">
            <div className="flex items-center justify-between px-4 h-[54px] border-b">
              <span className="font-semibold">Menu</span>
              <button
                aria-label="Close menu"
                className="p-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faXmark} className="text-xl" />
              </button>
            </div>

            <nav className="py-2">
              <Button
                to={routesConfig.home}
                className="block px-4 py-3 hover:bg-gray-100"
              >
                Trang chủ
              </Button>
              <div className="border-t" />
              <Button
                to={routesConfig.support}
                className="block px-4 py-3 hover:bg-gray-100"
              >
                Hỗ trợ
              </Button>
              <Button className="block px-4 py-3 hover:bg-gray-100">
                Công cụ
              </Button>
              <Button className="block px-4 py-3 hover:bg-gray-100">
                Nạp tiền
              </Button>
              <Button className="block px-4 py-3 hover:bg-gray-100">
                Thông tin tài khoản
              </Button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
