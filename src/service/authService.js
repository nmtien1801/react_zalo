import customizeAxios from "../component/setup/customizeAxios";

const loginService = (formData) => {
  return customizeAxios.post("/api/login", {
    formData,
  });
};

const registerNewUser = (formData) => {
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

export {loginService, registerNewUser, logoutUserService,doGetAccountService };
