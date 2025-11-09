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

          const googleUserInfo = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            }
          ).then((res) => res.json());

          const response = await authServices.loginOrRegisterWithGoogleAsync({
            id: googleUserInfo.sub,
            email: googleUserInfo.email,
            name: googleUserInfo.name,
            picture: googleUserInfo.picture,
          });

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

          const currentUser = await authServices.getCurrentUserAsync();
          login(currentUser);

          if (currentUser.roles.includes("ADMIN")) {
            navigate("/admin/dashboard");
          } else {
            navigate(routesConfig.home);
          }
        } catch {
          setLoginError("Đăng nhập với Google thất bại");
        } finally {
          setIsLoginLoading(false);
        }
      },
      [login, navigate]
    ),
    onError: useCallback(() => {
      setLoginError("Đăng nhập với Google thất bại");
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
