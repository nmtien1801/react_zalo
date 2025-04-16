import customizeAxios from "../component/customizeAxios";

const getUserByPhoneService = (phone) => {
  return customizeAxios.get(`/user/getUserByPhone/${phone}`);
};

export { getUserByPhoneService };