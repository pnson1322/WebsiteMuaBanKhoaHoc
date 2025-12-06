import React, { createContext, useContext, useState, useEffect } from "react";
import { userAPI } from "../services/userAPI";
import logger from "../utils/logger";

const AuthContext = createContext();

// 🔗 Import để có thể reset/sync user data khi login/logout
let appDispatchContext = null;
export const setAppDispatchContext = (context) => {
  appDispatchContext = context;
};

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
  // ✅ THÊM: State để lưu token, giúp React re-render khi token thay đổi
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuthStatus = async () => {
      logger.info(
        "AUTH_CHECK_START",
        "Checking authentication status on app start"
      );

      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";
        const currentUser = localStorage.getItem("currentUser");

        // ✅ Cập nhật state token ngay lúc khởi động
        setAccessToken(token);

        logger.debug("AUTH_CHECK_STORAGE", "LocalStorage auth data", {
          hasToken: !!token,
          isLoggedIn: loggedIn,
          hasUserData: !!currentUser,
        });

        if (loggedIn && token) {
          try {
            logger.info("AUTH_FETCH_USER", "Fetching user details from API");
            const userData = await userAPI.getUserDetail();

            logger.info(
              "AUTH_FETCH_SUCCESS",
              "User data fetched successfully",
              {
                userId: userData.id,
                email: userData.email,
                role: userData.role,
              }
            );

            setIsLoggedIn(true);
            setUser(userData);
            localStorage.setItem("currentUser", JSON.stringify(userData));
          } catch (error) {
            logger.error(
              "AUTH_FETCH_FAILED",
              "Failed to fetch user data - clearing auth",
              {
                error: error.message,
                status: error.response?.status,
              }
            );
            console.error("Error fetching user data:", error);
            clearAuth();
          }
        } else if (loggedIn && currentUser) {
          logger.warn(
            "AUTH_FALLBACK",
            "Using cached user data from localStorage"
          );
          setIsLoggedIn(true);
          setUser(JSON.parse(currentUser));
        } else {
          logger.info("AUTH_NOT_LOGGED_IN", "User is not logged in");
          // Đảm bảo clear sạch nếu không khớp
          clearAuth();
        }
      } catch (error) {
        logger.error("AUTH_CHECK_ERROR", "Error during auth status check", {
          error: error.message,
        });
        console.error("Error checking auth status:", error);
        clearAuth();
      } finally {
        logger.debug("AUTH_CHECK_COMPLETE", "Auth check completed");
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const clearAuth = () => {
    logger.warn("AUTH_CLEAR", "Clearing authentication state", {
      wasLoggedIn: isLoggedIn,
      hadUser: !!user,
    });

    setIsLoggedIn(false);
    setUser(null);
    setAccessToken(null); // ✅ Clear state token

    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    logger.info("AUTH_CLEAR_COMPLETE", "Auth state cleared successfully");
  };

  const login = async (userData, tokens) => {
    logger.info("AUTH_LOGIN", "User logging in", {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      hasAccessToken: !!tokens?.accessToken,
      hasRefreshToken: !!tokens?.refreshToken,
    });

    setIsLoggedIn(true);
    setUser(userData);

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", JSON.stringify(userData));

    if (tokens?.accessToken) {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("token", tokens.accessToken); // Backward compatibility
      setAccessToken(tokens.accessToken); // ✅ Cập nhật state token
    }
    if (tokens?.refreshToken) {
      localStorage.setItem("refreshToken", tokens.refreshToken);
    }

    try {
      const fullUserData = await userAPI.getUserDetail();
      setIsLoggedIn(true);
      setUser(fullUserData);
      localStorage.setItem("currentUser", JSON.stringify(fullUserData));
    } catch (error) {
      console.error("Login success but failed to fetch details", error);
      const fallbackUser = { ...userData };
      setIsLoggedIn(true);
      setUser(fallbackUser);
      localStorage.setItem("currentUser", JSON.stringify(fallbackUser));
    }

    if (appDispatchContext?.syncUserData) {
      setTimeout(() => {
        appDispatchContext.syncUserData();
        logger.info("AUTH_LOGIN_SYNC_DATA", "Syncing user data from backend");
      }, 100);
    }

    logger.info("AUTH_LOGIN_COMPLETE", "Login completed successfully");
  };

  const logout = () => {
    logger.info("AUTH_LOGOUT", "User logging out", {
      userId: user?.id,
      email: user?.email,
    });

    if (appDispatchContext?.resetUserData) {
      appDispatchContext.resetUserData();
      logger.info("AUTH_LOGOUT_RESET_DATA", "User data reset to guest state");
    }

    clearAuth();
    logger.info("AUTH_LOGOUT_COMPLETE", "Logout completed");
  };

  const updateUser = (updates) => {
    logger.debug("AUTH_UPDATE_USER", "Updating user data", {
      updates,
    });

    setUser((prev) => {
      if (!prev) {
        logger.warn(
          "AUTH_UPDATE_FAILED",
          "Cannot update user - no user logged in"
        );
        return prev;
      }

      const nextUser = { ...prev, ...updates };
      try {
        localStorage.setItem("currentUser", JSON.stringify(nextUser));
        logger.info("AUTH_UPDATE_SUCCESS", "User data updated successfully");
      } catch (error) {
        logger.error(
          "AUTH_UPDATE_ERROR",
          "Error persisting updated user",
          error
        );
        console.error("Error persisting updated user:", error);
      }
      return nextUser;
    });
  };

  const refreshUser = async () => {
    logger.info("AUTH_REFRESH_USER", "Refreshing user data from API");
    try {
      const userData = await userAPI.getUserDetail();
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));

      // Đảm bảo accessToken state đồng bộ với localStorage (phòng hờ)
      const currentToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (currentToken !== accessToken) {
        setAccessToken(currentToken);
      }

      logger.info(
        "AUTH_REFRESH_USER_SUCCESS",
        "User data refreshed successfully",
        { userId: userData.id }
      );
      return userData;
    } catch (error) {
      logger.error("AUTH_REFRESH_USER_FAILED", "Failed to refresh user data", {
        error: error.message,
      });
      console.error("Error refreshing user data:", error);
      throw error;
    }
  };

  const value = {
    isLoggedIn,
    user,
    accessToken, // ✅ QUAN TRỌNG: Truyền accessToken ra ngoài
    token: accessToken, // Alias: truyền thêm tên 'token' cho chắc ăn
    login,
    logout,
    updateUser,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;