import React, { useEffect, useState } from "react";

import './settingModel.css';

const infomationAccount = ({toggleModalInfomation}) => {
    return (
        <div className="zl-modal animated fadeIn">
        <div className="zl-modal__container flx-1 flx flx-center flx-al-c ovf-hidden">
            <div className="zl-modal__dialog flx flx-col animated zoomIn no-border zl-infomation-account">
            
    <div class="zl-modal__dialog__header flx flx-sp-btw ">
        <div class="flx flx-al-c flx-1 z-flex truncate">
            <div class="truncate">
                <span class="zl-modal__dialog__header__title-text v0 truncate " title="Thông tin tài khoản">Thông tin tài khoản</span>
            </div>
            <div icon="close f16" class="z--btn--v2 k-close btn-tertiary-neutral medium modal-header-icon --full-rounded icon-only modal-header-icon" data-disabled="" title="" onClick={toggleModalInfomation}><i class="fa fa-close f16 pre"></i></div>
        </div>
    </div>
    <div id="zl-modal__dialog-body" class="zl-modal__dialog-body no-padding free-height ">
        <div class="k-flex">
            <div class="stack-navigation k-body-info" >
                <div class="stack-page">
                    <div class="k-body-container">
                        <div class="k-body-main">
                            <div class="pi-info-layout">
                                <div class="pi-info-cover clickable rel"><img src="https://cover-talk.zadn.vn/8/4/5/f/12/0e029b40ab888036e163cd19734fe529.jpg" crossorigin="Anonymous" /></div>
                                <div class="pi-info-layout__primary-info-container pi-info-layout__primary-info-container_has-cover">
                                    <div class="pi-info-layout__mini-info-container">
                                        <div class="pi-mini-info-section">
                                            <div class="rel zavatar-container pi-mini-info-section__avatar">
                                                <div class="zavatar zavatar-xxll zavatar-single flx flx-al-c flx-center rel disableDrag clickable"><img draggable="false" src="https://s120-ava-talk.zadn.vn/2/2/d/9/20/120/0e029b40ab888036e163cd19734fe529.jpg" class="a-child" /></div>
                                                <div icon="Camera_24_Line" class="z--btn--v2 btn-neutral medium pi-mini-info-section__ava-icon --full-rounded icon-only pi-mini-info-section__ava-icon" data-disabled="" data-translate-title="Cập nhật ảnh đại diện" title="Cập nhật ảnh đại diện"><i class="fa fa-camera pre"></i></div>
                                            </div>
                                            <div class="pi-mini-info-section__info">
                                                <div class="pi-mini-info-section__name" >
                                                    <div class="k-flx rel k-flx-row">
                                                        <div class="truncate" title="Võ Trường Khang">Võ&nbsp;Trường&nbsp;Khang</div>
                                                        <div icon="Edit_1_24_Line" class="z--btn--v2 btn-tertiary-neutral small ml-8 f16 --full-rounded icon-only ml-8 f16" data-disabled="" data-translate-title="Chỉnh sửa" title="Chỉnh sửa"><i class="fa fa-edit pre"></i></div>
                                                    </div>
                                                </div>
                                                <div class="pi-mini-info-section__label"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="pi-info-layout__extra-info-container">
                                    <div class="pi-info-card">
                                        <span class="pi-info-card__title pi-info-card__title_emphasized" data-translate-inner="STR_PERSONAL_INFO" data-translate-text-arguments="[&quot;&quot;]">Thông tin cá nhân</span>
                                        <div class="pi-info-section">
                                            <div class="pi-info-section__info-list">
                                                <div class="pi-info-item pi-info-item_horizontal">
                                                    <div class="pi-info-item__content">
                                                        <span class="pi-info-item__title" data-translate-inner="STR_BIO">Bio</span>
                                                        <span class="content-copiable">
                                                            <div class="pi-group-description" ><span class="emoji-sizer emoji-outer " >❤</span><span class="emoji-sizer emoji-outer " >❤</span></div>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div class="pi-info-item pi-info-item_horizontal">
                                                    <div class="pi-info-item__content">
                                                        <span class="pi-info-item__title" data-translate-inner="STR_PROFILE_LABEL_GENDER">Giới tính</span>
                                                        <span class="content-copiable">
                                                            <p class="pi-info-item__desc ">Nam</p>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div class="pi-info-item pi-info-item_horizontal">
                                                    <div class="pi-info-item__content">
                                                        <span class="pi-info-item__title" data-translate-inner="STR_PROFILE_LABEL_BIRTHDAY">Ngày sinh</span>
                                                        <span class="content-copiable">
                                                            <p class="pi-info-item__desc ">28 tháng 09, 2003</p>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div class="pi-info-item pi-info-item_horizontal">
                                                    <div class="pi-info-item__content">
                                                        <span class="pi-info-item__title" data-translate-inner="STR_PROFILE_PHONENUMBER">Điện thoại</span>
                                                        <span class="content-copiable">
                                                            <p class="pi-info-item__desc ">+84 974 867 266</p>
                                                        </span>
                                                    </div>
                                                    <p class="pi-info-item__subtitle ">Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này</p>
                                                </div>
                                            </div>
                                            <div class="pi-info-section__cta">
                                                <div class="seperator"></div>
                                                <div class="z--btn--v2 btn-tertiary-neutral medium  --full-width" data-disabled="" title=""><i class="fa fa-pencil-alt mr-4"></i><span data-translate-inner="STR_UPDATE">Cập nhật</span></div>
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
    <div class="zl-mini-notification mn-modal"></div>

            </div>
        </div>
        </div>
    );
}

export default infomationAccount;