import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authServices } from "../../../services/AuthServices";
import type { RegisterRequest } from "../../../models/modelRequest/RegisterRequest";
import { useAuth } from "../../../hooks/useAuth.tsx";
import Cookies from "js-cookie";
import routesConfig from "../../../config/routesConfig.tsx";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return emailRegex.test(email) && email.includes("@");
  };

  const validatePassword = (password: string) => {
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!registerData.username.trim() || !registerData.email.trim() || 
        !registerData.password.trim() || !registerData.confirmPassword.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (registerData.username.length < 3 || registerData.username.length > 50) {
      setError("Tên đăng nhập phải từ 3-50 ký tự");
      return;
    }

    if (!validateEmail(registerData.email)) {
      setError("Email không hợp lệ. Email phải có @ và đúng định dạng (vd: user@example.com)");
      return;
    }

    if (!registerData.email.includes("@")) {
      setError("Email phải chứa ký tự @");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!validatePassword(registerData.password)) {
      setError("Mật khẩu phải bao gồm cả chữ và số");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    if (!isAgreed) {
      setError("Bạn phải đồng ý với điều khoản sử dụng");
      return;
    }

    setIsLoading(true);

    try {
      const requestData: RegisterRequest = {
        username: registerData.username.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
      };

      const response = await authServices.registerAsync(requestData);

      // Lưu tokens
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

      // Update Auth Context
      login(response.user);

      // Xác định trang chuyển hướng dựa trên role
      let redirectPath = routesConfig.home;
      let redirectMessage = "Đăng ký thành công! Đang chuyển hướng...";

      if (response.user.roles.includes("ADMIN")) {
        redirectPath = "/admin/dashboard";
        redirectMessage = "Đăng ký thành công! Đang chuyển đến trang quản trị...";
      } else if (response.user.roles.includes("SELLER")) {
        redirectPath = "/seller/dashboard";
        redirectMessage = "Đăng ký thành công! Đang chuyển đến trang quản lý shop...";
      } else {
        redirectMessage = "Đăng ký thành công! Đang chuyển về trang chủ...";
      }

      setSuccess(redirectMessage);

      // Redirect sau 1.5 giây
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    } catch (error: any) {
      console.error("Register failed:", error);

      if (error.response?.status === 409) {
        setError("Tên đăng nhập hoặc email đã tồn tại");
      } else if (error.response?.status === 400) {
        setError("Thông tin đăng ký không hợp lệ");
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-box auth-box-register">
          <h2 className="auth-title">Đăng ký tài khoản</h2>

          <p className="notice">
            <span className="text-green">
              Chú ý: Email phải có @, mật khẩu phải có cả chữ và số (tối thiểu 6 ký tự)
            </span>
          </p>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {success && (
            <div className="success-message">{success}</div>
          )}

          <div className="grid-2">
            <div>
              <label>Tài khoản</label>
              <input
                type="text"
                placeholder="Nhập tài khoản (3-50 ký tự)"
                value={registerData.username}
                onChange={(e) =>
                  setRegisterData({ ...registerData, username: e.target.value })
                }
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="Nhập email (phải có @)"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="Mật khẩu (chữ + số, ≥6 ký tự)"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
              />
            </div>
            <div>
              <label>Nhập lại mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="agree">
            <input
              type="checkbox"
              id="agree"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
            <label htmlFor="agree" style={{ marginBottom: 0 }}>
              Tôi đã đọc và đồng ý với{" "}
              <span className="text-green-bold">
                Điều khoản sử dụng Tạp Hóa MMO
              </span>
            </label>
          </div>

          <button
            className="btn-green"
            onClick={handleRegister}
            disabled={!isAgreed || isLoading}
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          <div className="redirect-text">
            Đã có tài khoản? <Link to={routesConfig.login} className="link-green">Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

