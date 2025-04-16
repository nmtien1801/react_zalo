import customizeAxios from "../component/customizeAxios";

const deleteFriendService = async (friendId) => {
    const response = await customizeAxios.post(`/api/deleteFriend/${friendId}`);
    return response;
}

const checkFriendShipExistsService = async (friendId) => {
    const response = await customizeAxios.get(`/api/checkFriendShip/${friendId}`);
    return response;
}


export {
    deleteFriendService,
    checkFriendShipExistsService,

};