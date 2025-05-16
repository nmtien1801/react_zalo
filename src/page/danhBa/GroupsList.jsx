import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConversations } from "../../redux/chatSlice";
import { useSelector, useDispatch } from "react-redux";

const GroupsList = () => {
    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const conversationRedux = useSelector((state) => state.chat.conversations);
    const user = useSelector((state) => state.auth.userInfo);

    useEffect(() => {
        dispatch(getConversations(user._id));
    }, []);

    useEffect(() => {
        if (conversationRedux) {
            const _conversations = conversationRedux
                .filter(item => item.type === 2)
                .map((item) => {
                    return {
                        _id: item.receiver._id,
                        username: item.receiver.username,
                        message: item.message,
                        time: item.time,
                        avatar: item.avatar,
                        type: item.type,
                        phone: item.receiver.phone,
                        members: item.members,
                        role: item.role,
                        permission: item.receiver.permission
                    };
                });

            setFriends(_conversations);
        }
    }, [conversationRedux]);

    const handleFriendClick = (friend) => {
        navigate("/chat", { state: { friend } });
    };

    return (
        <div className="container mt-4">
            <h5 className="mb-3">Danh sách nhóm và cộng đồng</h5>

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
                    <p className="text-muted px-2">Không có nhóm nào.</p>
                )}
            </div>
        </div>
    );
};

export default GroupsList;
