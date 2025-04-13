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

export { loadMessagesService, getConversationsService, createConversationGroupService };
