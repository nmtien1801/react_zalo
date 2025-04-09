import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import { NavLink } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import {
  MessageCircle,
  Users,
  CheckSquare,
  Cloud,
  Calendar,
  Briefcase,
  Settings,
} from "lucide-react";

import AccountSetting from "../page/accountSetting/accountSetting";

import SettingModel from "../page/accountSetting/settingModel";
import InfomationAccount from "../page/accountSetting/infomationAccount";

import "./Header.css"; 

import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { logoutUserService } from "../service/authService";

const Header = () => {
  const [showModal, setShowModal] = useState(false);

  const userInfo = useSelector((state) => state.auth.userInfo);

  const dispatch = useDispatch();

  const [showDropdown, setShowDropdown] = useState(false);

  const [modalContent, setModalContent] = useState("");

  const [isOpenModelSetting, setIsOpenModelSetting] = useState(false);
  const [isOpenModelInfomationAccount, setIsOpenModelInfomationAccount] = useState(false);

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

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      const response = await logoutUserService();
  
      if (response.EC === 2) {
        dispatch(logout());
  
        localStorage.removeItem("access_Token");
        localStorage.removeItem("refresh_Token");
  
        alert("Đăng xuất thành công!");
        window.location.href = "/login"; 
      } else {
        alert(response.EM || "Đăng xuất thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi logout:", error);
      alert("Đã xảy ra lỗi khi đăng xuất.");
    }
  }

  return (
    <Navbar
      className="d-flex flex-column bg-primary h-100 py-2"
      sticky="top"
      style={{ width: "64px" }}
    >
      <Container fluid className="d-flex flex-column align-items-center">
        {/* Logo or app name */}
        <Navbar.Brand as={NavLink} className="mb-4 mt-2 m-3">
          <img
            src={userInfo?.avatar || "https://i.imgur.com/cIRFqAL.png"}
            alt="Profile"
            className="rounded-circle border border-2 border-white"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
            onClick={toggleDropdown}
          />
          {showDropdown && (
            <div className="dropdown-menu-custom">
              <div className="dropdown-header">{userInfo?.username || "Người dùng"}</div>
              <div className="dropdown-item">
                <span>Nâng cấp tài khoản</span>
                <i className="bi bi-box-arrow-up-right"></i>
              </div>
              <div className="dropdown-item" onClick={toggleModalInfomation}>Hồ sơ của bạn</div>
              <div className="dropdown-item">Cài đặt</div>
              <hr className="dropdown-divider" />
              <div className="dropdown-item text-danger" onClick={handleLogout}>Đăng xuất</div>
            </div>
          )}
        </Navbar.Brand>

        {/* Menu content */}
        <Nav className="d-flex flex-column w-100">
          <Nav.Link as={NavLink} to="/chat" className="fw-normal">
            <MessageCircle size={24} />
          </Nav.Link>
          <Nav.Link as={NavLink} to="/danh-ba" className="fw-normal">
            <Users size={24} />
          </Nav.Link>

          <Nav.Link as={NavLink} to="/to-do/call/room1" className="fw-normal">
            <CheckSquare size={24} />
          </Nav.Link>
        </Nav>
      </Container>

      {/* Settings at bottom */}
      <div className="mt-auto text-center d-flex flex-column align-items-center gap-4">
        <button className="btn btn-link p-0 text-white opacity-75 hover-opacity-100">
          <Cloud size={24} />
        </button>
        <button className="btn btn-link p-0 text-white opacity-75 hover-opacity-100">
          <Calendar size={24} />
        </button>
        <button className="btn btn-link p-0 text-white opacity-75 hover-opacity-100">
          <Briefcase size={24} />
        </button>
        <div className="btn btn-link p-0 text-white opacity-75 hover-opacity-100">
          {/* <Settings size={24} /> */}
          <AccountSetting
            handleClose={() => setShowModal(false)}
            content={modalContent}
          />
        </div>
      </div>

      {isOpenModelSetting && (
          <SettingModel toggleModalSetting={toggleModalSetting} />
      )}

      {isOpenModelInfomationAccount && (
          <InfomationAccount toggleModalInfomation={toggleModalInfomation} />
      )}

    </Navbar>
  );
};

export default Header;
