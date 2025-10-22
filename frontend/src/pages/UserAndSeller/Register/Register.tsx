import { type ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authServices } from "../../../services/AuthServices";
import type { RegisterRequest } from "../../../models/modelRequest/RegisterRequest";
import type { LoginRequest } from "../../../models/modelRequest/LoginRequest";
import { useAuth } from "../../../hooks/useAuth.tsx";
import Cookies from "js-cookie";
import routesConfig from "../../../config/routesConfig.tsx";
import Header from "../../../components/Layouts/components/Header/Header.tsx";
import Footer from "../../../components/Layouts/components/Footer/Footer.tsx";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State cho Register
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // State cho Login
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [errorRegister, setErrorRegister] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const [successRegister, setSuccessRegister] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return emailRegex.test(email) && email.includes("@");
  };

  const validatePassword = (password: string) => {
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  };

  // Xử lý đăng ký
  const handleRegister = async () => {
    setErrorRegister("");
    setSuccessRegister("");

    // Validation
    if (!registerData.username.trim() || !registerData.email.trim() || 
        !registerData.password.trim() || !registerData.confirmPassword.trim()) {
      setErrorRegister("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (registerData.username.length < 3 || registerData.username.length > 50) {
      setErrorRegister("Tên đăng nhập phải từ 3-50 ký tự");
      return;
    }

    if (!validateEmail(registerData.email)) {
      setErrorRegister("Email không hợp lệ. Email phải có @ và đúng định dạng (vd: user@example.com)");
      return;
    }

    if (!registerData.email.includes("@")) {
      setErrorRegister("Email phải chứa ký tự @");
      return;
    }

    if (registerData.password.length < 6) {
      setErrorRegister("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!validatePassword(registerData.password)) {
      setErrorRegister("Mật khẩu phải bao gồm cả chữ và số");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setErrorRegister("Mật khẩu nhập lại không khớp");
      return;
    }

    if (!isAgreed) {
      setErrorRegister("Bạn phải đồng ý với điều khoản sử dụng");
      return;
    }

    setIsLoadingRegister(true);

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

      setSuccessRegister("Đăng ký thành công! Đang chuyển hướng...");

      // Redirect
      setTimeout(() => {
        if (response.user.roles.includes("ADMIN")) {
          navigate("/admin/dashboard");
        } else {
          navigate(routesConfig.home);
        }
      }, 1500);
    } catch (error: any) {
      console.error("Register failed:", error);

      if (error.response?.status === 409) {
        setErrorRegister("Tên đăng nhập hoặc email đã tồn tại");
      } else if (error.response?.status === 400) {
        setErrorRegister("Thông tin đăng ký không hợp lệ");
      } else {
        setErrorRegister("Đăng ký thất bại. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoadingRegister(false);
    }
  };

  // Xử lý đăng nhập
  const handleLogin = async () => {
    setErrorLogin("");

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setErrorLogin("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setIsLoadingLogin(true);

    try {
      const requestData: LoginRequest = {
        username: loginData.username.trim(),
        password: loginData.password,
      };

      const response = await authServices.loginAsync(requestData);

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

      // Redirect
      if (response.user.roles.includes("ADMIN")) {
        navigate("/admin/dashboard");
      } else {
        navigate(routesConfig.home);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      setErrorLogin("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login - Coming soon");
    alert("Tính năng đăng nhập Google sẽ sớm được cập nhật!");
  };

  return (
    <>
      <Header />
      <div className="login-register-container">
        <div className="form-wrapper">
          {/* FORM ĐĂNG NHẬP */}
          <div className="form-box form-login">
          <h2 className="form-title">Đăng nhập</h2>

          {errorLogin && (
            <div className="error-message">{errorLogin}</div>
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

          <div className="forgot-password">Quên mật khẩu</div>

          <div className="remember">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember" style={{ marginBottom: 0 }}>Ghi nhớ đăng nhập</label>
          </div>

          <button 
            className="btn-green" 
            onClick={handleLogin}
            disabled={isLoadingLogin}
          >
            {isLoadingLogin ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="or-text">Or</div>

          <button className="btn-google" onClick={handleGoogleLogin}>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
            />
            Login with Google
          </button>
        </div>

        {/* FORM ĐĂNG KÝ */}
        <div className="form-box form-register">
          <h2 className="form-title">Đăng ký</h2>

          <p className="notice">
            <span className="text-green">
              Chú ý: Email phải có @, mật khẩu phải có cả chữ và số (tối thiểu 6 ký tự)
            </span>
          </p>

          {errorRegister && (
            <div className="error-message">{errorRegister}</div>
          )}

          {successRegister && (
            <div className="success-message">{successRegister}</div>
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
            disabled={!isAgreed || isLoadingRegister}
          >
            {isLoadingRegister ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
