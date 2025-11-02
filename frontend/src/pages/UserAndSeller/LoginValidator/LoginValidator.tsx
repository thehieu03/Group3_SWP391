import { useMemo } from "react";
import LoginForm from "./LoginForm.tsx";
import RegisterForm from "./RegisterForm.tsx";

const LoginValidator = () => {
  const containerClasses = useMemo(() => "bg-gray-50 py-8", []);

  const gridClasses = useMemo(
    () => "grid grid-cols-1 lg:grid-cols-2 gap-8",
    []
  );

  return (
    <div className={containerClasses}>
      <div className="max-w-6xl mx-auto px-4">
        <div className={gridClasses}>
          <LoginForm />
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default LoginValidator;
