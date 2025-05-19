import React, { useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "font-awesome/css/font-awesome.min.css";
import Login from "./page/auth/Login";
import Header from "./route/Header";
import Chat from "./page/chat/Chat";
import DanhBa from "./page/danhBa/DanhBa";
import Register from "./page/auth/Register";
import { useSelector, useDispatch } from "react-redux";
import { doGetAccount } from "./redux/authSlice";
import ChatInfoPanel from "./page/danhBa/DanhBa";
import ResetPassword from "./page/auth/ResetPassword";
import io from "socket.io-client";
import VideoCallModal from "../src/component/VideoCallModal.jsx"

function App() {
  const dispatch = useDispatch();
  let isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.userInfo);
  const socketRef = useRef();
  const [jitsiUrl, setJitsiUrl] = useState(null);

  // connect docket
  useEffect(() => {
    const socket = io.connect(import.meta.env.VITE_BACKEND_URL);

    socketRef.current = socket;
  }, []);
  // console.log("Connected to socket server with ID:", socketRef);

  // action socket
  useEffect(() => {
    if (user && user._id) {
      socketRef.current.emit("register", user._id);
    }

    socketRef.current.on("RES_CALL", (from, to) => {
      setIncomingCall(from);
      setReceiver(to);

      const members = to.members || [];
      const membersString = members.join("-");
      setJitsiUrl(`https://meet.jit.si/${membersString}`);
    });

    socketRef.current.on("RES_END_CALL", () => {
      setIsCalling(false);
      setIncomingCall(null);
      setIsInitiator(false);
      setReceiver(null);
    });
  }, [user]);

  const fetchDataAccount = async () => {
    if (!user || !user?.access_Token) {
      await dispatch(doGetAccount()).unwrap(); // Chờ API hoàn tất
    }
  };

  useEffect(() => {
    fetchDataAccount();
  }, [dispatch, user?.access_Token]); // Chỉ phụ thuộc vào dispatch và access_Token

  const [friendRequests, setFriendRequests] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);

  // Trạng thái cuộc gọi
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [receiver, setReceiver] = useState(null);


  // Hàm xử lý cuộc gọi
  const handleStartCall = (caller, callee) => {
    setIsCalling(true);
    setIsInitiator(true);
    setReceiver(callee);
    socketRef.current.emit("REQ_CALL", caller, callee);
  };

  const acceptCall = () => {
    setIsCalling(true);
    setIncomingCall(null);
  };

  const endCall = () => {
    socketRef.current.emit("REQ_END_CALL", user, receiver);
    setIsCalling(false);
    setIncomingCall(null);
    setIsInitiator(false);
    setReceiver(null);
  };

  return (
    <Router>
      <div className="w-100 vh-100 overflow-hidden d-flex">
        {/* Header bên trái */}
        {isLoggedIn && <Header
          socketRef={socketRef}
          friendRequests={friendRequests}
          setFriendRequests={setFriendRequests}
          groupRequests={groupRequests}
          setGroupRequests={setGroupRequests}
        />}

        {/* Nội dung chính */}
        <div className="content flex-grow-1 d-flex justify-content-center align-items-center">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ResetPassword />} />

            <Route path="/chat" element={isLoggedIn && <Chat socketRef={socketRef} handleStartCall={handleStartCall} />} />
            <Route
              path="/danh-ba"
              element={
                isLoggedIn && (
                  <DanhBa
                    socketRef={socketRef}
                    friendRequests={friendRequests}
                    setFriendRequests={setFriendRequests}
                    groupRequests={groupRequests}
                    setGroupRequests={setGroupRequests}
                  />
                )
              }
            />
          </Routes>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Call Screen Modal */}
      {!isInitiator && incomingCall && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center p-4">
                <h5 className="mb-3">{incomingCall.username} đang gọi bạn...</h5>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-success"
                    onClick={acceptCall}
                  >
                    Chấp nhận
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={endCall}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCalling && (
        <VideoCallModal
          show={isCalling}
          onHide={endCall}
          jitsiUrl={jitsiUrl}
          socketRef={socketRef}
          isInitiator={isInitiator}
        />
      )}


    </Router>
  );
}

export default App;
