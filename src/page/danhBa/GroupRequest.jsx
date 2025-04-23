import React, { useEffect, useState } from 'react';
import './GroupRequest.scss';
import { useSelector } from 'react-redux';
import { acceptGroupJoinRequestService, getGroupJoinRequestsService } from '../../service/friendRequestService';
import { rejectFriendRequestService } from '../../service/friendRequestService';

const GroupRequest = (props) => {
    const [groupRequests, setGroupRequests] = useState([]); // Danh sách lời mời vào nhóm
    const userInfo = useSelector((state) => state.auth.userInfo); // Lấy thông tin người dùng từ Redux Store

    const socketRef = props.socketRef; // Lấy socketRef từ props

    const fetchGroupRequests = async () => {
        try {
            const response = await getGroupJoinRequestsService();
            setGroupRequests(response.DT || []);
        } catch (error) {
            console.error('Error fetching group requests:', error);
        }
        // Lắng nghe socket
        if (socketRef && socketRef.current) {
            socketRef.current.on("RES_ADD_GROUP", async () => {
                try {
                    const response = await getGroupJoinRequestsService();
                    setGroupRequests(response.DT || []);
                } catch (error) {
                    console.error('Error fetching group requests:', error);
                }
            });
            socketRef.current.on("RES_ACCEPT_FRIEND", async () => {
                try {
                    const response = await getGroupJoinRequestsService();
                    setGroupRequests(response.DT || []);
                } catch (error) {
                    console.error('Error fetching group requests:', error);
                }
            });
            socketRef.current.on("RES_REJECT_FRIEND", async () => {
                try {
                    const response = await getGroupJoinRequestsService();
                    setGroupRequests(response.DT || []);
                } catch (error) {
                    console.error('Error fetching group requests:', error);
                }
            });
        }
    };

    useEffect(() => {
        fetchGroupRequests();
        // Cleanup socket khi unmount
        return () => {
            if (socketRef && socketRef.current) {
            }
        };
    }, [socketRef]);

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await acceptGroupJoinRequestService(requestId);
            if (response.EC === 0) {
                socketRef.current.emit("REQ_ACCEPT_FRIEND", response.DT);
            } // Gọi API để chấp nhận lời mời vào nhóm
            fetchGroupRequests(); // Cập nhật lại danh sách lời mời sau khi chấp nhận
        } catch (error) {
            console.error('Error accepting group request:', error);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const response = await rejectFriendRequestService(requestId); // Gọi API để từ chối lời mời vào nhóm
            if (response.EC === 0) {
                socketRef.current.emit("REQ_REJECT_fRIEND", response.DT);
            }
            fetchGroupRequests(); // Cập nhật lại danh sách lời mời sau khi từ chối
        } catch (error) {
            console.error('Error rejecting group request:', error);
        }
    };

    return (
        <div className="group-request-container">
            <h5 className="mb-4">Lời mời vào nhóm ({groupRequests.length})</h5>
            <div className="group-request-grid">
                {groupRequests.map((request) => (
                    <div key={request._id} className="group-request-card">
                        <img src={request.fromUser.avatar} alt={request.groupName} className="avatar" />
                        <div className="group-request-info">
                            <div className="group-request-header">
                                <span className="group-name">{request.fromUser.username}</span>
                            </div>
                            <div>
                                <span className="group-date">{request.sent_at}</span>
                            </div>
                            <div className="group-message">{request.content}</div>
                            <div className="group-actions">
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

export default GroupRequest;