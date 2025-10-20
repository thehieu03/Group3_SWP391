import { type ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../Button/Button.tsx";
import routesConfig from "../../../config/routesConfig.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { authServices } from "../../../services/AuthServices";
import type { LoginRequest } from "../../../models/modelRequest/LoginRequest";
import { useAuth } from "../../../hooks/useAuth.tsx";
import Cookies from "js-cookie";

const LoginMenu = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError("");
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError("");
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const loginData: LoginRequest = {
        username: username,
        password: password,
      };

      const response = await authServices.loginAsync(loginData);
      Cookies.set("accessToken", response.accessToken, {
        expires: 7,
        secure: true,
        sameSite: "strict",
      });

      Cookies.set("refreshToken", response.refreshToken, {
        expires: 30,
        secure: true,
        sameSite: "strict",
      });
      login(response.user);
      console.log("login success");
      
      if (response.user.roles.includes('ADMIN')) {
        navigate('/admin/dashboard');
      } else if (response.user.roles.includes('SELLER')) {
        navigate(routesConfig.home);
      } else if (response.user.roles.includes('USER')) {
        navigate(routesConfig.home);
      } else {
        navigate(routesConfig.home);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("google login");
  };

  return (
    <div className="bg-white shadow-md rounded-md p-4 w-[220px]">
      <h3 className="font-semibold text-center mb-2">Đăng nhập</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}

      <input
        type="text"
        name="username"
        placeholder="Tên đăng nhập"
        className="border w-full p-1 rounded mb-2"
        value={username}
        onChange={handleUsernameChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Mật khẩu"
        className="border w-full p-1 rounded mb-2"
        value={password}
        onChange={handlePasswordChange}
      />
      <div className="flex justify-between text-sm mb-2">
        <label>
          <input type="checkbox" /> Ghi nhớ
        </label>
        <Button
          to={routesConfig.forgotPassword}
          className="text-blue-500 cursor-pointer"
        >
          Quên mật khẩu
        </Button>
      </div>
      <Button
        className="w-full bg-green-600 text-white py-1 rounded text-center"
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
      <Button
        className="w-full bg-blue-500 text-white py-1 mt-2 rounded text-center"
        leftIcon={<FontAwesomeIcon icon={faGoogle} />}
        onClick={handleGoogleLogin}
      >
        Google Login
      </Button>
      <div className="text-center mt-2 text-sm">
        <Button
          to={routesConfig.register}
          className="text-blue-500 cursor-pointer"
        >
          Đăng ký
        </Button>
      </div>
    </div>
  );
};

export default LoginMenu;
