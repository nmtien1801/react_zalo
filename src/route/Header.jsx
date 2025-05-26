import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import {
  MessageCircle,
  Users,
  Cloud,
  Calendar,
  Briefcase,
  Bot
} from "lucide-react";

import AccountSetting from "../page/accountSetting/accountSetting";
import { useSelector, useDispatch } from "react-redux";
import "./Header.css";
import { getFriendRequestsService, getGroupJoinRequestsService } from "../service/friendRequestService";

const Header = (props) => {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  // const [showDropdown, setShowDropdown] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const user = useSelector((state) => state.auth.userInfo);
  const socketRef = props.socketRef;

  const friendRequests = props.friendRequests;
  const groupRequests = props.groupRequests;
  const setFriendRequests = props.setFriendRequests;
  const setGroupRequests = props.setGroupRequests;

  // Gọi API và lắng nghe socket
  useEffect(() => {
    const fetchRequests = async () => {
      const resFriend = await getFriendRequestsService();
      setFriendRequests(resFriend.DT || []);
      const resGroup = await getGroupJoinRequestsService();

      setGroupRequests(resGroup.DT || []);
    };

    fetchRequests();

    const handleFriend = async () => {
      const res = await getFriendRequestsService();
      setFriendRequests(res.DT || []);
    };
    const handleGroup = async () => {
      const res = await getGroupJoinRequestsService();
      setGroupRequests(res.DT || []);
    };

    if (socketRef.current) {
      socketRef.current.on("RES_ADD_FRIEND", handleFriend);
      socketRef.current.on("RES_REJECT_FRIEND", handleFriend);
      socketRef.current.on("RES_ACCEPT_FRIEND", handleFriend);
      socketRef.current.on("RES_CANCEL_FRIEND", handleFriend);
      socketRef.current.on("RES_ADD_GROUP", handleGroup);
      socketRef.current.on("RES_REJECT_FRIEND", handleGroup);
      socketRef.current.on("RES_ACCEPT_GROUP", handleGroup);
    }

  }, [socketRef]);

  // reload page chat
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === "/chat") {
      window.location.reload();
    }
  };


  return (
    <Navbar
      className="d-flex flex-column bg-primary h-100 py-2"
      sticky="top"
      style={{ width: "56px" }}
    >
      <Container fluid className="d-flex flex-column align-items-center">
        {/* Logo or app name */}
        <Navbar.Brand as={NavLink} className="mb-4 mt-2 m-0">
          <img
            src={user.avatar ? user.avatar : "https://i.imgur.com/cIRFqAL.png"}
            alt="Profile"
            className="rounded-circle border border-2 border-white"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
        </Navbar.Brand>

        {/* Menu content */}
        <Nav className="d-flex flex-column w-85">
          <Nav.Link as={NavLink} to="/chat" className="fw-normal" onClick={handleClick}>
            <MessageCircle size={24} />
          </Nav.Link>
          <Nav.Link as={NavLink} to="/danh-ba" className="fw-normal position-relative">
            <Users size={24} />
            {(friendRequests.length > 0 || groupRequests.length > 0) && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: 10, minWidth: 18 }}
              >
                {friendRequests.length + groupRequests.length}
              </span>
            )}
          </Nav.Link>

          <Nav.Link as={NavLink} to="/chatBot" className="fw-normal">
            <Bot size={24} />
          </Nav.Link>
        </Nav>
      </Container>

      {/* Settings at bottom */}
      <div className="mt-auto text-center d-flex flex-column align-items-center gap-4">
        <div className="btn btn-link p-0 text-white opacity-75 hover-opacity-100">
          {/* <Settings size={24} /> */}
          <AccountSetting
            handleClose={() => setShowModal(false)}
            content={modalContent}
            socketRef={socketRef}
          />
        </div>
      </div>
    </Navbar>
  );
};

export default Header;
