import { FaFacebookSquare } from 'react-icons/fa';
import {MdOutlineEmail} from "react-icons/md";
import {CiClock1} from "react-icons/ci";
const Header = () => {
    return (
        <div>
            <div className="flex justify-between items-center px-20 py-2 bg-gray-200">
                <div className="flex">
                    <div>
                        <a>Hỗ trợ trực tuyến</a>
                    </div>
                    <div>
                        <FaFacebookSquare />
                        <p>Tạp hóa MMO</p>
                    </div>
                    <div>
                        <MdOutlineEmail />
                        <p>hieunthe171211@gmail.com</p>
                    </div>
                    <div>
                        <CiClock1 />
                        <p>Thứ 2 - Chủ nhật: 8h - 21h</p>
                    </div>
                </div>
                <div>
                    <a >Đăng kí bán hàng</a>
                </div>
            </div>
            <div>Header</div>
        </div>
    );
};

export default Header;