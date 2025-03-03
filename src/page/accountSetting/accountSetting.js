import React, { useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Dropdown } from 'react-bootstrap';

import './accountSetting.css';

import SettingModel from "./settingModel";
import InfomationAccount from "./infomationAccount";

const CustomModal = () => {

    const [isOpen, setIsOpen] = useState(false);
    const [isDataSubmenuOpen, setIsDataSubmenuOpen] = useState(false);
    const [isLanguageSubmenuOpen, setIsLanguageSubmenuOpen] = useState(false);
    const [isChatHelpSubmenuOpen, setIsChatHelpSubmenuOpen] = useState(false);

    const [isOpenModelSetting, setIsOpenModelSetting] = useState(false);
    const [isOpenModelInfomationAccount, setIsOpenModelInfomationAccount] = useState(false);

    const toggleDropdown = () => {
        if(!isOpen) {
            setIsDataSubmenuOpen(false);
            setIsLanguageSubmenuOpen(false);
            setIsChatHelpSubmenuOpen(false);
        }
        setIsOpen(!isOpen);
    };

    const toggleDataSubmenu = () => {
        setIsDataSubmenuOpen(!isDataSubmenuOpen);
        setIsLanguageSubmenuOpen(false);
        setIsChatHelpSubmenuOpen(false);
    };
    
    const toggleLanguageSubmenu = () => {
        setIsLanguageSubmenuOpen(!isLanguageSubmenuOpen);
        setIsDataSubmenuOpen(false);
        setIsChatHelpSubmenuOpen(false);
    };

    const toggleChatHelpSubmenu = () => {
        setIsChatHelpSubmenuOpen(!isChatHelpSubmenuOpen);
        setIsDataSubmenuOpen(false);
        setIsLanguageSubmenuOpen(false);
    };

    const toggleModalSetting = () => {
        if(!isOpenModelSetting) {
            toggleDropdown();
        }
        setIsOpenModelSetting(!isOpenModelSetting);
    };

    const toggleModalInfomation = () => {
        if(!isOpenModelInfomationAccount) {
            toggleDropdown();
        }
        setIsOpenModelInfomationAccount(!isOpenModelInfomationAccount);
    };
    
    const handleItemClick = (content) => {
        setIsOpen(false); 
    };

    return (
        <div className="custom-dropdown">
          <button className="leftbar-tab" onClick={toggleDropdown}>
            <div class="mmi-icon-wr">
                <div class="z-noti-badge-container">
                    <i class="fa fa-cog internal-icon"></i>
                </div>
            </div>
          </button>
          {isOpen && (
            <div className="zmenu-body has-submenu">
                <div className="zmenu-item" onClick={toggleModalInfomation}>
                    <i className="fa fa-user menu-icon left"></i>
                    <span>Thông tin tài khoản</span>
                </div>
                <div className="zmenu-item" onClick={toggleModalSetting}>
                    <i className="fa fa-cog menu-icon left"></i>
                    <span>Cài đặt</span>
                </div>
                <div className="zmenu-separator"></div>
                <div className="zmenu-item has-submenu" onClick={toggleDataSubmenu}>
                    <i className="fa fa-database menu-icon left"></i>
                    <span>Dữ liệu</span>
                    <i className="fa fa-angle-right trailing-icon"></i>
                </div>
                {isDataSubmenuOpen && (
                    <div className="zmenu-sub">
                    <div className="zmenu-item" onClick={() => handleItemClick('Đồng bộ tin nhắn')}>
                        Đồng bộ tin nhắn
                    </div>
                    <div className="zmenu-item" onClick={() => handleItemClick('Quản lý dữ liệu')}>
                        Quản lý dữ liệu
                    </div>
                    <div className="zmenu-separator"></div>
                    <div className="zmenu-item" onClick={() => handleItemClick('Khác')}>
                        Khác
                    </div>
                    </div>
                )}
                <div className="zmenu-item has-submenu" onClick={toggleLanguageSubmenu}>
                    <i className="fa fa-language menu-icon left"></i>
                    <span>Ngôn ngữ</span>
                    <i className="fa fa-angle-right trailing-icon"></i>
                </div>
                {isLanguageSubmenuOpen && (
                    <div className="zmenu-sub">
                        <div className="zmenu-item" onClick={() => handleItemClick('Tiếng Việt')}>
                            Tiếng Việt
                        </div>
                        <div className="zmenu-item" onClick={() => handleItemClick('English')}>
                            English
                        </div>
                    </div>
                )}
                <div className="zmenu-item has-submenu" onClick={toggleChatHelpSubmenu}>
                    <i className="fa fa-question-circle menu-icon left"></i>
                    <span>Hỗ trợ</span>
                    <i className="fa fa-angle-right trailing-icon"></i>
                </div>
                {isChatHelpSubmenuOpen && (
                    <div className="zmenu-sub">
                        <div className="zmenu-item" onClick={() => handleItemClick('Tiếng Việt')}>
                            Thông tin phiên bản
                        </div>
                        <div className="zmenu-item" onClick={() => handleItemClick('English')}>
                            Liên hệ
                        </div>
                        <div className="zmenu-item" onClick={() => handleItemClick('English')}>
                            Gửi file log đến Zalo
                        </div>
                        <div className="zmenu-separator"></div>
                        <div className="zmenu-item" onClick={() => handleItemClick('English')}>
                           Phím tắt
                        </div>
                    </div>
                )}
                <div className="zmenu-separator"></div>
                <div className="zmenu-item" onClick={() => handleItemClick('Đăng xuất')}>
                    <i className="menu-icon left"></i>
                    <span className="logout">Đăng xuất</span>
                </div>
                <div className="zmenu-item" onClick={() => handleItemClick('Đăng xuất')}>
                    <i className="menu-icon left"></i>
                    <span>Thoát</span>
                </div>
            </div>

        )}


        {isOpenModelSetting && (
            <SettingModel toggleModalSetting={toggleModalSetting} />
        )}

        {isOpenModelInfomationAccount && (
            <InfomationAccount toggleModalInfomation={toggleModalInfomation} />
        )}

        </div>
      );
};

export default CustomModal;