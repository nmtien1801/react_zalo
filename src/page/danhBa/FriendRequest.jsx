import React, { useEffect, useState } from 'react';
import './FriendRequest.scss';
import { acceptFriendRequestService, getFriendRequestsService } from '../../service/friendRequestService';
import { useSelector } from 'react-redux';
import { getRoomChatByPhoneService } from '../../service/roomChatService';
const FriendRequest = () => {
    const [friendRequests, setFriendRequests] = useState([
        {
            id: 1,
            name: 'Nguyễn Văn A',
            avatar: 'https://via.placeholder.com/50',
            date: '2023-10-01',
            content: 'Xin chào! Tôi là Nguyễn Văn A.',
            source: 'Từ số điện thoại',
        },
        // Thêm dữ liệu giả khác nếu cần
    ]);
    // Lấy userInfo từ Redux Store
    const userInfo = useSelector((state) => state.auth.userInfo);

    const userId = userInfo ? userInfo.id : null; // Lấy ID người dùng từ thông tin người dùng trong Redux Store

    const fetchFriendRequests = async () => {
        const response = await getFriendRequestsService(); // Gọi API để lấy danh sách yêu cầu kết bạn
        console.log(response.DT);

        setFriendRequests(response.DT); // Cập nhật danh sách yêu cầu kết bạn
    };
    useEffect(() => {
        fetchFriendRequests();
    }, []);

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await acceptFriendRequestService(requestId); // Gọi API để chấp nhận yêu cầu kết bạn
            fetchFriendRequests(); // Cập nhật lại danh sách yêu cầu kết bạn sau khi chấp nhận
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    }

    return (
        <div className="friend-request-container">
            <h5 className="mb-4">Lời mời đã nhận ({friendRequests.length})</h5>
            {friendRequests.map((request) => (
                <div key={request._id} className="friend-request-card">
                    <img src={request.avatar} alt={request.name} className="avatar" />
                    <div className="friend-request-info">
                        <div className="friend-request-header">
                            <span className="friend-name">{request.fromUser}</span>
                        </div>
                        <div>
                            <span className="friend-date">{request.sent_at}</span>
                            <div className="friend-source">{request.source}</div>
                        </div>
                        <div className="friend-message">{request.content}</div>
                        <div className="friend-actions">
                            <button className="btn btn-outline-secondary">Từ chối</button>
                            <button className="btn btn-primary"
                                onClick={() => handleAcceptRequest(request._id)} // Gọi hàm chấp nhận yêu cầu khi nhấn nút
                            >Đồng ý</button>
                        </div>
                    </div>
                </div>
            ))}
            <div className="friend-suggestions">
                <span>Gợi ý kết bạn (5)</span>
                <span className="arrow">&gt;</span>
            </div>
        </div>
    );
};

export default FriendRequest;