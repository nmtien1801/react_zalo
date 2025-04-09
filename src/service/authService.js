import axios from "axios";

import customizeAxios from "../component/customizeAxios";

const loginService = (phoneNumber, password) => {
  return customizeAxios.post("/api/login", {
    phoneNumber,
    password,
  });
};

const registerService = (formData) => {
  return customizeAxios.post("/api/register", {
    formData,
  });
};

const doGetAccountService = () => {
  return customizeAxios.get("/api/account");
};

const updateAvatarService = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return customizeAxios.put("/api/user/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Đặt header để gửi file
    },
  });
};

const logoutUserService = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_Token");

    if (!refreshToken) {
      throw new Error("Refresh token is missing");
    }

    const response = await customizeAxios.post("/api/logout", {
      refresh_Token: refreshToken,
    });

    // Xóa token khỏi localStorage nếu logout thành công
    if (response.EC === 0) {
      localStorage.removeItem("access_Token");
      localStorage.removeItem("refresh_Token");
    }

    return response; // Trả về phản hồi từ server
  } catch (error) {
    console.error("Error in logoutUserService:", error);
    throw error; // Ném lỗi để xử lý ở nơi gọi hàm
  }
};

export {
  loginService,
  registerService,
  logoutUserService,
  doGetAccountService,
  updateAvatarService
};
