import React, { useEffect, useState } from "react";
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

function App() {
  const dispatch = useDispatch();
  let isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.userInfo);

  const fetchDataAccount = async () => {
    if (!user || !user?.access_Token) {
      await dispatch(doGetAccount()); // Gọi API
    }
  };

  useEffect(() => {
    fetchDataAccount();
  }, [dispatch, user?.access_Token]); // Chỉ phụ thuộc vào dispatch và access_Token

  return (
    <Router>
      <div className="container-fluid vh-100 d-flex">
        {/* Header bên trái */}
        {isLoggedIn && <Header />}

        {/* Nội dung chính */}
        <div className="content flex-grow-1 d-flex justify-content-center align-items-center">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/chat" element={isLoggedIn && <Chat />} />
            <Route path="/danh-ba" element={isLoggedIn && <DanhBa />} />
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
    </Router>
  );
}

export default App;
