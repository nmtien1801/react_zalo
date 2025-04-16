import customizeAxios from "../component/customizeAxios";

const loadMessagesService = (sender, receiver, type) => {
  return customizeAxios.get(
    `/api/messages/${sender}/${receiver}/${type}`
  );
};


const getConversationsService = (sender) => {
  return customizeAxios.get(
    `/api/getConversations/${sender}`
  );
};

const createConversationGroupService = (data) => {
  return customizeAxios.post(
    `/api/createConversationGroup`, data);
}

const recallMessageService = (id) => {
  return customizeAxios.put(`/api/messages/recall/${id}`);
};

const deleteMessageForMeService = (id, userId) => {
  return customizeAxios.put(`/api/messages/deleteForMe/${id}`, { userId });
};

const sendReactionService = (messageId, userId, emoji) => {
  return customizeAxios.post(`/api/messages/handleReaction`, {messageId, userId, emoji});
}

const getReactionMessageService = (messageId) => {
  return customizeAxios.get(`/api/messages/${messageId}/reactions/`);
}

export { loadMessagesService, getConversationsService, createConversationGroupService, recallMessageService, deleteMessageForMeService, sendReactionService, getReactionMessageService };
