import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Button from "@components/Button/Button.tsx";
import routesConfig from "@config/routesConfig.ts";
import { authServices } from "@services/AuthServices.ts";
import type { LoginRequest } from "@models/modelRequest/LoginRequest";
import { useAuth } from "@hooks/useAuth.tsx";
import Cookies from "js-cookie";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLoginEmail(e.target.value);
      setLoginError("");
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLoginPassword(e.target.value);
      setLoginError("");
    },
    []
  );

  const handleRememberMeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRememberMe(e.target.checked);
    },
    []
  );

  const handleLogin = useCallback(async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoginLoading(true);
    setLoginError("");

    try {
      const loginData: LoginRequest = {
        username: loginEmail.trim(),
        password: loginPassword,
      };

      const response = await authServices.loginAsync(loginData);
      Cookies.set("accessToken", response.accessToken, {
        expires: rememberMe ? 30 : 7,
        secure: true,
        sameSite: "strict",
      });

      Cookies.set("refreshToken", response.refreshToken, {
        expires: rememberMe ? 90 : 30,
        secure: true,
        sameSite: "strict",
      });
      login(response.user);

      if (response.user.roles.includes("ADMIN")) {
        navigate("/admin/dashboard");
      } else {
        navigate(routesConfig.home);
      }
    } catch {
      setLoginError("Email hoặc mật khẩu không đúng!");
    } finally {
      setIsLoginLoading(false);
    }
  }, [loginEmail, loginPassword, rememberMe, login, navigate]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: useCallback(
      async (tokenResponse: { access_token: string }) => {
        try {
          setIsLoginLoading(true);
          setLoginError("");

          // Lấy thông tin từ Google API
          let googleUserInfo;
          try {
            const googleResponse = await fetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              }
            );

            if (!googleResponse.ok) {
              throw new Error("Failed to fetch Google user info");
            }

            googleUserInfo = await googleResponse.json();
          } catch{
            // TC-GL-004 Scenario 4b: Error when Fetching Information from Google API
            setLoginError("Không thể lấy thông tin từ Google. Vui lòng thử lại!");
            return;
          }

          // Gọi API backend để đăng nhập/đăng ký
          let response;
          try {
            response = await authServices.loginOrRegisterWithGoogleAsync({
              id: googleUserInfo.sub,
              email: googleUserInfo.email,
              name: googleUserInfo.name,
              picture: googleUserInfo.picture,
            });
          } catch  {
            // TC-GL-004 Scenario 4c: Error when Calling Backend API
            setLoginError("Đăng nhập với Google thất bại");
            return;
          }

          // Lưu tokens vào cookies
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

          // Lấy thông tin user hiện tại
          const currentUser = await authServices.getCurrentUserAsync();
          login(currentUser);

          // TC-GL-001, TC-GL-002, TC-GL-003: Successful login/registration/linking
          // Điều hướng theo role
          if (currentUser.roles.includes("ADMIN")) {
            navigate("/admin/dashboard");
          } else {
            navigate(routesConfig.home);
          }
        } catch  {
          // TC-GL-004 Scenario 4d: Network Error/No Connection
          setLoginError("Đăng nhập với Google thất bại");
        } finally {
          setIsLoginLoading(false);
        }
      },
      [login, navigate]
    ),
    onError: useCallback(() => {
      // TC-GL-004 Scenario 4a: User Cancels Popup
      setLoginError("Đăng nhập với Google đã bị hủy");
    }, []),
  });

  const errorMessageMemo = useMemo(() => {
    if (!loginError) return null;
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
        {loginError}
      </div>
    );
  }, [loginError]);

  const isFormValid = useMemo(() => {
    return loginEmail.trim() && loginPassword.trim();
  }, [loginEmail, loginPassword]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Đăng nhập
      </h2>

      {errorMessageMemo}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập email của bạn"
            value={loginEmail}
            onChange={handleEmailChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập mật khẩu"
            value={loginPassword}
            onChange={handlePasswordChange}
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMeChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
          <Button
            to={routesConfig.forgotPassword}
            className="text-sm text-green-600 hover:text-green-700"
          >
            Quên mật khẩu
          </Button>
        </div>

        <Button
          className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={isLoginLoading || !isFormValid}
        >
          {isLoginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>

        <div className="text-center text-gray-500 my-4">Or</div>

        <Button
          className="w-full bg-blue-500 text-white py-3 rounded-md font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={() => handleGoogleLogin()}
          disabled={isLoginLoading}
        >
          <FontAwesomeIcon icon={faGoogle} />
          Login with Google
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
