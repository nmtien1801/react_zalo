import React, { useEffect, useState } from 'react';
import './FriendRequest.scss';
import { acceptFriendRequestService, getFriendRequestsService, rejectFriendRequestService } from '../../service/friendRequestService';
import { useSelector } from 'react-redux';
import { getRoomChatByPhoneService } from '../../service/roomChatService';

const FriendRequest = (props) => {
    const socketRef = props.socketRef;
    
    const [friendRequests, setFriendRequests] = useState([
    ]);
    // Lấy userInfo từ Redux Store
    const userInfo = useSelector((state) => state.auth.userInfo);

    const userId = userInfo ? userInfo.id : null; // Lấy ID người dùng từ thông tin người dùng trong Redux Store

    const fetchFriendRequests = async () => {
        const response = await getFriendRequestsService(); // Gọi API để lấy danh sách yêu cầu kết bạn

        setFriendRequests(response.DT); // Cập nhật danh sách yêu cầu kết bạn

        // action socket
        // add friend
        socketRef.current.on("RES_ADD_FRIEND", async () => {
            const response = await getFriendRequestsService();
            setFriendRequests(response.DT);
        });

        // reject friend
        socketRef.current.on("RES_REJECT_FRIEND", async () => {
            setFriendRequests([]);
        });

        // accept friend
        socketRef.current.on("RES_ACCEPT_FRIEND", async () => {
            const response = await getFriendRequestsService();
            setFriendRequests(response.DT);
        });
    };

    useEffect(() => {
        fetchFriendRequests();
    }, []);

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await acceptFriendRequestService(requestId); // Gọi API để chấp nhận yêu cầu kết bạn
            if (response.EC === 0) {
                socketRef.current.emit("REQ_ACCEPT_FRIEND", response.DT);
            }
            fetchFriendRequests(); // Cập nhật lại danh sách yêu cầu kết bạn sau khi chấp nhận
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    }

    const handleRejectRequest = async (requestId) => {
        try {
            const response = await rejectFriendRequestService(requestId); // Gọi API để từ chối yêu cầu kết bạn
            if (response.EC === 0) {
                socketRef.current.emit("REQ_REJECT_fRIEND", response.DT);
            }
            fetchFriendRequests(); // Cập nhật lại danh sách yêu cầu kết bạn sau khi từ chối
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        }
    }

    return (
        <div className="friend-request-container">
            <h5 className="mb-4">Lời mời đã nhận ({friendRequests.length})</h5>
            <div className="friend-request-grid">
                {friendRequests.map((request) => (
                    <div key={request._id} className="friend-request-card">
                        <img src={request.avatar} alt={request.username} className="avatar" />
                        <div className="friend-request-info">
                            <div className="friend-request-header">
                                <span className="friend-name">{request.username}</span>
                            </div>
                            <div>
                                <span className="friend-date">{request.sent_at}</span>
                            </div>
                            <div className="friend-message">{request.content}</div>
                            <div className="friend-actions">
                                <button className="btn btn-outline-secondary" onClick={() => handleRejectRequest(request._id)}>Từ chối</button>
                                <button className="btn btn-primary" onClick={() => handleAcceptRequest(request._id)}>Đồng ý</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    );
};

export default FriendRequest;