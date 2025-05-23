import customizeAxios from "../component/customizeAxios";

const loadMessagesService = (sender, receiver, type) => {
  return customizeAxios.get(`/api/messages/${sender}/${receiver}/${type}`);
};

const getConversationsService = (sender) => {
  return customizeAxios.get(`/api/getConversations/${sender}`);
};

const createConversationGroupService = (nameGroup, avatarGroup, members) => {
  return customizeAxios.post(`/api/createConversationGroup`, {
    nameGroup,
    avatarGroup,
    members,
  });
};

const recallMessageService = (id) => {
  return customizeAxios.put(`/api/messages/recall/${id}`);
};

const deleteMessageForMeService = (id, userId) => {
  return customizeAxios.put(`/api/messages/deleteForMe/${id}`, userId);
};

const sendReactionService = (messageId, userId, emoji) => {
  return customizeAxios.post(`/api/messages/handleReaction`, {
    messageId,
    userId,
    emoji,
  });
};

const getReactionMessageService = (messageId) => {
  return customizeAxios.get(`/api/messages/${messageId}/reactions/`);
};

const updatePermissionService = (groupId, newPermission) => {
  return customizeAxios.post(`/api/updatePermission`, {
    groupId,
    newPermission,
  });
};

const removeMemberFromGroupService = async (groupId, memberId) => {
  try {
    const response = await customizeAxios.delete(
      `/api/roomChat/${groupId}/members/${memberId}`
    );
    return response;
  } catch (error) {
    console.error("Lỗi khi gọi API xóa thành viên:", error);
    return { EC: -1, EM: "Lỗi khi gọi API", DT: null }; // Trả về định dạng mặc định khi lỗi
  }
};

const dissolveGroupService = async (groupId) => {
  return customizeAxios.delete(`/api/group/${groupId}/dissolve`);
};

const chatGPTService = async (message) => {
  return customizeAxios.post(`/api/chatGPT`, {
    message,
  });
};

export {
  removeMemberFromGroupService,
  loadMessagesService,
  getConversationsService,
  createConversationGroupService,
  recallMessageService,
  deleteMessageForMeService,
  sendReactionService,
  getReactionMessageService,
  updatePermissionService,
  dissolveGroupService,
  chatGPTService,
};
