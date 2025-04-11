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

const sendCodeService = (email) => {
  return customizeAxios.post("/api/send-code", {
    email,
  });
};

const resetPasswordService = (email, code, password) => {
  return customizeAxios.post("/api/reset-password", {
    email,
    code,
    password,
  });
};

const changePasswordService = (phone, currentPassword, newPassword) => {
  return customizeAxios.post("/api/changePassword", {
    phone,
    currentPassword,
    newPassword,
  });
};

const verifyEmailService = (email) => {
  return customizeAxios.post("/api/verifyEmail", { email });
};

export {
  loginService,
  registerService,
  logoutUserService,
  doGetAccountService,
  sendCodeService,
  resetPasswordService,
  changePasswordService,
  verifyEmailService,
};
