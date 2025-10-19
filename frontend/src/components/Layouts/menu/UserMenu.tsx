import Button from "../../Button/Button.tsx";
import Image from "../../Image";
const handleLogout=()=>{
    console.log("logout");
}
const UserMenu = () => (
    <div className="bg-white shadow-md rounded-md p-3 w-[220px]">
        <div className="flex items-center gap-2 mb-2 border-b pb-2">
            <Image src="/avatar.png" alt="avatar" className="w-8 h-8 rounded-full" />
            <div>
                <p className="font-semibold text-sm">thehieu03</p>
                <p className="text-gray-500 text-xs">hieunthe171211@gmail.com</p>
            </div>
        </div>
        <ul className="text-sm space-y-1">
            <li><Button to="/account">Thông tin tài khoản</Button></li>
            <li><Button to="/orders">Đơn hàng đã mua</Button></li>
            <li><Button to="/paymentHistory">Lịch sử thanh toán</Button></li>
            <li><Button to="/content-manager">Quản lý nội dung</Button></li>
            <li><Button to="/change-password">Đổi mật khẩu</Button></li>
            <li><Button onClick={handleLogout} className="text-red-500">Thoát</Button></li>
        </ul>
    </div>
);

export default UserMenu;