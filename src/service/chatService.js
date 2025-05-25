import customizeAxios from "../component/customizeAxios";

const loadMessagesService = (sender, receiver, type, page = 1, limit = 20) => {
  return customizeAxios.get(`/api/messages/${sender}/${receiver}/${type}?page=${page}&limit=${limit}`);
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

const markMessageAsReadService = (messageId, userId) => {
  return customizeAxios.post(`/api/mark-read/${messageId}`, { userId });
};

const markAllMessagesAsReadService = (conversationId, userId) => {
  return customizeAxios.post(`/api/mark-all-read/${conversationId}`, { userId });
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

// Tải tin nhắn cũ hơn
const loadOlderMessagesService = (sender, receiver, type, lastMessageId, limit = 20) => {
  return customizeAxios.get(`/messages/${sender}/${receiver}/${type}/older?lastMessageId=${lastMessageId}&limit=${limit}`);
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
  markMessageAsReadService,
  markAllMessagesAsReadService,
  loadOlderMessagesService,
};
