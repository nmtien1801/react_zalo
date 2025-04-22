import customizeAxios from "../component/customizeAxios";

const getRoomChatByPhoneService = (phone) => {
  return customizeAxios.get(`/api/roomChat/${phone}`);
};

const getAllMemberGroupService = (groupId) => {
  return customizeAxios.get(`/api/getAllMemberGroup/${groupId}`);
};

const getMemberByPhoneService = (phone, groupId) => {
  return customizeAxios.post(`/api/getMemberByPhone/${phone}`, {groupId});
};

export {
  getRoomChatByPhoneService,
  getAllMemberGroupService,
  getMemberByPhoneService,
};
