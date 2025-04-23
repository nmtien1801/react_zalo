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

const rejectFriendRequestService = async (requestId) => {
    const response = await customizeAxios.post(`/api/rejectFriendRequest/${requestId}`);
    return response;
}

const getFriendRequestByFromUserAndToUserService = async (fromUserId) => {
    const response = await customizeAxios.get(`/api/getFriendRequestByFromUserAndToUser/${fromUserId}`);
    return response;
}

const cancelFriendRequestService = async (requestId) => {
    const response = await customizeAxios.post(`/api/cancelFriendRequest/${requestId}`);
    return response;
}

// mời thành viên vào nhóm
const sendGroupJoinRequestsService = async (roomId, members) => {
    const response = await customizeAxios.post(`/api/sendGroupJoinRequests/${roomId}`, {
        members,
    });
    return response;
};

// danh sách lời mời vào nhóm
const getGroupJoinRequestsService = async () => {
    const response = await customizeAxios.get(`/api/getGroupJoinRequests`);
    return response;
}

const acceptGroupJoinRequestService = async (requestId) => {
    const response = await customizeAxios.post(`/api/acceptGroupJoinRequest/${requestId}`);
    return response;
}



export {
    getFriendRequestsService,
    acceptFriendRequestService,
    sendRequestFriendService,
    rejectFriendRequestService,
    getFriendRequestByFromUserAndToUserService,
    cancelFriendRequestService,
    sendGroupJoinRequestsService,
    getGroupJoinRequestsService,
    acceptGroupJoinRequestService
};
