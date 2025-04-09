import React, { useState } from "react";
import { changePassword } from "../redux/authSlice";
import { useSelector, useDispatch } from "react-redux";

const ChangePassword = ({ toggleModalChangePassword }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const user = useSelector((state) => state.auth.userInfo);

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validate form
    const validateForm = () => {
        let tempErrors = {};
        if (!formData.currentPassword) {
            tempErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        }
        if (!formData.newPassword) {
            tempErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (formData.newPassword.length < 4) {
            tempErrors.newPassword = "Mật khẩu mới phải có ít nhất 4 ký tự";
        }
        if (formData.newPassword !== formData.confirmPassword) {
            tempErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        let tempErrors = {};
        if (validateForm()) {
            let res = await dispatch(changePassword({
                phone: user.phone,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            }));
            if (res.payload.EC !== 0) {
                tempErrors.currentPassword = `${res.payload.EM}`
                setErrors(tempErrors);
                return Object.keys(tempErrors).length === 0;
            } else {
                toggleModalChangePassword(); // Đóng modal sau khi thành công

            }
        }
    };

    return (
        <div className="d-flex flex-column flex-1 setting-right w-0 setting--content-right tg-slide-in-right-enter-done">
            <button
                className="btn btn-outline-secondary btn-sm rounded-circle setting__close"
                onClick={toggleModalChangePassword}
            >
                <i className="fa fa-close"></i>
            </button>

            <div className="min-vh-100 bg-light p-4">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-6">
                            <h2 className="h4 mb-4">Đổi mật khẩu</h2>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="currentPassword" className="form-label">
                                        Mật khẩu hiện tại
                                    </label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                    />
                                    {errors.currentPassword && (
                                        <div className="invalid-feedback">{errors.currentPassword}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="newPassword" className="form-label">
                                        Mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                    />
                                    {errors.newPassword && (
                                        <div className="invalid-feedback">{errors.newPassword}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    {errors.confirmPassword && (
                                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-end mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-secondary me-2"
                                        onClick={toggleModalChangePassword}
                                    >
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;