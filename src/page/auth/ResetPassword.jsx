import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {sendCode, resetPassword} from "../../redux/authSlice";

const ResetPassword = ({ onSubmit }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");    // Thông báo cho người dùng
    const [sending, setSending] = useState(false); // Trạng thái gửi mã xác nhận

    const handleSendCode = async () => {
        if (!email) {
            setMessage("Vui lòng nhập email để gửi mã xác nhận");
            return;
        }

        // Gửi mã xác nhận đến email
        setMessage("Đang gửi mã xác nhận...");
        let send = await dispatch(sendCode(email));
        
        if (send.payload.EC !== 0) {
            setMessage(`❌ ${send.payload.EM}`);
        }else if (send.payload.EC === 0){
            setMessage("✅ Mã xác nhận đã được gửi đến email của bạn!");
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !code || !password) {
            setMessage("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            const response = await dispatch(resetPassword({ email, code, password })).unwrap();
            if (response.EC === 0) {
                setMessage("✅ Đặt lại mật khẩu thành công!");
                navigate("/login"); // Chuyển hướng đến trang đăng nhập
            } else {
                setMessage(`❌ ${response.EM}`);
            }
        } catch (err) {
            setMessage("❌ Đã xảy ra lỗi, vui lòng thử lại sau.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h4 className="card-title mb-4 text-center">Đặt lại mật khẩu</h4>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Nhập email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Mã xác nhận (Code)</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nhập mã xác nhận"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handleSendCode}
                                            disabled={sending || !email}
                                        >
                                            {sending ? "Đang gửi..." : "Gửi mã"}
                                        </button>
                                    </div>

                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Nhập mật khẩu mới"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary w-100">
                                    Xác nhận
                                </button>
                            </form>

                            {message && (
                                <div className="alert alert-info mt-3 text-center" role="alert">
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
