import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authServices } from "../../../services/AuthServices";
import type { LoginRequest } from "../../../models/modelRequest/LoginRequest";
import { useAuth } from "../../../hooks/useAuth.tsx";
import Cookies from "js-cookie";
import routesConfig from "../../../config/routesConfig.tsx";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      const requestData: LoginRequest = {
        username: loginData.username.trim(),
        password: loginData.password,
      };

      const response = await authServices.loginAsync(requestData);

      // Lưu tokens - dựa vào checkbox "Ghi nhớ đăng nhập"
      if (rememberMe) {
        // Ghi nhớ: Cookies tồn tại lâu dài
        Cookies.set("accessToken", response.accessToken, {
          expires: 7, // 7 ngày
          secure: true,
          sameSite: "strict",
        });

        Cookies.set("refreshToken", response.refreshToken, {
          expires: 30, // 30 ngày
          secure: true,
          sameSite: "strict",
        });
      } else {
        // Không ghi nhớ: Session cookies (tự xóa khi đóng trình duyệt)
        Cookies.set("accessToken", response.accessToken, {
          secure: true,
          sameSite: "strict",
        });

        Cookies.set("refreshToken", response.refreshToken, {
          secure: true,
          sameSite: "strict",
        });
      }

      // Update Auth Context
      login(response.user);

      // Xác định trang chuyển hướng dựa trên role
      let redirectPath = routesConfig.home;
      let redirectMessage = "Đã đăng nhập thành công! Đang chuyển hướng...";

      if (response.user.roles.includes("ADMIN")) {
        redirectPath = "/admin/dashboard";
        redirectMessage = "Đã đăng nhập thành công! Đang chuyển đến trang quản trị...";
      } else if (response.user.roles.includes("SELLER")) {
        redirectPath = "/seller/dashboard";
        redirectMessage = "Đã đăng nhập thành công! Đang chuyển đến trang quản lý shop...";
      } else if (response.user.roles.includes("BUYER")) {
        redirectPath = routesConfig.home;
        redirectMessage = "Đã đăng nhập thành công! Đang chuyển về trang chủ...";
      } else {
        // Fallback nếu không có role nào phù hợp
        redirectPath = routesConfig.home;
        redirectMessage = "Đã đăng nhập thành công! Đang chuyển về trang chủ...";
      }

      setSuccess(redirectMessage);

      // Redirect sau 1.5 giây
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    } catch (error: any) {
      console.error("Login failed:", error);
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login - Coming soon");
    alert("Tính năng đăng nhập Google sẽ sớm được cập nhật!");
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-box">
          <h2 className="auth-title">Đăng nhập</h2>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {success && (
            <div className="success-message">{success}</div>
          )}

          <label>Tên đăng nhập hoặc Email</label>
          <input
            type="text"
            placeholder="Nhập tên đăng nhập hoặc email"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
          />

          <div className="forgot-password">
            <Link to={routesConfig.forgotPassword}>Quên mật khẩu?</Link>
          </div>

          <div className="remember">
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember" style={{ marginBottom: 0 }}>Ghi nhớ đăng nhập</label>
          </div>

          <button 
            className="btn-green" 
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="or-text">Or</div>

          <button className="btn-google" onClick={handleGoogleLogin}>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
            />
            Login with Google
          </button>

          <div className="redirect-text">
            Chưa có tài khoản? <Link to={routesConfig.registerShop} className="link-green">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

