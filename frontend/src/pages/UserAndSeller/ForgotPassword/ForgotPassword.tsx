import { useMemo } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm.tsx";

const ForgotPassword = () => {
  const containerClasses = useMemo(
    () =>
      "bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 py-12 min-h-screen flex items-center",
    []
  );

  return (
    <div className={containerClasses}>
      <div className="w-full max-w-md mx-auto px-4">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPassword;
