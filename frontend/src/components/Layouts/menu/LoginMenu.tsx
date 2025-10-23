import Button from "../../Button/Button.tsx";
import routesConfig from "../../../config/routesConfig.tsx";

const LoginMenu = () => {
  return (
    <div className="bg-white shadow-md rounded-md p-4 w-[220px]">
      <h3 className="font-semibold text-center mb-4">Tài khoản</h3>

      <Button
        to={routesConfig.login}
        className="w-full bg-green-600 text-white py-2 rounded text-center mb-2 block hover:bg-green-700 transition-colors"
      >
        Đăng nhập
      </Button>

      <Button
        to={routesConfig.registerShop}
        className="w-full bg-blue-500 text-white py-2 rounded text-center block hover:bg-blue-600 transition-colors"
      >
        Đăng ký
      </Button>
    </div>
  );
};

export default LoginMenu;
