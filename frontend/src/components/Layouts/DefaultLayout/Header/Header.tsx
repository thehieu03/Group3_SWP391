import { FaFacebookSquare } from 'react-icons/fa';
import {MdOutlineEmail} from "react-icons/md";
import {CiClock1} from "react-icons/ci";
import imageLogo from "../../../../assets/logoShop.png";
const Header = () => {
    return (
        <div>
            <div className="h-[34px] flex justify-between items-center px-20 py-2 bg-[#8c8c8c]">
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
            <div>
                <div>
                    <img src={imageLogo} alt="Logo" className="w-20 h-20" />


                </div>
                <h1>Hieu</h1>
            </div>
        </div>
    );
};

export default Header;