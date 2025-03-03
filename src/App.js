import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "font-awesome/css/font-awesome.min.css";
import Login from "./page/auth/Login";
import Header from "./route/Header";
import Chat from "./page/chat/Chat";
import DanhBa from "./page/danhBa/DanhBa";
import AccountInfo from "./page/info/accountInfo";
import GroupInfo from "./page/info/groupInfo";

function App() {
  return (
    <Router>
      <div className="container-fluid vh-100 d-flex">
        {/* Header bên trái */}
        <Header />

        {/* Nội dung chính */}
        <div className="content flex-grow-1 d-flex justify-content-center align-items-center">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/danh-ba" element={<DanhBa />} />
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
