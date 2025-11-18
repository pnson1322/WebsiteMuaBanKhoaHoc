import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL, // ✅ dùng biến môi trường
    withCredentials: true,
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const AUTH_WHITELIST = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/verify-email",
];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {};
        const requestUrl = originalRequest.url || "";
        const isAuthRequest = AUTH_WHITELIST.some((endpoint) =>
            requestUrl.includes(endpoint)
        );

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            if (isRefreshing) {
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

            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}api/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const newToken = res.data.token;
                localStorage.setItem("token", newToken);

                instance.defaults.headers.common["Authorization"] = "Bearer " + newToken;
                processQueue(null, newToken);
                isRefreshing = false;

                originalRequest.headers.Authorization = "Bearer " + newToken;
                return instance(originalRequest);
            } catch (err) {
                processQueue(err, null);
                isRefreshing = false;
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
