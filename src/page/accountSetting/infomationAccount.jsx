import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { uploadAvatar, uploadProfile } from '../../redux/profileSlice.js'
import { uploadAvatarProfile } from '../../redux/authSlice.js'
import { useNavigate } from "react-router-dom";

import "./modernStyles.css";
import { toast } from "react-toastify";

const infomationAccount = ({ toggleModalInfomation, socketRef, user }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [avatarUrl, setAvatarUrl] = useState("");
    const fileInputRef = useRef(null); // Ref để truy cập input file ẩn
    const [userUpdate, setUserUpdate] = useState({
        phone: user.phone,
        email: user.email,
        username: user.username,
        dob: user.dob,
        gender: user.gender,
    });

    useEffect(() => {
        if (user.avatar) {
            setAvatarUrl(user.avatar);
        }
    }, [user.avatar])

    // Xử lý upload file
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];

        // Validate file size and type
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error("Vui lòng chọn ảnh nhỏ hơn 5MB");
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error("Vui lòng chọn ảnh JPG hoặc PNG");
            return;
        }

        const formData = new FormData();
        formData.append("avatar", selectedFile);

        //Show loading toast
        const toastId = toast.loading("Đang tải lên, vui lòng đợi trong giây lát...");

        try {
            const response = await dispatch(uploadAvatar({ formData }));
            const { EM, EC, DT } = response.payload;

            if (EC === 0) {
                setAvatarUrl(DT);
                toast.update(toastId, { 
                    render: "Ảnh đại diện đã được cập nhật thành công", 
                    type: "success", 
                    isLoading: false,
                    autoClose: 3000
                });
            } else {
                toast.update(toastId, { 
                    render: "Có lỗi xảy ra, vui lòng thử lại", 
                    type: "error", 
                    isLoading: false,
                    autoClose: 3000
                });
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.update(toastId, { 
                render: "Có lỗi xảy ra, vui lòng thử lại", 
                type: "error", 
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    // Kích hoạt input file khi nhấn nút
    const handleButtonClick = () => {
        fileInputRef.current.click(); // Mở dialog chọn file
    };

    // sửa profile
    const handleChange = (field) => (e) => {
        let value = e.target.value;
        
        // Nếu là trường dob, chuyển đổi từ yyyy-MM-dd sang dd/MM/yyyy
        if (field === "dob") {
            value = formatDateForStorage(value);
        }
        
        setUserUpdate(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateInfo = async () => {

        if (!userUpdate.username.trim()) {
            toast.warning("Tên người dùng không được để trống");
            return;
        }

        const toastId = toast.loading("Đang cập nhật, vui lòng đợi trong giây lát...");

        try {

            let data = {
                ...userUpdate,
                avatar: avatarUrl,
                userId: user._id,
            };

            let res = await dispatch(uploadProfile(data));

            if (res.payload.EC === 0) {
                socketRef.current.emit("REQ_UPDATE_AVATAR");
                toast.update(toastId, { 
                    render: "Thông tin tài khoản đã được cập nhật thành công", 
                    type: "success", 
                    isLoading: false,
                    autoClose: 3000
                });
                setTimeout(() => {
                    toggleModalInfomation();
                }, 1500);
            }else {
                toast.update(toastId, { 
                    render: res.payload.EM || "Có lỗi xảy ra, vui lòng thử lại", 
                    type: "error", 
                    isLoading: false,
                    autoClose: 3000
                });
            }

        } catch (error) {
            toast.update(toastId, { 
                render: "Có lỗi xảy ra, vui lòng thử lại", 
                type: "error", 
                isLoading: false,
                autoClose: 3000
            });
            console.error("Update error:", error);
        }

    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        
        // Kiểm tra xem dateString có định dạng dd/MM/yyyy không
        const dateParts = dateString.split('/');
        if (dateParts.length === 3) {
            // Chuyển từ dd/MM/yyyy sang yyyy-MM-dd cho input type="date"
            const day = dateParts[0];
            const month = dateParts[1];
            const year = dateParts[2];
            return `${year}-${month}-${day}`;
        }
        
        // Nếu là định dạng khác, thử dùng Date object
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        } catch (error) {
            console.error("Không thể chuyển đổi ngày:", error);
        }
        
        return '';
    };

    const formatDateForStorage = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };

    const convertTime = (time) => {
        const date = new Date(time);
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Ho_Chi_Minh",
        });
    };

    return (
        <div className="modern-modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) toggleModalInfomation();
        }}>
            <div className="modern-modal">
                <div className="modern-modal-header">
                    <h5 className="modern-modal-title">Thông tin tài khoảnssss</h5>
                    <button className="modern-modal-close" onClick={toggleModalInfomation}>&times;</button>
                </div>
                
                <div className="modern-modal-body">
                    {/* Cover photo */}
                    <div className="account-cover">
                        <img 
                            src="https://i.imgur.com/F3LORSG.jpeg" 
                            alt="Cover" 
                        />
                        <div className="account-cover-edit">
                            <i className="fa fa-camera"></i>
                        </div>
                    </div>
                    
                    {/* Profile section */}
                    <div className="account-profile">
                        <div className="account-avatar-container">
                            <img 
                                src={avatarUrl || "https://i.imgur.com/cIRFqAL.png"} 
                                alt="Avatar" 
                                className="account-avatar" 
                            />
                            <div className="avatar-edit" onClick={handleButtonClick}>
                                <i className="fa fa-camera"></i>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                accept="image/jpeg,image/png"
                                onChange={handleFileChange}
                            />
                        </div>
                        
                        <div className="account-name-container">
                            <h3 className="account-name">
                                {user?.username}
                                <i className="fa fa-edit edit-icon"></i>
                            </h3>
                        </div>
                    </div>
                    
                    {/* Info card */}
                    <div className="account-info">
                        <div className="info-card">
                            <h5 className="info-title">Thông tin cá nhân</h5>
                            
                            <div className="info-form">
                                <div className="form-group">
                                    <label className="form-label">Tên người dùng</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={userUpdate.username}
                                        onChange={handleChange("username")}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        value={userUpdate.email}
                                        disabled
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Điện thoại</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={userUpdate.phone}
                                        disabled
                                    />
                                    <span className="form-hint">Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này</span>
                                </div>
                                
                                <div className="form-group-row gap-3">
                                    <div className="form-group" style={{flex: 1}}>
                                        <label className="form-label">Ngày sinh</label>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            value={formatDateForInput(userUpdate.dob)}
                                            onChange={handleChange("dob")}
                                        />
                                    </div>
                                    
                                    <div className="form-group" style={{flex: 1}}>
                                        <label className="form-label">Giới tính</label>
                                        <select 
                                            className="info-select"
                                            value={userUpdate.gender}
                                            onChange={handleChange("gender")}
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="male">Nam</option>
                                            <option value="female">Nữ</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <button className="update-button" onClick={handleUpdateInfo}>
                                    <i className="fa fa-save"></i>
                                    Cập nhật thông tin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default infomationAccount;