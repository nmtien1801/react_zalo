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

const logoutUserService = () => {
  return customizeAxios.post("/api/logout");
};

const doGetAccountService = () => {
  return customizeAxios.get("/api/account");
};

export {
  loginService,
  registerService,
  logoutUserService,
  doGetAccountService
};
