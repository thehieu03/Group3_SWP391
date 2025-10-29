import Button from "@components/Button/Button.tsx";
import Image from "@components/Image/index.tsx";
import { useAuth } from "@hooks/useAuth.tsx";
import routesConfig from "@config/routesConfig.ts";
const UserMenu = () => {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white shadow-md rounded-md p-3 w-[220px]">
      <div className="flex items-center gap-2 mb-2 border-b pb-2">
        <Image
          src="/avatar.png"
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="font-semibold text-sm">{user?.username}</p>
          <p className="text-gray-500 text-xs">{user?.email}</p>
        </div>
      </div>
      <ul className="text-sm space-y-1">
        <li>
          <Button to={routesConfig.infoAccount}>Thông tin tài khoản</Button>
        </li>
        <li>
          <Button to={routesConfig.userOrder}>Đơn hàng đã mua</Button>
        </li>
        <li>
          <Button to={routesConfig.paymentHistory}>Lịch sử thanh toán</Button>
        </li>
        {user?.roles.includes("SELLER") && (
          <li>
            <Button to="/seller/dashboard">Quản lý shop</Button>
          </li>
        )}
        <li>
          <Button to={routesConfig.contentManager}>Quản lý nội dung</Button>
        </li>
        <li>
          <Button to={routesConfig.changePassword}>Đổi mật khẩu</Button>
        </li>
        <li>
          <Button onClick={handleLogout} className="text-red-500">
            Logout
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default UserMenu;
