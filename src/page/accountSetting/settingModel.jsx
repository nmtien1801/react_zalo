import React, { useEffect, useState } from "react";
import SettingGeneral from "./settingGeneral";
import SettingPrivate from "./settingPrivate";
import SettingSecurity from "./settingSecurity";

import './settingModel.css';

const settingModel = ({ toggleModalSetting }) => {
   const [selected, setSelected] = useState("general");



   return (
      <div className="zl-modal animated fadeIn">
         <div className="zl-modal__container flx-1 flx flx-center flx-al-c ovf-hidden">
            <div className="zl-modal__dialog flx flx-col animated zoomIn no-border">
               <div className="zl-modal__dialog-body no-padding">

                  <div id="setting" className="setting flx" >
                     {/* left */}
                     <div className="setting-menu tg-slide-in-left-enter-done">
                        <div className="setting-menu__header"><span target="p" className="setting-menu__title" data-translate-inner="STR_ZALO_SETTING">Cài đặt</span></div>

                        <div className={`setting-menu__item flx middle-flex clickable ${selected === "general" ? "selected" : ""
                           }`}
                           onClick={() => setSelected("general")}>
                           <div className="setting-menu__wrapper-content truncate">
                              <i className="fa fa-cog setting-menu__icon"></i>
                              <p className="setting-menu__name truncate"><span data-translate-inner="STR_GENERAL">Cài đặt chung</span></p>
                           </div>
                        </div>

                        <div className={`setting-menu__item flx middle-flex clickable ${selected === "security" ? "selected" : ""
                           }`}
                           onClick={() => setSelected("security")}>
                           <div className="setting-menu__wrapper-content truncate">
                              <i className="fa fa-user setting-menu__icon"></i>
                              <p className="setting-menu__name truncate"><span data-translate-inner="STR_GENERAL">Tài khoản và bảo mật</span></p>
                           </div>
                        </div>
                        <div className={`setting-menu__item flx middle-flex clickable ${selected === "private" ? "selected" : ""
                           }`}
                           onClick={() => setSelected("private")}>
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

                     {/* right */}
                     {selected === "general" && <SettingGeneral toggleModalSetting={toggleModalSetting} />}
                     {selected === "security" && <SettingSecurity toggleModalSetting={toggleModalSetting} />}
                     {selected === "private" && <SettingPrivate toggleModalSetting={toggleModalSetting} />}
                  </div>

               </div>
            </div>
         </div>
      </div>

   );

}

export default settingModel;