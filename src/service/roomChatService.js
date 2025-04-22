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

// Thêm thành viên vào nhóm
const addMembersToRoomChatService = async (roomId, members) => {
    const response = await customizeAxios.post(`/api/roomChat/${roomId}/members`, {
        members,
    });
    return response;
};


export { getRoomChatByPhoneService, getRoomChatMembersService, addMembersToRoomChatService };
