import axios from "axios";
import { toast } from "react-toastify";
import axiosRetry from "axios-retry";
//SEARCH: axios npm github

// Set config defaults when creating the instance
const instance = axios.create({
  // baseURL: "http://localhost:8080",
  baseURL: process.env.REACT_APP_BACKEND_URL,
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
      `${process.env.REACT_APP_BACKEND_URL}/api/refreshToken`,
      {
        refresh_Token: refreshToken,
      }
    );

    console.log(">>>access_Token: ", response);
    const access_Token = response.data.DT.newAccessToken;
    const refresh_Token = response.data.DT.newRefreshToken;

    // Cập nhật token mới vào localStorage
    localStorage.setItem("access_Token", access_Token);
    localStorage.setItem("refresh_Token", refresh_Token);

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
    const status = error.response?.status || 500;
    switch (status) {
      // authentication (token related issues)
      case 401: {
        // check quyền từ context chuyển qua
        if (
          window.location.pathname !== "/" &&
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          console.log(">>>check error 401: ", error.response.data); // SEARCH: axios get error body
          toast.error("Unauthorized the user. please login ... ");
          // window.location.href("/login");
        }

        return error.response.data; //getUserAccount response data(BE) nhưng bị chặn bên res(FE) dù đúng hay sai khi fetch account
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
          // window.location.href = "/login"; // Chuyển hướng về trang đăng nhập nếu cần
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
