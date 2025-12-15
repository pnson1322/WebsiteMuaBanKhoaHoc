import React, { createContext, useContext, useState, useEffect } from "react";
import { userAPI } from "../services/userAPI";
import logger from "../utils/logger";
import instance from "../services/axiosInstance"; // ✅ ADD: cần để set/clear Authorization

const AuthContext = createContext();

// 🔗 Import để có thể reset/sync user data khi login/logout
let appDispatchContext = null;
export const setAppDispatchContext = (context) => {
  appDispatchContext = context;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  // ✅ Helper: apply token to axios
  const applyTokenToAxios = (token) => {
    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete instance.defaults.headers.common["Authorization"];
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      logger.info(
        "AUTH_CHECK_START",
        "Checking authentication status on app start"
      );

      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";
        const currentUser = localStorage.getItem("currentUser");

        // ✅ set token state + axios header ngay khi app start
        setAccessToken(token);
        applyTokenToAxios(token);

        logger.debug("AUTH_CHECK_STORAGE", "LocalStorage auth data", {
          hasToken: !!token,
          isLoggedIn: loggedIn,
          hasUserData: !!currentUser,
        });

        if (loggedIn && token) {
          try {
            logger.info("AUTH_FETCH_USER", "Fetching user details from API");
            const userData = await userAPI.getUserDetail();

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
            clearAuth();
          }
        } else if (loggedIn && currentUser) {
          // ⚠️ trường hợp này thường xảy ra khi token thiếu -> không nên set logged in “ảo”
          // nhưng để giữ behavior cũ, vẫn fallback user; đồng thời KHÔNG set axios token vì không có token
          logger.warn(
            "AUTH_FALLBACK",
            "Using cached user data from localStorage"
          );
          setIsLoggedIn(true);
          setUser(JSON.parse(currentUser));
        } else {
          clearAuth();
        }
      } catch (error) {
        logger.error("AUTH_CHECK_ERROR", "Error during auth status check", {
          error: error.message,
        });
        clearAuth();
      } finally {
        setLoading(false);
        logger.debug("AUTH_CHECK_COMPLETE", "Auth check completed");
      }
    };

    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAuth = () => {
    logger.warn("AUTH_CLEAR", "Clearing authentication state", {
      wasLoggedIn: isLoggedIn,
      hadUser: !!user,
    });

    setIsLoggedIn(false);
    setUser(null);
    setAccessToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // ✅ FIX: clear axios header để logout xong không gọi API bằng token cũ
    // applyTokenToAxios(null);

    logger.info("AUTH_CLEAR_COMPLETE", "Auth state cleared successfully");
    delete instance.defaults.headers.common["Authorization"];
  };

  const login = async (userData, tokens) => {
    logger.info("AUTH_LOGIN", "User logging in", {
      userId: userData?.id,
      email: userData?.email,
      role: userData?.role,
      hasAccessToken: !!tokens?.accessToken,
      hasRefreshToken: !!tokens?.refreshToken,
    });

    // ✅ 1) persist auth flags first
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", JSON.stringify(userData));

    // ✅ 2) set token to storage + state + axios IMMEDIATELY (quan trọng nhất)
    const token = tokens?.accessToken;
    if (token) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("token", token); // backward compatibility
      setAccessToken(token);
      applyTokenToAxios(token);
    }

    if (tokens?.refreshToken) {
      localStorage.setItem("refreshToken", tokens.refreshToken);
    }

    // ✅ 3) update state (UI login)
    setIsLoggedIn(true);
    setUser(userData);

    // ✅ 4) fetch full detail (bây giờ axios đã có token nên sẽ không 401 giả)
    try {
      const fullUserData = await userAPI.getUserDetail();
      setUser(fullUserData);
      localStorage.setItem("currentUser", JSON.stringify(fullUserData));
    } catch (error) {
      // Không coi là “login fail”; chỉ log warning
      logger.warn(
        "AUTH_LOGIN_USERDETAIL_FAILED",
        "Login ok but failed to fetch user details",
        {
          error: error.message,
          status: error.response?.status,
        }
      );
    }

    // ✅ 5) sync AppContext ngay, không dùng setTimeout
    if (appDispatchContext?.syncUserData) {
      appDispatchContext.syncUserData(token);
      logger.info("AUTH_LOGIN_SYNC_DATA", "Syncing user data from backend");
    }

    logger.info("AUTH_LOGIN_COMPLETE", "Login completed successfully");
  };

  const logout = () => {
    logger.info("AUTH_LOGOUT", "User logging out", {
      userId: user?.id,
      email: user?.email,
    });

    // ✅ reset app data trước/hoặc sau đều được, nhưng QUAN TRỌNG là clear axios token
    if (appDispatchContext?.resetUserData) {
      appDispatchContext.resetUserData();
      logger.info("AUTH_LOGOUT_RESET_DATA", "User data reset to guest state");
    }

    clearAuth();
    logger.info("AUTH_LOGOUT_COMPLETE", "Logout completed");
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updates };
      localStorage.setItem("currentUser", JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const refreshUser = async () => {
    const userData = await userAPI.getUserDetail();
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));

    const currentToken =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (currentToken !== accessToken) {
      setAccessToken(currentToken);
      applyTokenToAxios(currentToken);
    }
    return userData;
  };

  const value = {
    isLoggedIn,
    user,
    accessToken,
    token: accessToken,
    login,
    logout,
    updateUser,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
