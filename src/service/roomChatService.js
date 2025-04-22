import customizeAxios from "../component/customizeAxios";

const getRoomChatByPhoneService = (phone) => {
    return customizeAxios.get(
        `/api/roomChat/${phone}`
    );
};

const getRoomChatMembersService = async (roomId) => {
    const response = await customizeAxios.get(`/api/roomChat/${roomId}/members`);
    return response;
};


export { getRoomChatByPhoneService, getRoomChatMembersService };
