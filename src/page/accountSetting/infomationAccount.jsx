import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { uploadAvatar, uploadProfile } from '../../redux/profileSlice.js'
import { uploadAvatarProfile } from '../../redux/authSlice.js'
import { useNavigate } from "react-router-dom";

const infomationAccount = ({ toggleModalInfomation }) => {
    const user = useSelector((state) => state.auth.userInfo);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [avatarUrl, setAvatarUrl] = useState("");
    const fileInputRef = useRef(null); // Ref để truy cập input file ẩn
    const [userUpdate, setUserUpdate] = useState({
        phone: user.phone,
        email: user.email,
        username: user.username,
        dob: user.dob,
        gender: user.gender,
    });

    useEffect(() => {
        if (user.avatar) {
            setAvatarUrl(user.avatar);
        }
    }, [user.avatar])

    // Xử lý upload file
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            alert('k co file')
            return;
        }


        const formData = new FormData();
        formData.append("avatar", selectedFile);

        try {
            const response = await dispatch(uploadAvatar({ formData }));
            const { EM, EC, DT } = response.payload;

            if (EC === 0) {
                setAvatarUrl(DT); // link ảnh server trả về
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert('err')
        }
    };

    // Kích hoạt input file khi nhấn nút
    const handleButtonClick = () => {
        fileInputRef.current.click(); // Mở dialog chọn file
    };

    const handleChange = (field) => (e) => {
        setUserUpdate((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleUpdateInfo = async () => {
        let data = {
            ...userUpdate,
            avatar: avatarUrl,
        };

        let res = await dispatch(uploadProfile(data));
        if (res.payload.EC === 0) {
            toggleModalInfomation()
        }
    };

    return (
        <div className="zl-modal animated fadeIn">
            <div className="zl-modal__container flx-1 flx flx-center flx-al-c ovf-hidden">
                <div className="zl-modal__dialog flx flx-col animated zoomIn no-border zl-infomation-account">

                    <div className="zl-modal__dialog__header flx flx-sp-btw ">
                        <div className="flx flx-al-c flx-1 z-flex truncate">
                            <div className="truncate">
                                <span className="zl-modal__dialog__header__title-text v0 truncate black" title="Thông tin tài khoản">Thông tin tài khoản</span>
                            </div>
                            <div icon="close f16" className="z--btn--v2 k-close btn-tertiary-neutral medium modal-header-icon --full-rounded icon-only modal-header-icon" data-disabled="" title="" onClick={toggleModalInfomation}><i className="fa fa-close f16 pre"></i></div>
                        </div>
                    </div>

                    <div id="zl-modal__dialog-body" className="zl-modal__dialog-body no-padding free-height ">
                        <div className="k-flex">
                            <div className="stack-navigation k-body-info" >
                                <div className="stack-page">
                                    <div className="k-body-container">
                                        <div className="k-body-main">
                                            <div className="pi-info-layout">
                                                <div className="pi-info-cover clickable rel">
                                                    <img src="https://cover-talk.zadn.vn/8/4/5/f/12/0e029b40ab888036e163cd19734fe529.jpg" crossOrigin="Anonymous" /></div>
                                                <div className="pi-info-layout__primary-info-container pi-info-layout__primary-info-container_has-cover">
                                                    <div className="pi-info-layout__mini-info-container">
                                                        <div className="pi-mini-info-section">
                                                            <div className="rel zavatar-container pi-mini-info-section__avatar">
                                                                <div className="zavatar zavatar-xxll zavatar-single flx flx-al-c flx-center rel disableDrag clickable">
                                                                    <img draggable="false"
                                                                        src={avatarUrl ? avatarUrl : "https://s120-ava-talk.zadn.vn/2/2/d/9/20/120/0e029b40ab888036e163cd19734fe529.jpg"}
                                                                        className="a-child" /></div>
                                                                <div icon="Camera_24_Line" className="z--btn--v2 btn-neutral medium pi-mini-info-section__ava-icon --full-rounded icon-only pi-mini-info-section__ava-icon" title="Cập nhật ảnh đại diện">
                                                                    {/* Input file ẩn */}
                                                                    <input
                                                                        type="file"
                                                                        accept="image/jpeg,image/png"
                                                                        onChange={handleFileChange}
                                                                        ref={fileInputRef}
                                                                        style={{ display: "none" }} // Ẩn input
                                                                    />

                                                                    {/* Nút tùy chỉnh */}
                                                                    <i className="fa fa-camera pre" onClick={handleButtonClick} ></i></div>
                                                            </div>
                                                            <div className="pi-mini-info-section__info">
                                                                <div className="pi-mini-info-section__name" >
                                                                    <div className="k-flx rel k-flx-row">
                                                                        <div className="truncate black">{user.username}</div>
                                                                        <div icon="Edit_1_24_Line" className="z--btn--v2 btn-tertiary-neutral small ml-8 f16 --full-rounded icon-only ml-8 f16" data-disabled="" data-translate-title="Chỉnh sửa" title="Chỉnh sửa"><i className="fa fa-edit pre"></i></div>
                                                                    </div>
                                                                </div>
                                                                <div className="pi-mini-info-section__label"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pi-info-layout__extra-info-container">
                                                    <div className="pi-info-card">
                                                        <span className="pi-info-card__title pi-info-card__title_emphasized" data-translate-inner="STR_PERSONAL_INFO" data-translate-text-arguments="[&quot;&quot;]">Thông tin cá nhân</span>
                                                        <div className="pi-info-section">
                                                            <div className="pi-info-section__info-list">

                                                                <div className="pi-info-item pi-info-item_horizontal">
                                                                    <div className="pi-info-item__content">
                                                                        <span className="pi-info-item__title" data-translate-inner="STR_PROFILE_LABEL_GENDER">Tên người dùng</span>
                                                                        <span className="content-copiable">
                                                                            <input className="pi-info-item__desc black" type="text" value={userUpdate.username} onChange={handleChange("username")} />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="pi-info-item pi-info-item_horizontal">
                                                                    <div className="pi-info-item__content">
                                                                        <span className="pi-info-item__title" data-translate-inner="STR_PROFILE_LABEL_GENDER">Email</span>
                                                                        <span className="content-copiable">
                                                                            <p className="pi-info-item__desc black">{user.email}</p>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="pi-info-item pi-info-item_horizontal">
                                                                    <div className="pi-info-item__content">
                                                                        <span className="pi-info-item__title" data-translate-inner="STR_PROFILE_PHONENUMBER">Điện thoại</span>
                                                                        <span className="content-copiable">
                                                                            <p className="pi-info-item__desc black">{user.phone}</p>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="pi-info-item pi-info-item_horizontal">
                                                                    <div className="pi-info-item__content">
                                                                        <span className="pi-info-item__title" data-translate-inner="STR_PROFILE_LABEL_BIRTHDAY">Ngày sinh</span>
                                                                        <span className="content-copiable">
                                                                            <input className="pi-info-item__desc black" type="text" value={userUpdate.dob} onChange={handleChange("dob")} />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="pi-info-item pi-info-item_horizontal">
                                                                    <div className="pi-info-item__content">
                                                                        <span className="pi-info-item__title" data-translate-inner="STR_PROFILE_LABEL_GENDER">Giới tính</span>
                                                                        <span className="content-copiable">
                                                                            <input className="pi-info-item__desc black" type="text" value={userUpdate.gender} onChange={handleChange("gender")} />
                                                                        </span>
                                                                    </div>
                                                                    <p className="pi-info-item__subtitle ">Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này</p>
                                                                </div>
                                                            </div>
                                                            <div className="pi-info-section__cta">
                                                                <div className="seperator"></div>
                                                                <div className="z--btn--v2 btn-tertiary-neutral medium  --full-width" data-disabled="" title="" onClick={() => handleUpdateInfo()}><i className="fa fa-pencil-alt mr-4"></i><span data-translate-inner="STR_UPDATE">Cập nhật</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div >
                                            <div ></div>
                                        </div>
                                        <div id="scroll-vertical" >
                                            <div ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="zl-mini-notification mn-modal"></div>

                </div>
            </div>
        </div>
    );
}

export default infomationAccount;