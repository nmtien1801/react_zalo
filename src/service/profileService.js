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

const uploadAvatarGroupService = (groupId, avatar) => {
  console.log(groupId, avatar);
  
  return customizeAxios.post(`/api/uploadAvatarGroup`, { groupId, avatar });
};

export {
  uploadAvatarService,
  uploadAvatarProfileService,
  uploadProfileService,
  uploadAvatarGroupService,
};
