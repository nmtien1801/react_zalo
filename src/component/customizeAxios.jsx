import axios from "axios";
import { toast } from "react-toastify";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Cài đặt header mặc định
instance.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("access_Token")}`;

// Interceptor cho request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_Token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Hàm làm mới token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_Token");

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/refreshToken`,
      { refresh_Token: refreshToken }
    );

    const { newAccessToken, newRefreshToken } = response.data.DT;
    localStorage.setItem("access_Token", newAccessToken);
    localStorage.setItem("refresh_Token", newRefreshToken);

    return newAccessToken;
  } catch (error) {
    console.error("Refresh token failed:", error.response?.data || error.message);
    localStorage.removeItem("access_Token");
    localStorage.removeItem("refresh_Token");
    return null;
  }
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

let isRefreshing = false;
let failedQueue = [];

instance.interceptors.response.use(
  (response) => (response && response.data ? response.data : response),
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status || 500;

    switch (status) {
      // Xử lý lỗi 401 (token hết hạn)
      case 401: {
        const path = window.location.pathname;

        if (path === "/" || path === "/login" || path === "/register" || path === "/forgot-password") {
          console.warn("401 on auth page, skip refresh");
          return Promise.reject(error); 
        }

        if (!originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return instance(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          let newAccessToken = await refreshAccessToken();

          if (!newAccessToken) {
            window.location.href = '/login';
            return Promise.reject(error);
          }

          instance.defaults.headers['Authorization'] = 'Bearer ' + newAccessToken;
          processQueue(null, newAccessToken);

          return instance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          // handle logout
          localStorage.removeItem('access_Token');
          localStorage.removeItem('refresh_Token');
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }

      }

      case 400: {
        return error.response.data; // Bad request
      }

      // Xử lý lỗi 403 (không có quyền)
      case 403: {
        toast.error("Bạn không có quyền truy cập tài nguyên này.");
        return Promise.reject(error);
      }

      // Xử lý các lỗi khác
      case 404: {
        return Promise.reject(error); // Not found
      }
      case 409: {
        return Promise.reject(error); // Conflict
      }
      case 422: {
        return Promise.reject(error); // Unprocessable
      }
      default: {
        return Promise.reject(error); // Lỗi server bất ngờ
      }
    }
  }
);

export default instance;