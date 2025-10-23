import { createContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "../models/modelResponse/LoginResponse";
import Cookies from "js-cookie";
import { authServices } from "../services/AuthServices";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromServer = async () => {
      try {
        console.log("🔍 Checking authentication...");
        const accessToken = Cookies.get("accessToken");
        const refreshToken = Cookies.get("refreshToken");

        if (accessToken || refreshToken) {
          console.log("🔑 Token found, loading user...");
          try {
            // Set timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Auth timeout")), 5000)
            );
            
            const userData = await Promise.race([
              authServices.getCurrentUserAsync(),
              timeoutPromise
            ]) as any;
            
            setUser(userData);
            setIsLoggedIn(true);
            console.log("✅ User loaded:", userData);
          } catch (error: any) {
            console.error("❌ Error loading user:", error.message);
            // Clear invalid tokens
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            setUser(null);
            setIsLoggedIn(false);
          }
        } else {
          console.log("ℹ️ No token found, user not logged in");
        }
      } catch (error) {
        console.error("❌ Fatal error in auth check:", error);
      } finally {
        console.log("✓ Auth check complete, setting loading to false");
        setLoading(false);
      }
    };

    // Always set loading to false after 6 seconds as fallback
    const fallbackTimer = setTimeout(() => {
      console.log("⚠️ Fallback: forcing loading to false");
      setLoading(false);
    }, 6000);

    loadUserFromServer();

    return () => clearTimeout(fallbackTimer);
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

export default AuthContext;
