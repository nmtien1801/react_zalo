import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash, UserX, Users } from 'lucide-react';
import { updatePermission } from '../../redux/chatSlice'
import { getAllPermission } from '../../redux/permissionSlice'
import ManagePermissionModal from '../auth/ManagePermissionModal'
import { dissolveGroupService } from '../../service/chatService'

const ManageGroup = (props) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.userInfo);
    const navigate = useNavigate();
    const receiver = props.receiver
    const socketRef = props.socketRef

    const permissions = useSelector((state) => state.permission.permission);

    const [checkedStates, setCheckedStates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // mở modal ManagePermissionModal 

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // getAllPermission
    useEffect(() => {
        dispatch(getAllPermission())
    }, [])

    const handleCheckboxChange = (index) => {
        const updated = [...checkedStates];
        updated[index] = !updated[index];
        setCheckedStates(updated);

        // Tạo danh sách permission dựa trên checkedStates
        const newPermissions = updated
            .map((isChecked, idx) => (isChecked ? idx + 1 : null))
            .filter((perm) => perm !== null);

        // Gọi hàm cập nhật permission trong DB
        updatePermissionsInDB(newPermissions);
    };

    useEffect(() => {
        if (receiver?.permission && permissions.length > 0) {
            const updatedStates = permissions.map((_, index) =>
                receiver.permission.includes(index + 1)
            );
            setCheckedStates(updatedStates);
        }
    }, [receiver, permissions]);

    // Hàm gửi yêu cầu cập nhật permission đến server
    const updatePermissionsInDB = async (newPermissions) => {
        try {
            // Giả sử bạn có một API endpoint để cập nhật permission
            let res = await dispatch(updatePermission({ groupId: receiver._id, newPermission: newPermissions }))

            socketRef.current.emit("REQ_MEMBER_PERMISSION", res.payload.DT);
            console.log("Permissions updated in DB:", newPermissions);
        } catch (error) {
            console.error("Error updating permissions:", error);
            // Có thể hiển thị thông báo lỗi cho người dùng
        }
    };

    const handleDissolveGroup = async () => {
        try {
            const response = await dissolveGroupService(receiver._id);

            const { EC, EM } = response || {};

            if (EC === 0) {
                alert("Thành công", "Nhóm đã được giải tán!");
                socketRef.current.emit("REQ_DISSOLVE_GROUP", receiver);
            } else {
                alert("Lỗi", EM || "Không thể giải tán nhóm.");
            }
        } catch (error) {
            console.error("Lỗi khi giải tán nhóm:", error);
            alert("Lỗi", "Không thể giải tán nhóm, vui lòng thử lại sau.");
        }
    };

    return (
        <>
            {/* Header */}
            <div className="border-bottom header-right-sidebar d-flex align-items-center justify-content-between">
                <button
                    className="btn btn-light btn-sm rounded-circle"
                    onClick={() => props.handleManageGroup()}
                >
                    <ArrowLeft size={16} />
                </button>
                <h6 className="mb-0 flex-grow-1 text-center">Quản lý nhóm</h6>
            </div>

            <div className="container py-3">
                {/* Cho phép các thành viên */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h5 className="mb-0">Cho phép các thành viên trong nhóm:</h5>
                    </div>
                    <div className="card-body">
                        {permissions && checkedStates.length === permissions.length && permissions.map((per, idx) => (
                            <div className="form-check mb-2" key={idx}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={checkedStates[idx]}
                                    onChange={() => handleCheckboxChange(idx)}
                                />
                                <label className="form-check-label">{per.desc}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cài đặt nhóm */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h5 className="mb-0">Cài đặt nhóm</h5>
                    </div>
                    <div className="card-body">
                        {[
                            "Chế độ phê duyệt thành viên mới",
                            "Cho phép dùng link tham gia nhóm",
                        ].map((label, idx) => (
                            <div className="d-flex justify-content-between align-items-center mb-3" key={idx}>
                                <span>{label}</span>
                                <div className="form-check form-switch m-0">
                                    <input className="form-check-input" type="checkbox" defaultChecked={idx !== 0} readOnly={idx !== 0} />
                                </div>
                            </div>
                        ))}

                        {/* Link tham gia */}
                        <div className="input-group mt-3">
                            <input
                                type="text"
                                className="form-control"
                                value="zalo.me/g/fmrwto598"
                                readOnly
                            />
                            <button className="btn btn-outline-secondary" title="Copy">
                                📋
                            </button>
                            <button className="btn btn-outline-secondary" title="Chia sẻ">
                                🔗
                            </button>
                            <button className="btn btn-outline-secondary" title="Cập nhật">
                                🔄
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hành động khác */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h5 className="mb-0">Hành động</h5>
                    </div>
                    <div className="card-body">
                        <button className="btn btn-outline-danger w-100 mb-2 d-flex align-items-center justify-content-center gap-2">
                            <UserX size={18} /> Chặn khỏi nhóm
                        </button>
                        {receiver.role === 'leader' &&
                            <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                                onClick={openModal}
                            >
                                <Users size={18} /> Trưởng & phó nhóm
                            </button>}
                        {isModalOpen && <ManagePermissionModal closeModal={closeModal} receiver={receiver} socketRef={socketRef} />}
                    </div>
                </div>

                {/* Nút giải tán */}
                <div className="text-center">
                    {receiver.role === 'leader' &&
                        <button className="btn btn-danger" onClick={handleDissolveGroup}>
                            <Trash size={16} className="me-2" />
                            Giải tán nhóm
                        </button>}
                </div>
            </div>
        </>
    );
};

export default ManageGroup;
