import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authServices } from "../../../services/AuthServices.tsx";
import type { RegisterRequest } from "../../../models/modelRequest/RegisterRequest.tsx";
import routesConfig from "../../../config/routesConfig.tsx";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

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
  const [countdown, setCountdown] = useState<number | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      navigate(routesConfig.login);
    }
  }, [countdown, navigate]);

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

      console.log("✅ [REGISTER] Sending request...", requestData);
      const response = await authServices.registerAsync(requestData);
      console.log("✅ [REGISTER] Response received:", response);
      console.log("✅ [REGISTER] User:", response.user);
      console.log("✅ [REGISTER] Access Token:", response.accessToken ? "✓" : "✗");
      console.log("✅ [REGISTER] Refresh Token:", response.refreshToken ? "✓" : "✗");

      // Kiểm tra response có đầy đủ dữ liệu không
      if (!response || !response.user) {
        console.error("❌ [REGISTER] Invalid response structure");
        throw new Error("Invalid response from server");
      }

      // Hiển thị thông báo thành công và bắt đầu countdown
      setSuccess("✅ Đăng ký thành công! Bạn đã được gán vai trò CUSTOMER.");
      setCountdown(3); // Đếm ngược từ 3 giây
    } catch (error: any) {
      console.error("❌ [REGISTER] Failed:", error);
      console.error("❌ [REGISTER] Response:", error.response);
      console.error("❌ [REGISTER] Data:", error.response?.data);
      console.error("❌ [REGISTER] Status:", error.response?.status);
      console.error("❌ [REGISTER] Headers:", error.response?.headers);

      if (error.response) {
        // Server trả về response (có status code)
        const status = error.response.status;
        const data = error.response.data;

        if (status === 409) {
          setError("❌ Tên đăng nhập hoặc email đã tồn tại");
        } else if (status === 400) {
          // Bad Request - validation errors
          if (data?.errors) {
            const errorMessages = Object.values(data.errors).flat().join(", ");
            setError(`❌ ${errorMessages}`);
          } else if (typeof data === 'string') {
            setError(`❌ ${data}`);
          } else {
            setError("❌ Thông tin đăng ký không hợp lệ");
          }
        } else if (status === 500) {
          setError(`❌ Lỗi server: ${data?.message || data || "Internal Server Error"}`);
        } else {
          setError(`❌ Lỗi không xác định (${status}): ${data?.message || data || error.message}`);
        }
      } else if (error.request) {
        // Request đã được gửi nhưng không nhận được response
        console.error("❌ [REGISTER] No response received:", error.request);
        setError("❌ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        // Lỗi khác (khi setup request)
        console.error("❌ [REGISTER] Request setup error:", error.message);
        setError(`❌ ${error.message}`);
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
            <div className="success-message">
              {success}
              {countdown !== null && countdown > 0 && (
                <div style={{ marginTop: "8px", fontSize: "13px" }}>
                  Chuyển đến trang đăng nhập trong {countdown} giây...
                </div>
              )}
            </div>
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
            disabled={!isAgreed || isLoading || countdown !== null}
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

