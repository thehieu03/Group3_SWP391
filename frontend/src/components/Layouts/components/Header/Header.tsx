import {FaFacebookSquare} from "react-icons/fa";
import {MdOutlineEmail} from "react-icons/md";
import {CiClock1} from "react-icons/ci";
import Button from "../../../Button/Button.tsx";
import {ImageLogo as Logo} from "../../../../assets/ImageLogo.tsx";
import CategoryMenuHeader from "../../menu/CategoryMenuHeader.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMessage, faUser} from "@fortawesome/free-solid-svg-icons";
import TippyHeadless from "@tippyjs/react/headless";

const headerStyle = {
    notification: 'absolute -top-3 -right-1 bg-gray-500 text-white text-[15px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1'
}
const Header = () => {
    const isLogin = false;
    return (
        <div>
            <div className="h-[34px] flex justify-between items-center bg-[#8c8c8c]">
                <div className="flex items-center gap-2 text-white">
                    <a>Hỗ trợ trực tuyến:</a>
                    <FaFacebookSquare className="text-[#28a745]"/>
                    <p className="text-[#28a745]">Tạp hóa MMO</p>
                    <MdOutlineEmail/>
                    <p>hieunthe171211@gmail.com</p>
                    <CiClock1/>
                    <p>Thứ 2 - Chủ nhật: 8h - 21h</p>
                </div>
                <div className="text-red-400 cursor-pointer">
                    <Button to="/registerShop">Đăng kí bán hàng</Button>
                </div>
            </div>
            {/*header*/}
            <div className="h-[54px] w-full bg-[var(--green-color)]">
                <div className="flex h-full pl-[20px] pr-[15px] justify-between items-center ">
                    {/*header menu*/}
                    <div className="flex w-full h-full items-center">
                        <div className="h-full flex items-center">
                            <Button to="/">
                                <Logo/>
                            </Button>
                        </div>
                        <CategoryMenuHeader isLogin={isLogin}/>
                    </div>
                    {/*header login*/}
                    <div className="flex items-center gap-3 font-medium whitespace-nowrap text-white h-full">
                        {isLogin && <>
                            <div className='font-semibold cursor-pointer '>11,049 VPN</div>
                            <div className='relative cursor-pointer '>
                                <FontAwesomeIcon icon={faMessage} className='text-xl'/>
                                <span className={headerStyle.notification}>0</span>
                            </div>
                        </>
                        }
                        <TippyHeadless interactive={true} offset={[0, 8]} placement="bottom-start" delay={[0, 100]}
                                       appendTo={() => document.body}>
                            <div className='relative cursor-pointer'>
                                <FontAwesomeIcon icon={faUser} className='text-xl'/>
                                <span className={headerStyle.notification}>0</span>
                            </div>
                        </TippyHeadless>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
