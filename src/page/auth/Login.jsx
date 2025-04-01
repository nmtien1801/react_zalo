"use client";

import { useState } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { Login } from "../../redux/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
    captcha: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle login logic here
    let res = await dispatch(Login(formData));

    if (res.payload.EC === 0) {
      navigate("/chat");
      localStorage.setItem("access_Token", res.payload.DT.access_Token);
      localStorage.setItem("refresh_Token", res.payload.DT.refresh_Token);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center py-4">
      <div
        className="card shadow-lg"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="card-body p-4">
          {/* Logo and Title */}
          <div className="text-center mb-4">
            <h1 className="display-6 text-primary fw-bold mb-3">Zalo</h1>
            <h2 className="fs-5 fw-medium text-dark">Đăng nhập với mật khẩu</h2>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Phone Number Input */}
            <div className="mb-3">
              <div className="input-group">
                <select className="form-select" style={{ maxWidth: "100px" }}>
                  <option value="+84">+84</option>
                </select>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Số điện thoại"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-3 position-relative">
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Mật khẩu"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Captcha Input */}
            <div className="mb-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Mã kiểm tra"
                  name="captcha"
                  value={formData.captcha}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => console.log("Refresh captcha")}
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 mb-3"
              style={{ backgroundColor: "#2962ff" }}
            >
              Đăng nhập
            </button>

            {/* Forgot Password Link */}
            <div className="text-center mb-3">
              <a
                href="#"
                className="text-decoration-none"
                style={{ color: "#2962ff" }}
              >
                Quên mật khẩu?
              </a>
            </div>
          </form>

          {/* QR Code Login Link */}
          <div className="text-center mb-3">
            <a
              href="#"
              className="text-decoration-none"
              style={{ color: "#2962ff" }}
            >
              Đăng nhập qua mã QR
            </a>
          </div>

          <div className="text-center">
            <a
              href="/register"
              className="text-decoration-none"
              style={{ color: "#2962ff" }}
            >
              Đăng ký
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
