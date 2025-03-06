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

// Cấu hình retry -> khi sử dụng refresh token
axiosRetry(instance, {
  retries: 3, // Số lần retry tối đa
  retryDelay: (retryCount) => {
    console.log(`Retry attempt: ${retryCount}`);
    return retryCount * 100; // Thời gian delay giữa các lần retry (ms)
  },
  retryCondition: (error) => {
    // Điều kiện để thực hiện retry -> retry refresh token khi bất đồng bộ
    return error.response?.status === 400; // Retry nếu lỗi là 400
  },
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

// search: How can you use axios interceptors?
// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response && response.data ? response.data : response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
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

      // bad request
      case 400: {
        return Promise.reject(error);
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
