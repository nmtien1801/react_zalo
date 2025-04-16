import customizeAxios from "../component/customizeAxios";

const getRoomChatByPhoneService = (phone) => {
    return customizeAxios.get(
        `/api/roomChat/${phone}`
    );
};


export { getRoomChatByPhoneService };
