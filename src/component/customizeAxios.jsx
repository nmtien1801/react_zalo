import axios from "axios";
import { toast } from "react-toastify";
import axiosRetry from "axios-retry";
//SEARCH: axios npm github

// Set config defaults when creating the instance
const instance = axios.create({
  // baseURL: "http://localhost:8080",
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // để FE có thể nhận cookie từ BE
});

// Alter defaults after instance has been created
//Search: what is brearer token
instance.defaults.headers.common[
  "Authorization"
] = `Bearer ${localStorage.getItem("access_Token")}`; // sửa localStore or cookie

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_Token");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/refreshToken`,
      {
        refresh_Token: refreshToken,
      }
    );

    const access_Token = response.data.DT.newAccessToken;
    const refresh_Token = response.data.DT.newRefreshToken;

    // Cập nhật token mới vào localStorage
    localStorage.setItem("access_Token", access_Token);
    localStorage.setItem("refresh_Token", refresh_Token);

    instance.defaults.headers.common["Authorization"] = `Bearer ${access_Token}`;

    return access_Token;
  } catch (error) {
    console.error("Refresh token failed:", error);
    return null;
  }
};

// search: How can you use axios interceptors?
// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response && response.data ? response.data : response;
  },
  async function (error) {
    const originalRequest = error.config;
    const status = error.response?.status || 500;
    switch (status) {
      // authentication (token related issues)
      case 401: {


        // Chỉ log khi không có token mới (refresh thất bại)
        if (
          window.location.pathname !== "/" &&
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          console.log(">>>check error 401: ", error.response.data);
          toast.error("Unauthorized the user. Please login ... ");

          // Nếu request này đã từng retry rồi thì không retry nữa
          if (originalRequest._retry) {
            toast.error("Unauthorized. Please login again.");
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          const newToken = await refreshAccessToken();

          if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        }

        localStorage.removeItem("access_Token");
        toast.error("Phiên đăng nhập hết hạn");

        return error.response.data;
      }

      // forbidden (permission related issues)
      case 403: {
        toast.error(`you don't permission to access this resource`);
        return Promise.reject(error);
      }

      // bad request => refresh token
      case 400: {
        const newToken = await refreshAccessToken();

        if (newToken) {
          error.config.headers["Authorization"] = `Bearer ${newToken}`;

          return instance(error.config);
        } else {
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
          localStorage.removeItem("access_Token");
        }
      }

      // not found get /post / delete /put
      case 404: {
        return Promise.reject(error);
      }

      // conflict
      case 409: {
        return Promise.reject(error);
      }

      // unprocessable
      case 422: {
        return Promise.reject(error);
      }

      // generic api error (server related) unexpected
      default: {
        return Promise.reject(error);
      }
    }
  }
);

export default instance;
