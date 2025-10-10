import {FaArrowDown, FaFacebookSquare} from 'react-icons/fa';
import {MdOutlineEmail} from "react-icons/md";
import {CiClock1} from "react-icons/ci";
import Button from "../../../Button/Button.tsx";
import {ImageLogo as Logo} from "../../../../assets/ImageLogo.tsx";
import Tippy from "@tippyjs/react";
const Header = () => {
    return (
        <div>
            <div className="h-[34px] flex justify-between items-center bg-[#8c8c8c]">
                <div className="flex items-center gap-2 text-white">
                        <a>Hỗ trợ trực tuyến:</a>
                        <FaFacebookSquare  className="text-[#28a745]"/>
                        <p className="text-[#28a745]">Tạp hóa MMO</p>
                        <MdOutlineEmail />
                        <p>hieunthe171211@gmail.com</p>
                        <CiClock1 />
                        <p>Thứ 2 - Chủ nhật: 8h - 21h</p>
                </div>
                <div className="text-red-400">
                    <a >Đăng kí bán hàng</a>
                </div>
            </div>
            {/*header*/}
            <div className='h-[54px] w-full bg-[var(--green-color)]'>
                <div className='flex h-full pl-[20px] pr-[15px] justify-between items-center '>
                    {/*header menu*/}
                    <div className='flex w-full h-full'>
                        <div className='h-full flex items-center'>
                            <Button to="/" >
                                <Logo/>
                            </Button>
                        </div>
                        <div>
                            <Tippy content="Menu" visible={true}>
                                <FaArrowDown />
                            </Tippy>
                        </div>
                    </div>
                    {/*header login*/}
                    <div>
                        l9ogin
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;