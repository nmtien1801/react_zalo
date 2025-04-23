import React, { useEffect, useState } from 'react';
import { RiGroupLine, RiDeleteBin7Line } from "react-icons/ri";
import { TiBusinessCard } from "react-icons/ti";
import { MdBlock } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import './AccountInfo.scss';
import { getRoomChatByPhoneService } from '../../service/roomChatService';
import { deleteFriendService, checkFriendShipExistsService } from '../../service/friendShipService';
import { acceptFriendRequestService, cancelFriendRequestService, getFriendRequestByFromUserAndToUserService, rejectFriendRequestService, sendRequestFriendService } from '../../service/friendRequestService';

const AccountInfo = ({ isOpen, closeModal, user, socketRef }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isFriend, setIsFriend] = useState(false);

    const [friendRequest, setFriendRequest] = useState(null);

    const handleAddFriend = async (userId) => {
        const data = {
            toUser: userId,
            content: 'Xin chào! Tôi muốn kết bạn với bạn.',
        }
        const response = await sendRequestFriendService(data);
        if (response.EC === 0) {
            alert("Đã gửi lời mời kết bạn thành công!");
            socketRef.current.emit("REQ_ADD_fRIEND", response.DT);
        }
        else {
            alert(response.EM); // Hiển thị thông báo lỗi nếu có
        }
        closeModal(); // Đóng modal sau khi gửi lời mời kết bạn
    }

    const handleDeleteFriend = async (friendId) => {
        const res = await deleteFriendService(friendId);
        if (res.EC === 0) {
            alert("Xóa bạn bè thành công!");
            socketRef.current.emit("REQ_DELETE_FRIEND", res.DT);
        } else {
            alert(res.EM);
        }
        closeModal(); // Đóng modal sau khi xóa bạn bè
    }

    const handleCancelFriendRequest = async (requestId) => {
        const res = await cancelFriendRequestService(requestId);
        if (res.EC === 0) {
            alert("Hủy yêu cầu kết bạn thành công!");
            socketRef.current.emit("REQ_CANCEL_FRIEND", res.DT);

        } else {
            alert(res.EM);
        }
        closeModal(); // Đóng modal sau khi hủy yêu cầu kết bạn
    }

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await acceptFriendRequestService(requestId); // Gọi API để chấp nhận yêu cầu kết bạn

            if (response.EC === 0) {
                alert("Đã chấp nhận yêu cầu kết bạn thành công!");
                socketRef.current.emit("REQ_ACCEPT_FRIEND", response.DT);
            }
            else {
                alert(response.EM); // Hiển thị thông báo lỗi nếu có
            }

            closeModal(); // Đóng modal sau khi chấp nhận yêu cầu kết bạn
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    }

    const handleRejectRequest = async (requestId) => {
        try {
            const response = await rejectFriendRequestService(requestId); // Gọi API để từ chối yêu cầu kết bạn

            if (response.EC === 0) {
                alert("Đã từ chối yêu cầu kết bạn thành công!");
                socketRef.current.emit("REQ_REJECT_fRIEND", response.DT);
            } else {
                alert(response.EM); // Hiển thị thông báo lỗi nếu có
            }
            closeModal(); // Đóng modal sau khi từ chối yêu cầu kết bạn
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        }
    }


    const fetchUserInfo = async () => {
        try {
            const response = await getRoomChatByPhoneService(user?.phone);
            const checkFriendResponse = await checkFriendShipExistsService(user?._id);
            if (checkFriendResponse.EC === 0) {
                setIsFriend(true);
            } else {
                setIsFriend(false);
            }
            let friendRequest = await getFriendRequestByFromUserAndToUserService(user?._id);
            if (friendRequest.EC === 0) {
                setFriendRequest(friendRequest.DT);
                console.log(friendRequest.DT);
            }
            setUserInfo(response.DT);

            // action socket
            // add friend
            socketRef.current.on("RES_ADD_FRIEND", async () => {
                friendRequest = await getFriendRequestByFromUserAndToUserService(
                    user?._id
                );
                if (friendRequest.EC === 0) {
                    setFriendRequest(friendRequest.DT);
                }
            });

            // cancel friend
            socketRef.current.on("RES_CANCEL_FRIEND", async () => {
                setFriendRequest(null);
            });

            // reject friend
            socketRef.current.on("RES_REJECT_FRIEND", async () => {
                setFriendRequest(null);
            });

            // accept friend
            socketRef.current.on("RES_ACCEPT_FRIEND", async () => {
                setIsFriend(true)
            });

            // delete friend
            socketRef.current.on("RES_DELETE_FRIEND", async () => {
                setFriendRequest(null);
                setIsFriend(false)
            });
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUserInfo();
        }
    }, [isOpen]);




    return (
        <div className="profile-modal-container">
            {/* Modal */}
            {isOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="header">
                            <span className="header-text">Thông tin tài khoản</span>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>

                        <div className="profile-header">
                            <div>
                                <img src={userInfo ? userInfo.avatar : "https://picsum.photos/200/300"}
                                    alt="Profile"
                                    className="profile-image-background"
                                />
                                <div className="horizontal-row">
                                    <img
                                        src={userInfo ? userInfo.avatar : "https://picsum.photos/200/300"}
                                        alt="Profile"
                                        className="profile-image"
                                    />
                                    <div className="profile-name">
                                        {userInfo?.username} <span className="verified-icon">✔</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-actions">
                                {isFriend && <>
                                    <button className="action-btn call">Gọi điện</button>
                                    <button className="action-btn text">Nhắn tin</button>
                                </>}

                                {!isFriend && !friendRequest &&
                                    <button className="action-btn call"
                                        onClick={() => handleAddFriend(userInfo?._id)}
                                    >Kết bạn</button>
                                }
                                {!isFriend && friendRequest?.fromUser?._id === user?._id &&
                                    <>
                                        <button className="action-btn call "
                                            onClick={() => handleRejectRequest(friendRequest._id)}>Từ chối</button>
                                        <button className="action-btn text"
                                            onClick={() => handleAcceptRequest(friendRequest._id)}>Đồng ý</button>
                                    </>
                                }

                                {!isFriend && friendRequest?.toUser?._id === user?._id &&
                                    <button className="action-btn call"
                                        onClick={() => handleCancelFriendRequest(friendRequest?._id)}
                                    >Hủy yêu cầu kết bạn</button>
                                }

                            </div>
                        </div>

                        <div className="info-section">
                            <p className="bio-text">Thông tin cá nhân</p>
                            <div className="info-item">
                                <span className="info-value"></span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Giới tính</span>
                                <span className="info-value"> {userInfo?.gender} </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Ngày sinh</span>
                                <span className="info-value"> {userInfo?.dob} </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Điện thoại</span>
                                <span className="info-value"> {userInfo?.phone} </span>
                            </div>
                        </div>

                        {isFriend ?
                            <>
                                <div className="photos-section">
                                    <h3>Hình ảnh</h3>
                                    <div className="photo-grid">
                                        <img src="https://picsum.photos/200/300" alt="Photo 1" className="photo-item" />
                                        <img src="https://picsum.photos/200/300" alt="Photo 2" className="photo-item" />
                                        <img src="https://picsum.photos/200/300" alt="Photo 3" className="photo-item" />
                                        <img src="https://picsum.photos/200/300" alt="Photo 3" className="photo-item" />
                                    </div>
                                </div>

                                <div className="footer-section">
                                    <div className="footer-actions">
                                        <div className="groups">
                                            <RiGroupLine />
                                            <button className="footer-btn">Nhóm chung (17)</button>
                                        </div>
                                        <div className="groups">
                                            <TiBusinessCard />
                                            <button className="footer-btn">Chia sẻ danh thiếp</button>
                                        </div>
                                        <div className="groups">
                                            <MdBlock />
                                            <button className="footer-btn">Chặn tin nhắn qua cuộc gọi</button>
                                        </div>
                                        <div className="groups">
                                            <IoWarningOutline />
                                            <button className="footer-btn">Báo xấu</button>
                                        </div>
                                        <div className="groups">
                                            <RiDeleteBin7Line />
                                            <button className="footer-btn"
                                                onClick={() => handleDeleteFriend(userInfo?._id)}
                                            >Xóa danh sách bạn bè</button>
                                        </div>
                                    </div>
                                </div>
                            </> : <></>
                        }
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default AccountInfo;
