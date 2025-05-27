import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { getAllFriendsService } from "../service/friendShipService"; // API lấy danh sách bạn bè
import {
    getRoomChatMembersService,
    getRoomChatByPhoneService,
    addMembersToRoomChatService, // Import API thêm thành viên
} from "../service/roomChatService"; // API lấy danh sách thành viên nhóm và tìm kiếm theo số tài khoản
import { updatePermission } from '../redux/chatSlice'
import { useSelector, useDispatch } from "react-redux";
// import { sendGroupJoinRequestsService } from "../service/friendRequestService"; // API gửi yêu cầu tham gia nhóm

const AddMemberModal = ({ show, onHide, roomId, socketRef, user, roomData , receiver}) => {
    const [friends, setFriends] = useState([]); // Danh sách bạn bè
    const [members, setMembers] = useState([]); // Danh sách thành viên nhóm
    const [selectedFriends, setSelectedFriends] = useState([]); // Danh sách bạn bè đã được tích
    const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
    const [searchResults, setSearchResults] = useState([]); // Kết quả tìm kiếm theo số tài khoản
    const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái gửi yêu cầu
    const dispatch = useDispatch();

    // Gọi API để lấy danh sách bạn bè và thành viên nhóm khi mở modal
    useEffect(() => {
        const fetchFriendsAndMembers = async () => {
            try {
                const friendsResponse = await getAllFriendsService();
                setFriends(friendsResponse.DT || []);

                const membersResponse = await getRoomChatMembersService(roomData.receiver._id);
                setMembers(membersResponse.DT || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (show) {
            fetchFriendsAndMembers();
        }
    }, [show, roomId]);

    // Xử lý tìm kiếm theo tên hoặc số tài khoản
    useEffect(() => {
        const search = async () => {
            if (searchTerm.length === 10 && /^\d+$/.test(searchTerm)) {
                try {
                    const response = await getRoomChatByPhoneService(searchTerm);
                    const searchResult = response.DT ? [response.DT] : [];
                    setSearchResults(searchResult);
                } catch (error) {
                    console.error("Error searching by phone:", error);
                    setSearchResults([]);
                }
            } else if (searchTerm.trim() === "") {
                setSearchResults([]);
            } else if (/^\d+$/.test(searchTerm)) {
                setSearchResults([]);
            } else {
                const filteredFriends = friends.filter((friend) =>
                    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setSearchResults(filteredFriends);
            }
        };

        search();
    }, [searchTerm, friends]);

    // Kiểm tra xem bạn bè đã tham gia nhóm hay chưa
    const isMember = (friendId) => members.some((member) => member._id === friendId);

    // Xử lý khi tích chọn bạn bè
    const handleSelectFriend = (friend) => {
        if (selectedFriends.some((selected) => selected._id === friend._id)) {
            setSelectedFriends(selectedFriends.filter((selected) => selected._id !== friend._id));
        } else {
            setSelectedFriends([...selectedFriends, friend]);
        }
    };

    // Danh sách hiển thị
    const displayList =
        searchResults.length > 0
            ? searchResults
            : [
                ...selectedFriends,
                ...friends.filter((friend) => !selectedFriends.some((selected) => selected._id === friend._id)),
            ];

    // Hàm xử lý khi đóng modal
    const handleClose = () => {
        setFriends([]);
        setMembers([]);
        setSelectedFriends([]);
        setSearchTerm("");
        setSearchResults([]);
        onHide();
    };

    // Hàm xử lý thêm thành viên vào nhóm
    const handleAddMembers = async () => {
        if (selectedFriends.length === 0) {
            alert("Vui lòng chọn ít nhất một thành viên để thêm vào nhóm.");
            return;
        }

        setIsSubmitting(true); // Bắt đầu trạng thái gửi yêu cầu
        try {
            const response = await addMembersToRoomChatService(roomData.receiver._id, selectedFriends);

            if (response.EC === 0) {
                const allExistInFriends = response.DT.members.every(member =>
                    friends.some(f => f._id === member)
                );
// update permission
                let res = await dispatch(updatePermission({ groupId: roomId, newPermission: receiver.permission }))
                socketRef.current.emit("REQ_MEMBER_PERMISSION", res.payload.DT);
                
                if (!allExistInFriends) {
                    // thêm nhóm k phải bạn
                    let groupsMember = {
                        members: [
                            ...response.DT.members,
                            ...selectedFriends.map(f => f._id)
                        ]
                    }

                    socketRef.current.emit("REQ_ADD_GROUP", groupsMember);
                    alert("Thêm thành viên thành công!");
                } else {
                    // thêm nhóm là bạn
                    socketRef.current.emit("REQ_ADD_GROUP", response.DT);
                    alert("Thêm thành viên thành công!");

                }
                

                handleClose(); // Đóng modal sau khi thêm thành viên thành công
            } else {
                alert(response.EM || "Có lỗi xảy ra khi thêm thành viên.");
            }
        } catch (error) {
            console.error("Error adding members:", error);
            alert("Có lỗi xảy ra khi thêm thành viên.");
        } finally {
            setIsSubmitting(false); // Kết thúc trạng thái gửi yêu cầu
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Thêm thành viên</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="add-member-container">
                    {/* Input tìm kiếm */}
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Nhập tên hoặc số tài khoản"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Danh sách bạn bè và phần đã chọn */}
                    <div className="member-list-container d-flex">
                        {/* Danh sách bạn bè */}
                        <div className="friend-list-container flex-grow-1 border border-radius-5 p-3 ">
                            <div className="member-list">
                                {searchTerm.length > 0 && /^\d+$/.test(searchTerm) && searchTerm.length < 10 ? (
                                    <div className="text-center text-muted">Không tìm thấy kết quả</div>
                                ) : searchResults.length > 0 || searchTerm.trim() === "" ? (
                                    displayList.map((friend) => (
                                        <div
                                            key={friend._id}
                                            className="member-item d-flex align-items-center mb-2"
                                        >
                                            <img
                                                src={friend.avatar || "https://via.placeholder.com/40"}
                                                alt={friend.username}
                                                className="rounded-circle me-3"
                                                style={{ width: "40px", height: "40px" }}
                                            />
                                            <div className="member-info">
                                                <div className="fw-bold">{friend.username}</div>
                                                <small className="text-muted">{friend.phone}</small>
                                            </div>
                                            {isMember(friend._id) ? (
                                                <span className="text-muted ms-auto">Đã tham gia</span>
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    className="ms-auto"
                                                    checked={selectedFriends.some(
                                                        (selected) => selected._id === friend._id
                                                    )}
                                                    onChange={() => handleSelectFriend(friend)}
                                                />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted">Không tìm thấy kết quả</div>
                                )}
                            </div>
                        </div>

                        {/* Phần đã chọn */}
                        {selectedFriends.length > 0 && (
                            <div className="selected-list-container border p-3 border-radius ms-3">
                                <h6 className="mb-3">Đã chọn ({selectedFriends.length})</h6>
                                <div className="selected-list">
                                    {selectedFriends.map((friend) => (
                                        <div
                                            key={friend._id}
                                            className="selected-item d-flex align-items-center mb-2"
                                        >
                                            <img
                                                src={friend.avatar || "https://via.placeholder.com/40"}
                                                alt={friend.username}
                                                className="rounded-circle me-2"
                                                style={{ width: "30px", height: "30px" }}
                                            />
                                            <div className="selected-info flex-grow-1">
                                                <div className="fw-bold">{friend.username}</div>
                                            </div>
                                            <button
                                                className="btn btn-outline-primary btn-sm mx-2"
                                                onClick={() => handleSelectFriend(friend)}
                                            >
                                                x
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                    Hủy
                </Button>
                <Button variant="primary" onClick={handleAddMembers} disabled={isSubmitting}>
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddMemberModal;