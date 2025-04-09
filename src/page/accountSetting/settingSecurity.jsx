import React, { useState } from "react";
import './settingModel.css';
import { ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";
import ChangePassword from "../../component/changePassword";

const SettingSecurity = ({ toggleModalSetting }) => {
    const [isOpenChangePassword, setIsOpenChangePassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const toggleTwoFactor = () => {
        setTwoFactorEnabled(prev => !prev);
    };

    const handleChangePassword = () => {
        setIsOpenChangePassword(true);
    }

    return (
        <div
            id="setting-right"
            className="d-flex flex-column flex-1 setting-right w-0 setting--content-right tg-slide-in-right-enter-done"
        >
            <button
                className="btn btn-outline-secondary btn-sm rounded-circle setting__close"
                onClick={toggleModalSetting}
            >
                <i className="fa fa-close"></i>
            </button>

            {isOpenChangePassword ? (
                <ChangePassword toggleModalChangePassword={() => setIsOpenChangePassword(false)} />
            ) : (<div className="min-vh-100 bg-light p-4">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            {/* Mật khẩu đăng nhập */}
                            <div className="mb-4">
                                <h2 className="h4 mb-2 setting-section-label">Mật khẩu đăng nhập</h2>
                                <div className="card">
                                    <button className="btn btn-light w-100 d-flex justify-content-between align-items-center" onClick={handleChangePassword}>
                                        <span>Đổi mật khẩu</span>
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Khóa màn hình */}
                            <div className="mb-4">
                                <h2 className="h4 mb-2 setting-section-label">Khóa màn hình Zalo</h2>
                                <p className="text-muted small mb-2">
                                    Khóa màn hình Zalo của bạn bằng Ctrl + L, khi bạn không sử dụng máy tính.
                                </p>
                                <div className="card">
                                    <button className="btn btn-light w-100 d-flex justify-content-between align-items-center">
                                        <span>Khóa màn hình Zalo</span>
                                        <div className="d-flex align-items-center">
                                            <span className="me-2 text-muted">Đã tắt</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Bảo mật 2 lớp */}
                            <div>
                                <h2 className="h4 mb-2 setting-section-label">Bảo mật 2 lớp</h2>
                                <div className="card p-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <p className="text-muted small me-3 mb-0">
                                            Sau khi bật, bạn sẽ được yêu cầu nhập mã OTP hoặc xác thực từ thiết bị di động sau khi đăng nhập trên
                                            thiết bị lạ.
                                        </p>
                                        <button
                                            onClick={toggleTwoFactor}
                                            className="btn p-0"
                                            aria-label={twoFactorEnabled ? "Disable two-factor authentication" : "Enable two-factor authentication"}
                                        >
                                            {twoFactorEnabled ? (
                                                <ToggleRight className="h-7 w-7 text-primary" />
                                            ) : (
                                                <ToggleLeft className="h-7 w-7 text-secondary" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>)}


        </div>
    );
};

export default SettingSecurity;