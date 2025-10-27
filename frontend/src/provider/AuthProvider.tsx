import AuthContext from "@contexts/AuthContext.tsx";
import { type ReactNode, useEffect, useState } from "react";
import type { User } from "@models/modelResponse/LoginResponse.tsx";
import Cookies from "js-cookie";
import { authServices } from "@services/AuthServices.ts";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromServer = async () => {
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");

      if (accessToken || refreshToken) {
        try {
          const userData = await authServices.getCurrentUserAsync();
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          logout();
        }
      }

      setLoading(false);
    };

    void loadUserFromServer();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  };

  const value = {
    isLoggedIn,
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
