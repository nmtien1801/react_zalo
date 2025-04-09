import React, { useEffect, useState } from "react";
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
import { useSelector, useDispatch } from "react-redux";

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const user = useSelector((state) => state.auth.userInfo);

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
            src={user.avatar ? user.avatar : "/placeholder.svg"}
            alt="Profile"
            className="rounded-circle border border-2 border-white"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
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
    </Navbar>
  );
};

export default Header;
