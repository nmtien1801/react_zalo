import customizeAxios from "../component/customizeAxios";

const getFriendRequestsService = async () => {
    const response = await customizeAxios.get(`/api/getFriendRequests`);
    return response;
}

const acceptFriendRequestService = async (requestId) => {
    const response = await customizeAxios.post(`/api/acceptFriendRequest/${requestId}`);
    return response;
}

const sendRequestFriendService = async (data) => {
    const response = await customizeAxios.post(`/api/sendRequestFriend`, data);
    return response;
}


export { getFriendRequestsService, acceptFriendRequestService, sendRequestFriendService };
