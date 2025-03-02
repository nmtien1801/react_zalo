// GroupInfoModal.js
import React, { useState } from 'react';
import { CiCamera } from "react-icons/ci";
import { IoIosLink } from "react-icons/io";
import { PiCopySimple } from "react-icons/pi";
import { RiShareForwardLine } from "react-icons/ri";
import { IoSettingsOutline, IoExitOutline } from "react-icons/io5";
import './groupInfo.scss';

const GroupInfo = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <div className="group-modal-container">
            {/* Button to trigger the modal */}
            <button className="open-btn" onClick={openModal}>
                Xem thông tin nhóm
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="header">
                            <span className="header-text">Thông tin nhóm</span>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>

                        <div className="group-header">
                            <div className="group">
                                <div className="image">
                                    <img
                                        src="https://picsum.photos/200/300"
                                        alt="Group"
                                        className="group-image"
                                    />
                                    <CiCamera className="icon" />
                                </div>
                                <div className="group-name">
                                    Cộng Nghề Mới
                                </div>
                            </div>
                            <button className="message-btn">Nhắn tin</button>
                        </div>

                        <div className="members-section">
                            <div className="members-title">Thành viên (5)</div>
                            <div className="member-list">
                                <img src="https://picsum.photos/200/300" alt="Member 1" className="member-avatar" />
                                <img src="https://picsum.photos/200/300" alt="Member 2" className="member-avatar" />
                                <img src="https://picsum.photos/200/300" alt="Member 3" className="member-avatar" />
                                <img src="https://picsum.photos/200/300" alt="Member 4" className="member-avatar" />
                                <div className="member-avatar">...</div>
                            </div>
                        </div>

                        <div className="media-section">
                            <div className="media-title">Ảnh/Video</div>
                            <div className="photo-grid">
                                <img src="https://picsum.photos/200/300" alt="Photo 1" className="photo-item" />
                                <img src="https://picsum.photos/200/300" alt="Photo 2" className="photo-item" />
                                <img src="https://picsum.photos/200/300" alt="Photo 3" className="photo-item" />
                                <img src="https://picsum.photos/200/300" alt="Photo 3" className="photo-item" />
                            </div>
                        </div>

                        <div className="footer-actions">
                            <div className="link-section">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <IoIosLink className="icon" />
                                    <div>
                                        <div className="link-title">Link tham gia nhóm</div>
                                        <a
                                            href="https://zalo.me/g/sckesm041"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group-link"
                                        >
                                            https://zalo.me/g/sckesm041
                                        </a>
                                    </div>
                                </div>
                                <div className="link-actions">
                                    <PiCopySimple className="link-btn" />
                                    <RiShareForwardLine className="link-btn" />
                                </div>
                            </div>
                            <div className="link-section">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                                    <IoSettingsOutline className="icon" />
                                    <div className="link-title">Quản lý nhóm</div>
                                </div>
                            </div>

                            <div className="link-section">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "red" }}>
                                    <IoExitOutline className="icon" />
                                    <div className="link-title">Rời nhóm</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupInfo;