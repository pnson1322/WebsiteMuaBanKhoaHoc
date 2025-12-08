import axios from "axios";
import logger from "../utils/logger";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // ✅ dùng biến môi trường
  withCredentials: true,
});

logger.info("AXIOS_INSTANCE", "Axios instance created", {
  baseURL: import.meta.env.VITE_BASE_URL,
});

instance.interceptors.request.use(
  (config) => {
    // ✅ Ưu tiên accessToken, fallback về token
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    logger.debug(
      "AXIOS_REQUEST",
      `${config.method?.toUpperCase()} ${config.url}`,
      {
        hasToken: !!token,
        url: config.url,
        method: config.method,
      }
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error("AXIOS_REQUEST_ERROR", "Request interceptor error", error);
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const AUTH_WHITELIST = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/Course", // ✅ Public course list - không cần auth
  "/api/auth/refresh-token", // ✅ Refresh token endpoint
];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (response) => {
    logger.debug("AXIOS_RESPONSE", `Success: ${response.config.url}`, {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  async (error) => {
    logger.warn("AXIOS_RESPONSE_ERROR", "Response error detected", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    });
    const originalRequest = error.config || {};
    const requestUrl = originalRequest.url || "";
    const isAuthRequest = AUTH_WHITELIST.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    // 🔍 Debug logging để kiểm tra whitelist
    if (error.response?.status === 401) {
      logger.debug("AUTH_401_CHECK", "Checking if request is whitelisted", {
        url: requestUrl,
        isAuthRequest,
        whitelist: AUTH_WHITELIST,
      });
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      // ✅ Không thử refresh nếu đang ở login page hoặc không có refresh token
      const isLoginPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";
      const hasRefreshToken = true;
      //   document.cookie.includes("refreshToken") ||
      //   localStorage.getItem("refreshToken");

      if (isLoginPage || !hasRefreshToken) {
        logger.warn(
          "AUTH_401_SKIP_REFRESH",
          "Skipping token refresh - on login page or no refresh token",
          {
            isLoginPage,
            hasRefreshToken,
            url: requestUrl,
          }
        );
        return Promise.reject(error);
      }

      logger.warn("AUTH_401_DETECTED", "Unauthorized request detected", {
        url: requestUrl,
        isAuthRequest,
        isRefreshing,
      });

      if (isRefreshing) {
        logger.info("AUTH_QUEUE", "Adding request to refresh queue", {
          url: requestUrl,
        });
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      logger.info("AUTH_REFRESH_START", "Starting token refresh", {
        url: requestUrl,
      });

      try {
        // ✅ Fix URL construction
        const baseURL =
          import.meta.env.VITE_BASE_URL || "http://localhost:5230/";
        const refreshURL = baseURL.endsWith("/")
          ? `${baseURL}api/auth/refresh-token`
          : `${baseURL}/api/auth/refresh-token`;

        const res = await axios.post(refreshURL, {}, { withCredentials: true });

        const newToken = res.data.token || res.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("token", newToken); // Backward compatibility

        logger.info("AUTH_REFRESH_SUCCESS", "Token refreshed successfully", {
          hasNewToken: !!newToken,
        });

        instance.defaults.headers.common["Authorization"] =
          "Bearer " + newToken;
        processQueue(null, newToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = "Bearer " + newToken;
        return instance(originalRequest);
      } catch (err) {
        logger.error("AUTH_REFRESH_FAILED", "Token refresh failed", {
          error: err.message,
          status: err.response?.status,
        });

        processQueue(err, null);
        isRefreshing = false;

        // ✅ Chỉ redirect nếu KHÔNG đang ở login page
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/register") {
          logger.warn(
            "AUTH_CLEAR_STORAGE",
            "Clearing auth-related localStorage",
            {
              from: currentPath,
            }
          );

          // ✅ Chỉ clear auth keys, giữ lại cart, favorites
          const authKeys = [
            "token",
            "accessToken",
            "refreshToken",
            "isLoggedIn",
            "currentUser",
          ];
          authKeys.forEach((key) => localStorage.removeItem(key));

          logger.warn("AUTH_REDIRECT_TO_LOGIN", "Redirecting to login page", {
            from: currentPath,
          });

          // ✅ Sử dụng setTimeout để tránh blocking
          setTimeout(() => {
            window.location.href = "/login?session=expired";
          }, 100);
        } else {
          logger.debug(
            "AUTH_ALREADY_ON_LOGIN",
            "Already on login page - skipping redirect"
          );
        }

        return Promise.reject(err);
      }
    } else {
      console.log("Non-401 error or whitelisted request:", {
        status: error.response?.status,
        url: requestUrl,
      });
    }

    return Promise.reject(error);
  }
);

export default instance;
