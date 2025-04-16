import customizeAxios from "../component/customizeAxios";

const uploadAvatarService = (formData) => {
  return customizeAxios.post(`/api/upload-avatar`, formData);
};

const uploadAvatarProfileService = (phone, avatar) => {
  return customizeAxios.post(`/api/uploadAvatarProfile`, { phone, avatar });
};

const uploadProfileService = (data) => {
  return customizeAxios.post(`api/uploadProfile`, data);
};

export {
  uploadAvatarService,
  uploadAvatarProfileService,
  uploadProfileService,
};
