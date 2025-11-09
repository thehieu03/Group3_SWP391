import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authServices } from "../../../services/AuthServices";
import type { LoginRequest } from "../../../models/modelRequest/LoginRequest";
import { useAuth } from "../../../hooks/useAuth.tsx";
import Cookies from "js-cookie";
import routesConfig from "../../../config/routesConfig.ts";
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

      console.log("[LOGIN] Sending request...", requestData);
      const response = await authServices.loginAsync(requestData);
      console.log("[LOGIN] Response received:", response);
      console.log("[LOGIN] Response keys:", Object.keys(response || {}));
      console.log("[LOGIN] Response.user:", response?.user);
      console.log("[LOGIN] Response.accessToken:", response?.accessToken);

      if (!response) {
        throw new Error("No response from server");
      }

      if (!response.accessToken) {
        console.error("[LOGIN] Missing accessToken in response");
        throw new Error("Invalid response: missing accessToken");
      }

      if (!response.user) {
        console.error("[LOGIN] Missing user in response");
        throw new Error("Invalid response: missing user");
      }

      if (!response.user.roles || !Array.isArray(response.user.roles)) {
        console.warn("[LOGIN] User roles is missing or not an array:", response.user.roles);
        response.user.roles = response.user.roles || [];
      }

      // Xác định secure flag dựa trên protocol
      const isHttps = window.location.protocol === 'https:';

      // Lưu tokens - dựa vào checkbox "Ghi nhớ đăng nhập"
      if (rememberMe) {
        // Ghi nhớ: Cookies tồn tại lâu dài
        Cookies.set("accessToken", response.accessToken, {
          expires: 7, // 7 ngày
          secure: isHttps,
          sameSite: "strict",
        });

        Cookies.set("refreshToken", response.refreshToken, {
          expires: 30, // 30 ngày
          secure: isHttps,
          sameSite: "strict",
        });
      } else {
        // Không ghi nhớ: Session cookies (tự xóa khi đóng trình duyệt)
        Cookies.set("accessToken", response.accessToken, {
          secure: isHttps,
          sameSite: "strict",
        });

        Cookies.set("refreshToken", response.refreshToken, {
          secure: isHttps,
          sameSite: "strict",
        });
      }

      // Update Auth Context
      login(response.user);

      // Xác định trang chuyển hướng dựa trên role
      let redirectPath = routesConfig.home;
      let redirectMessage = "Đã đăng nhập thành công! Đang chuyển hướng...";

      if (response.user.roles?.includes("ADMIN")) {
        redirectPath = "/admin/dashboard";
        redirectMessage = "Đã đăng nhập thành công! Đang chuyển đến trang quản trị...";
      } else if (response.user.roles?.includes("SELLER")) {
        redirectPath = "/seller/dashboard";
        redirectMessage = "Đã đăng nhập thành công! Đang chuyển đến trang quản lý shop...";
      } else if (response.user.roles?.includes("BUYER") || response.user.roles?.includes("CUSTOMER")) {
        redirectPath = routesConfig.home;
        redirectMessage = "Đã đăng nhập thành công! Đang chuyển về trang chủ...";
      } else {
        // Fallback nếu không có role nào phù hợp
        redirectPath = routesConfig.home;
        redirectMessage = "Đã đăng nhập thành công! Đang chuyển về trang chủ...";
      }

      setSuccess(redirectMessage);

      console.log("[LOGIN] Redirecting to:", redirectPath);
      console.log("[LOGIN] User roles:", response.user.roles);
      
      // Redirect ngay lập tức (không cần chờ)
      // Sử dụng setTimeout với delay ngắn để đảm bảo state đã được update
      setTimeout(() => {
        console.log("[LOGIN] Executing navigate to:", redirectPath);
        try {
          navigate(redirectPath, { replace: true });
          console.log("[LOGIN] Navigate called successfully");
        } catch (navError) {
          console.error("[LOGIN] Navigate error:", navError);
          // Fallback: sử dụng window.location
          window.location.href = redirectPath;
        }
      }, 500);
    } catch (error: any) {
      console.error("[LOGIN] Failed:", error);
      console.error("[LOGIN] Error response:", error.response);
      console.error("[LOGIN] Error data:", error.response?.data);
      
      // Hiển thị lỗi chi tiết hơn
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          setError(data?.message || "Tên đăng nhập hoặc mật khẩu không đúng");
        } else if (status === 400) {
          const errorMessages = data?.errors 
            ? Object.values(data.errors).flat().join(", ")
            : data?.message || "Dữ liệu không hợp lệ";
          setError(errorMessages);
        } else if (status === 500) {
          setError(data?.message || "Lỗi server. Vui lòng thử lại sau.");
        } else {
          setError(data?.message || `Lỗi không xác định (${status})`);
        }
      } else if (error.request) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError(error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
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
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleLogin()}
            disabled={isLoading}
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleLogin()}
            disabled={isLoading}
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
              disabled={isLoading}
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

          <div className="or-text">Hoặc</div>

          <button className="btn-google" onClick={handleGoogleLogin} disabled={isLoading}>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
            />
            Đăng nhập với Google
          </button>

          <div className="redirect-text">
            Chưa có tài khoản? <Link to={routesConfig.register} className="link-green">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
