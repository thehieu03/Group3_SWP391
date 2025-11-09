import { useState, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faCheckCircle,
  faExclamationCircle,
  faArrowLeft,
  faPaperPlane,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import Button from "@components/Button/Button.tsx";
import routesConfig from "@config/routesConfig.ts";
import { authServices } from "@services/AuthServices.ts";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      setError("");
      setSuccess("");
    },
    []
  );

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const isFormValid = useMemo(() => {
    return email.trim() !== "" && validateEmail(email);
  }, [email, validateEmail]);

  const handleSubmit = useCallback(async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      setIsLoading(true);
      await authServices.forgotPasswordAsync(email.trim());
      setSuccess(
        "Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam)."
      );
      setEmail("");
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const axiosError = err.response as { data?: { message?: string } };
        setError(
          axiosError.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau."
        );
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, validateEmail]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && isFormValid && !isLoading) {
        void handleSubmit();
      }
    },
    [isFormValid, isLoading, handleSubmit]
  );

  const containerClasses = useMemo(
    () =>
      "bg-white p-10 rounded-2xl shadow-xl w-full max-w-md mx-auto border border-gray-100 transform transition-all duration-300 hover:shadow-2xl",
    []
  );

  const iconWrapperClasses = useMemo(
    () =>
      "w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-105",
    []
  );

  return (
    <div className={containerClasses}>
      {/* Icon Header */}
      <div className={iconWrapperClasses}>
        <FontAwesomeIcon icon={faLock} className="text-white text-3xl" />
      </div>

      {/* Title Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Quên mật khẩu</h2>
        <p className="text-gray-600 text-base leading-relaxed">
          Nhập email của bạn để nhận mật khẩu mới qua email
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md shadow-sm">
          <div className="flex items-start">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="text-red-500 mr-3 mt-0.5 flex-shrink-0"
            />
            <p className="text-sm text-red-700 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-md shadow-sm">
          <div className="flex items-start">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-green-500 mr-3 mt-0.5 flex-shrink-0 animate-bounce"
            />
            <p className="text-sm text-green-700 leading-relaxed">{success}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="mr-2 text-green-600"
            />
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
            </div>
            <input
              type="email"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="example@email.com"
              value={email}
              onChange={handleEmailChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} />
              <span>Gửi yêu cầu</span>
            </>
          )}
        </Button>

        <div className="text-center pt-4 border-t border-gray-200">
          <Button
            to={routesConfig.loginValidator}
            className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-200 inline-flex items-center gap-2 hover:gap-3"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Quay lại đăng nhập</span>
          </Button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="mr-1 text-green-500"
            />
            Chúng tôi sẽ gửi mật khẩu mới đến email của bạn trong vài phút
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
