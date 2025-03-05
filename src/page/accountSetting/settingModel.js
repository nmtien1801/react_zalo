import React, { useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Dropdown } from 'react-bootstrap';

import './settingModel.css';

const settingModel = ({toggleModalSetting}) => {

    return (


        <div className="zl-modal animated fadeIn">
        <div className="zl-modal__container flx-1 flx flx-center flx-al-c ovf-hidden">
            <div className="zl-modal__dialog flx flx-col animated zoomIn no-border">
            <div className="zl-modal__dialog-body no-padding">

            <div id="setting" className="setting flx" >
   <div className="setting-menu tg-slide-in-left-enter-done">
      <div className="setting-menu__header"><span target="p" className="setting-menu__title" data-translate-inner="STR_ZALO_SETTING">Cài đặt</span></div>
      <div className="setting-menu__item flx middle-flex clickable selected">
         <div className="setting-menu__wrapper-content truncate">
            <i className="fa fa-cog setting-menu__icon"></i>
            <p className="setting-menu__name truncate"><span data-translate-inner="STR_GENERAL">Cài đặt chung</span></p>
         </div>
      </div>
      <div className="setting-menu__item flx middle-flex clickable ">
         <div className="setting-menu__wrapper-content truncate">
            <i className="fa fa-lock setting-menu__icon"></i>
            <p className="setting-menu__name truncate"><span data-translate-inner="STR_SETTINGS_PRIVACY">Quyền riêng tư</span></p>
         </div>
      </div>
      <div className="setting-menu__item flx middle-flex clickable ">
         <div className="setting-menu__wrapper-content truncate">
            <i className="fa fa-tint setting-menu__icon"></i>
            <p className="setting-menu__name truncate"><span data-translate-inner="STR_SETTINGS_THEME">Giao diện</span></p>
         </div>
      </div>
      <div className="setting-menu__item flx middle-flex clickable ">
         <div className="setting-menu__wrapper-content truncate">
            <i className="fa fa-bell setting-menu__icon"></i>
            <p className="setting-menu__name truncate"><span data-translate-inner="STR_CONFIG_NOTI">Thông báo</span></p>
         </div>
      </div>
      <div className="setting-menu__item flx middle-flex clickable ">
         <div className="setting-menu__wrapper-content truncate">
            <i className="fa fa-comment setting-menu__icon"></i>
            <p className="setting-menu__name truncate"><span data-translate-inner="STR_SETTING_MSG">Tin nhắn</span></p>
         </div>
      </div>
      <div className="setting-menu__item flx middle-flex clickable ">
         <div className="setting-menu__wrapper-content truncate">
            <i className="fa fa-wrench setting-menu__icon"></i>
            <p className="setting-menu__name truncate"><span data-translate-inner="STR_UTILITIES">Tiện ích</span></p>
         </div>
      </div>
   </div>
   <div id="setting-right" className="flx flx-col flx-1 setting-right w0 setting--content-right tg-slide-in-right-enter-done" >
      <div icon="close f16" className="z--btn--v2 btn-tertiary-neutral medium setting__close --full-rounded icon-only setting__close" data-disabled="" title="" onClick={toggleModalSetting}><i className="fa fa-close f16 pre"></i></div>
      <div className="stack-navigation" >
         <div className="stack-page appear-done enter-done">
            <div className="zstack-child-1">
               <div className="zstack-child-2">
                  <div className="setting--bottom">
                     <div className="pb-[12px]"></div>
                     <div className="flx flx-al-c setting-section setting-right w100 bs" >
                        <div className="setting-section-label">
                           <div className="z-badge"><span data-translate-inner="STR_SETTING_CONTACT" >Danh bạ</span></div>
                        </div>
                     </div>
                     <div className="setting-section">
                        <div className="setting-section-desc"><span data-translate-inner="STR_SETTING_CONTACT_DES">Danh sách bạn bè được hiển thị trong danh bạ</span></div>
                        <div className="setting-section-content ">
                           <div className="flx flx-al-c flx-sp-btw setting-section-content__item general first" >
                              <span data-translate-inner="STR_SHOW_ALL_CONTACT">Hiển thị tất cả bạn bè</span>
                              <div className="z-radio z-radio" title="">
                                <input type="radio" name="hidden_contacts" value="1" selected/>
                              </div>
                           </div>
                           <div className="flx flx-al-c flx-sp-btw setting-section-content__item general last pt-12">
                              <span data-translate-inner="STR_SHOW_ACTIVE_CONTACT">Chỉ hiển thị bạn bè đang sử dụng Zalo</span>
                              <div className="z-radio z-radio--active" title="">
                                <input type="radio" name="hidden_contacts" value="0" />
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="setting-section">
                        <div className="setting-section-label">
                           <div className="z-badge"><span data-translate-inner="STR_SETTINGS_MENU_LANGUAGE">Ngôn ngữ</span></div>
                        </div>
                        <div className="setting-section-content ">
                           <div className="flx flx-al-c flx-sp-btw setting-section-content__item single no-click">
                              <div className="flx flx-col" ><span data-translate-inner="SET_SETTINGS_CHANGE_LANGUAGE">Thay đổi ngôn ngữ</span></div>
                                <div className="flx flx-al-c z-dropdown-preview --square --l" >
                                    <select name="languages" id="languages">
                                        <option value="vi">Tiếng Việt</option>
                                        <option value="en">English</option>
                                    </select>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div >
                  <div></div>
               </div>
               <div id="scroll-vertical" >
                  <div ></div>
               </div>
            </div>
         </div>
      </div>
   </div>
</div>

            </div>
            </div>
        </div>
        </div>
        
    );

}

export default settingModel;