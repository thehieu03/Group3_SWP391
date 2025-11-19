import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@components/Button/Button.tsx";
import routesConfig from "@config/routesConfig.ts";
import { authServices } from "@services/AuthServices.ts";
import type { RegisterRequest } from "@models/modelRequest/RegisterRequest";
import { useAuth } from "@hooks/useAuth.tsx";
import Cookies from "js-cookie";

const RegisterForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRegisterUsername(e.target.value);
      setRegisterError("");
    },
    []
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRegisterEmail(e.target.value);
      setRegisterError("");
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRegisterPassword(e.target.value);
      setRegisterError("");
    },
    []
  );

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(e.target.value);
      setRegisterError("");
    },
    []
  );

  const handleAgreeTermsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAgreeTerms(e.target.checked);
    },
    []
  );

  const handleAgreePolicyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAgreePolicy(e.target.checked);
    },
    []
  );

  const handleRegister = useCallback(async () => {
    setRegisterError("");
    setRegisterSuccess("");

    if (
      !registerUsername.trim() ||
      !registerEmail.trim() ||
      !registerPassword.trim() ||
      !confirmPassword.trim()
    ) {
      setRegisterError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!agreeTerms || !agreePolicy) {
      setRegisterError("Vui lòng đồng ý với điều khoản và chính sách");
      return;
    }

    setIsRegisterLoading(true);

    try {
      const registerData: RegisterRequest = {
        username: registerUsername.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        confirmPassword: confirmPassword,
      };

      const response = await authServices.registerAsync(registerData);
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

      setRegisterSuccess("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => {
        navigate(routesConfig.home);
      }, 1500);
    } catch (error: unknown) {
      setRegisterError(
        error instanceof Error
          ? error.message
          : "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsRegisterLoading(false);
    }
  }, [
    registerUsername,
    registerEmail,
    registerPassword,
    confirmPassword,
    agreeTerms,
    agreePolicy,
    login,
    navigate,
  ]);

  const errorMessageMemo = useMemo(() => {
    if (!registerError) return null;
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
        {registerError}
      </div>
    );
  }, [registerError]);

  const successMessageMemo = useMemo(() => {
    if (!registerSuccess) return null;
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
        {registerSuccess}
      </div>
    );
  }, [registerSuccess]);

  const isFormValid = useMemo(() => {
    return (
      registerUsername.trim() &&
      registerEmail.trim() &&
      registerPassword.trim() &&
      confirmPassword.trim() &&
      registerPassword === confirmPassword &&
      registerPassword.length >= 6 &&
      agreeTerms &&
      agreePolicy
    );
  }, [
    registerUsername,
    registerEmail,
    registerPassword,
    confirmPassword,
    agreeTerms,
    agreePolicy,
  ]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return registerPassword === confirmPassword;
  }, [registerPassword, confirmPassword]);

  const passwordLengthValid = useMemo(() => {
    if (!registerPassword) return true;
    return registerPassword.length >= 6;
  }, [registerPassword]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Đăng ký
      </h2>

      {errorMessageMemo}
      {successMessageMemo}

      <div className="mb-4">
        <p className="text-sm text-green-600">
          Chú ý: Nếu bạn sử dụng các chương trình Bypass Captcha có thể không
          đăng ký tài khoản được.
        </p>
      </div>

      <div className="space-y-4">
        {/* Row 1: Tài khoản và Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tài khoản
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập tên tài khoản"
              value={registerUsername}
              onChange={handleUsernameChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập email của bạn"
              value={registerEmail}
              onChange={handleEmailChange}
            />
          </div>
        </div>

        {/* Row 2: Mật khẩu và Nhập lại mật khẩu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                registerPassword && !passwordLengthValid
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
              placeholder="Nhập mật khẩu"
              value={registerPassword}
              onChange={handlePasswordChange}
            />
            {registerPassword && !passwordLengthValid && (
              <p className="text-xs text-red-500 mt-1">
                Mật khẩu phải có ít nhất 6 ký tự
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                confirmPassword && !passwordsMatch
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500 mt-1">
                Mật khẩu xác nhận không khớp
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={handleAgreeTermsChange}
              className="mt-1 mr-2"
            />
            <span className="text-sm text-gray-600">
              Tôi đã đọc và đồng ý với{" "}
              <a
                href="#"
                className="text-green-600 hover:text-green-700 underline"
                onClick={(e) => e.preventDefault()}
              >
                Điều khoản sử dụng Tạp Hóa MMO
              </a>
            </span>
          </label>
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={agreePolicy}
              onChange={handleAgreePolicyChange}
              className="mt-1 mr-2"
            />
            <span className="text-sm text-gray-600">
              Tôi đã đọc và đồng ý với{" "}
              <a
                href="#"
                className="text-green-600 hover:text-green-700 underline"
                onClick={(e) => e.preventDefault()}
              >
                Chính sách sử dụng Tạp Hóa MMO
              </a>
            </span>
          </label>
        </div>

        <Button
          className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleRegister}
          disabled={isRegisterLoading || !isFormValid}
        >
          {isRegisterLoading ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </div>
    </div>
  );
};

export default RegisterForm;
