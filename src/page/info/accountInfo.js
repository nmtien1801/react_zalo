import React, { useState } from 'react';
import { RiGroupLine, RiDeleteBin7Line } from "react-icons/ri";
import { TiBusinessCard } from "react-icons/ti";
import { MdBlock } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import './accountInfo.scss';

const AccountInfo = ({ isOpen, closeModal }) => {
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
                                <img src="https://picsum.photos/200/300"
                                    alt="Profile"
                                    className="profile-image-background"
                                />
                                <div className="horizontal-row">
                                    <img
                                        src="https://picsum.photos/200/300"
                                        alt="Profile"
                                        className="profile-image"
                                    />
                                    <div className="profile-name">
                                        Nhi Nhi <span className="verified-icon">✔</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <button className="action-btn call">Gọi điện</button>
                                <button className="action-btn text">Nhắn tin</button>
                            </div>
                        </div>

                        <div className="info-section">
                            <p className="bio-text">Thông tin cá nhân</p>
                            <div className="info-item">
                                <span className="info-label">Bio</span>
                                <span className="info-value">cô lên tiếng ưuuu!!! @HDTN103</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Giới tính</span>
                                <span className="info-value">Nữ</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Ngày sinh</span>
                                <span className="info-value">03/11</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Điện thoại</span>
                                <span className="info-value">********</span>
                            </div>
                        </div>

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
                                    <button className="footer-btn">Xóa danh sách bạn bè</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default AccountInfo;
