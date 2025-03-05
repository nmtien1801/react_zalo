import React, { useEffect, useState } from "react";

import './settingModel.css';

const infomationAccount = ({toggleModalInfomation}) => {
    return (
        <div className="zl-modal animated fadeIn">
        <div className="zl-modal__container flx-1 flx flx-center flx-al-c ovf-hidden">
            <div className="zl-modal__dialog flx flx-col animated zoomIn no-border zl-infomation-account">
            
    <div className="zl-modal__dialog__header flx flx-sp-btw ">
        <div className="flx flx-al-c flx-1 z-flex truncate">
            <div className="truncate">
                <span className="zl-modal__dialog__header__title-text v0 truncate " title="Thông tin tài khoản">Thông tin tài khoản</span>
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
                                <div className="pi-info-cover clickable rel"><img src="https://cover-talk.zadn.vn/8/4/5/f/12/0e029b40ab888036e163cd19734fe529.jpg" crossorigin="Anonymous" /></div>
                                <div className="pi-info-layout__primary-info-container pi-info-layout__primary-info-container_has-cover">
                                    <div className="pi-info-layout__mini-info-container">
                                        <div className="pi-mini-info-section">
                                            <div className="rel zavatar-container pi-mini-info-section__avatar">
                                                <div className="zavatar zavatar-xxll zavatar-single flx flx-al-c flx-center rel disableDrag clickable"><img draggable="false" src="https://s120-ava-talk.zadn.vn/2/2/d/9/20/120/0e029b40ab888036e163cd19734fe529.jpg" className="a-child" /></div>
                                                <div icon="Camera_24_Line" className="z--btn--v2 btn-neutral medium pi-mini-info-section__ava-icon --full-rounded icon-only pi-mini-info-section__ava-icon" data-disabled="" data-translate-title="Cập nhật ảnh đại diện" title="Cập nhật ảnh đại diện"><i className="fa fa-camera pre"></i></div>
                                            </div>
                                            <div className="pi-mini-info-section__info">
                                                <div className="pi-mini-info-section__name" >
                                                    <div className="k-flx rel k-flx-row">
                                                        <div className="truncate" title="Võ Trường Khang">Võ&nbsp;Trường&nbsp;Khang</div>
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
                                                        <span className="pi-info-item__title" data-translate-inner="STR_BIO">Bio</span>
                                                        <span className="content-copiable">
                                                            <div className="pi-group-description" ><span className="emoji-sizer emoji-outer " >❤</span><span className="emoji-sizer emoji-outer " >❤</span></div>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pi-info-item pi-info-item_horizontal">
                                                    <div className="pi-info-item__content">
                                                        <span className="pi-info-item__title" data-translate-inner="STR_PROFILE_LABEL_GENDER">Giới tính</span>
                                                        <span className="content-copiable">
                                                            <p className="pi-info-item__desc ">Nam</p>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pi-info-item pi-info-item_horizontal">
                                                    <div className="pi-info-item__content">
                                                        <span className="pi-info-item__title" data-translate-inner="STR_PROFILE_LABEL_BIRTHDAY">Ngày sinh</span>
                                                        <span className="content-copiable">
                                                            <p className="pi-info-item__desc ">28 tháng 09, 2003</p>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pi-info-item pi-info-item_horizontal">
                                                    <div className="pi-info-item__content">
                                                        <span className="pi-info-item__title" data-translate-inner="STR_PROFILE_PHONENUMBER">Điện thoại</span>
                                                        <span className="content-copiable">
                                                            <p className="pi-info-item__desc ">+84 974 867 266</p>
                                                        </span>
                                                    </div>
                                                    <p className="pi-info-item__subtitle ">Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này</p>
                                                </div>
                                            </div>
                                            <div className="pi-info-section__cta">
                                                <div className="seperator"></div>
                                                <div className="z--btn--v2 btn-tertiary-neutral medium  --full-width" data-disabled="" title=""><i className="fa fa-pencil-alt mr-4"></i><span data-translate-inner="STR_UPDATE">Cập nhật</span></div>
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