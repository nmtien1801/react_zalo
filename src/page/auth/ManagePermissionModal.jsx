import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { getAllMemberGroupService, getMemberByPhoneService } from "../../service/roomChatService";
import { updateDeputyService, transLeaderService } from "../../service/permissionService";

const ManagePermissionModal = ({ closeModal, receiver, socketRef }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.userInfo);
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedTab, setSelectedTab] = useState("Thêm phó nhóm");

    // Lấy danh sách bạn bè gần đây khi mở modal
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await getAllMemberGroupService(receiver._id);
                if (response.EC === 0 && response.DT) {
                    setSearchResults(response.DT);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách thành viên nhóm:", error);
            }
        };
        fetchFriends();
    }, []);

    const handleSearchPhone = async (e) => {
        const query = e.target.value.trim();
        setSearchTerm(query);

        if (!query) {
            const response = await getAllMemberGroupService(receiver._id);
            if (response.EC === 0 && response.DT) {
                setSearchResults(response.DT);
            } else {
                setSearchResults([]);
            }
            return;
        }

        const isPhoneNumber = /^\d+$/.test(query);
        if (!isPhoneNumber) {
            const response = await getAllMemberGroupService(receiver._id);
            if (response.EC === 0 && response.DT) {
                setSearchResults(response.DT);
            } else {
                setSearchResults([]);
            }
            return;
        }

        try {
            const response = await getMemberByPhoneService(query, receiver._id);
            if (response.EC === 0) {
                setSearchResults(response.DT);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Lỗi khi tìm kiếm:", error);
            setSearchResults([]);
        }
    };

    const handleSelectUser = (user) => {
        const exists = members.some((member) => member._id === user._id);

        if (exists) {
            setMembers((prev) => prev.filter((member) => member._id !== user._id));
        } else {
            if (selectedTab === "Chuyển quyền trưởng nhóm") {
                // Chỉ cho chọn một người
                setMembers([user]);
            } else {
                // Thêm nhiều người nếu là "Thêm phó nhóm"
                setMembers((prev) => [...prev, user]);
            }
        }
    };

    // chọn phó nhóm khi mới vào
    useEffect(() => {
        if (selectedTab === "Thêm phó nhóm") {
            const deputies = searchResults.filter((user) => user.role === "deputy");
            setMembers((prev) => {
                const existingIds = prev.map((m) => m._id);
                const newDeputies = deputies.filter((d) => !existingIds.includes(d._id));
                return [...prev, ...newDeputies];
            });
        }
    }, [searchResults, selectedTab]);

    const isSelected = (userId) => {
        return members.some((m) => m._id === userId);
    };

    // xác nhận
    const handleConfirm = async () => {
        if (selectedTab === 'Thêm phó nhóm') {
            let res = await updateDeputyService(members)

            if (res.EC === 0) {
                closeModal();
                socketRef.current.emit("REQ_UPDATE_DEPUTY", res.DT);
            }
        } else {
            // Chuyển quyền trưởng nhóm
            let response = await transLeaderService(members[0].receiver._id, members[0].sender._id)

            if (response.EC === 0) {
                closeModal();
                socketRef.current.emit("REQ_TRANS_LEADER", response.DT);
            }
        }
    }

    return (
        <div className="custom-modal">
            <div className="custom-modal-content">
                <div className="custom-modal-header">
                    <h5 className="custom-modal-title">{selectedTab}</h5>
                    <button className="custom-modal-close" onClick={closeModal}>&times;</button>
                </div>
                <div className="custom-modal-body">
                    <div className="group-form">
                        <div className="group-search mb-3">
                            <div className="input-group rounded-pill bg-light">
                                <span className="input-group-text bg-transparent border-0">
                                    <Search size={16} className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-transparent border-0"
                                    placeholder="Nhập tên, số tài khoản"
                                    value={searchTerm}
                                    onChange={handleSearchPhone}
                                />
                            </div>
                        </div>
                        <div className="group-tabs-wrapper">
                            <div className="group-tabs">
                                {["Thêm phó nhóm", "Chuyển quyền trưởng nhóm"].map((tab, index) => (
                                    <button
                                        key={index}
                                        className={`btn group-tab `}
                                        onClick={() => {
                                            setSelectedTab(tab);
                                            setMembers([]); // Reset danh sách khi đổi tab
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="row">
                            {/* Danh sách Thành viên trong nhóm */}
                            <div className="col">
                                <div className="group-list">
                                    <h6>Thành viên trong nhóm</h6>
                                    <div className="group-list-container">
                                        {searchResults.length > 0 ? (
                                            searchResults.map((friend) => (
                                                <div key={friend._id} className="group-item">
                                                    <input
                                                        type="checkbox"
                                                        id={`user-${friend._id}`}
                                                        name="group-user"
                                                        value={friend._id}
                                                        checked={isSelected(friend._id)}
                                                        onChange={() => handleSelectUser(friend)}
                                                    />
                                                    <label htmlFor={`user-${friend._id}`} className="d-flex align-items-center">
                                                        <img
                                                            src={friend.avatar || "/placeholder.svg"}
                                                            alt={friend.nameSender}
                                                            className="rounded-circle"
                                                            style={{ width: "40px", height: "40px" }}
                                                        />
                                                        <span className="ms-2">{friend.nameSender || friend.phone}</span>
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-muted">Không tìm thấy kết quả nào</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Danh sách đã chọn */}
                            {members.length > 0 && (
                                <div className="col-auto" style={{ maxWidth: "300px", minWidth: "200px" }}>
                                    <div className="selected-list">
                                        <h6>Đã chọn</h6>
                                        <div className="selected-list-container">
                                            {members.map((member) => (
                                                <div key={member._id} className="selected-item d-flex align-items-center mb-2">
                                                    <img
                                                        src={member.avatar || "/placeholder.svg"}
                                                        alt={member.name}
                                                        className="rounded-circle"
                                                        style={{ width: "40px", height: "40px" }}
                                                    />
                                                    {member.phone === user.phone ? (
                                                        <span className="text-muted fst-italic ms-2 me-2">Bạn</span>
                                                    ) : (
                                                        <>
                                                            <span className="ms-2 me-2">{member.name || member.phone}</span>
                                                            <button
                                                                className="btn btn-danger btn-sm ms-auto"
                                                                onClick={() => handleSelectUser(member)}
                                                            >
                                                                Xóa
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="custom-modal-footer">
                    <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                    <button className="btn btn-primary ms-3" onClick={handleConfirm}>Xác nhận</button>
                </div>
            </div>
        </div>
    );
};

export default ManagePermissionModal;
