import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllFriendsService } from "../../service/friendShipService";

const FriendsList = () => {
    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();

    const fetchFriendsAndMembers = async () => {
        try {
            const friendsResponse = await getAllFriendsService();
            setFriends(friendsResponse.DT || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchFriendsAndMembers();
    }, []);

    const handleFriendClick = (friend) => {
        navigate("/chat", { state: { friend } });
    };
    
    return (
        <div className="container mt-4">
            <h5 className="mb-3">Danh sách bạn bè</h5>

            <div className="list-group overflow-auto" style={{ maxHeight: "400px" }}>
                {friends.length > 0 ? (
                    friends.map((friend, index) => (
                        <div key={index} className="list-group-item list-group-item-action d-flex align-items-center" onClick={() => {
                            handleFriendClick(friend)
                        }}>
                            <img
                                src={friend.avatar || "https://via.placeholder.com/50"}
                                alt="avatar"
                                className="rounded-circle me-3"
                                width="50"
                                height="50"
                            />
                            <span className="fw-bold">{friend.username || "Chưa rõ tên"}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-muted px-2">Không có bạn bè nào.</p>
                )}
            </div>
        </div>
    );
};

export default FriendsList;
