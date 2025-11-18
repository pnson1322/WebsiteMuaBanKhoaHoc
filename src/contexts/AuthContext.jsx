import React, { createContext, useContext, useState, useEffect } from "react";
import { userAPI } from "../services/userAPI";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";
        const currentUser = localStorage.getItem("currentUser");

        if (loggedIn && token) {
          // Nếu có token, fetch user data mới nhất từ API
          try {
            const userData = await userAPI.getUserDetail();
            setIsLoggedIn(true);
            setUser(userData);
            localStorage.setItem("currentUser", JSON.stringify(userData));
          } catch (error) {
            // Nếu token hết hạn hoặc invalid, clear auth
            console.error("Error fetching user data:", error);
            clearAuth();
          }
        } else if (loggedIn && currentUser) {
          // Fallback: dùng data từ localStorage nếu không có token
          setIsLoggedIn(true);
          setUser(JSON.parse(currentUser));
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const clearAuth = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const login = (userData, tokens) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", JSON.stringify(userData));

    // Lưu tokens nếu có
    if (tokens?.accessToken) {
      localStorage.setItem("accessToken", tokens.accessToken);
    }
    if (tokens?.refreshToken) {
      localStorage.setItem("refreshToken", tokens.refreshToken);
    }
  };

  const logout = () => {
    clearAuth();
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updates };
      try {
        localStorage.setItem("currentUser", JSON.stringify(nextUser));
      } catch (error) {
        console.error("Error persisting updated user:", error);
      }
      return nextUser;
    });
  };

  // Function để refresh user data từ API
  const refreshUser = async () => {
    try {
      const userData = await userAPI.getUserDetail();
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      throw error;
    }
  };

  const value = {
    isLoggedIn,
    user,
    login,
    logout,
    updateUser,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
